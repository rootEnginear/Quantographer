import {renderConfig} from './config'
import {circuitData} from './data'

import {
  svgNamespace,

  workbenchElement,
  opGroupElement,

  adjustWorkbenchSize,
  clearOps,
  populateOps
} from '.'

import {
  deepClone,
  getOpSpan,
  getLocationInfo,
  opOverlaps
} from './util'

const opSymbolMapping: Partial<OperationRegistry<string>> = {
  reset: 'reset-operation',
  measure: 'measure-operation',

  x: 'x-gate',
  sdg: 'sdg-gate',
  tdg: 'tdg-gate',
  sx: 'sx-gate',
  sxdg: 'sxdg-gate',
  '4x': '4x-gate',
  '4xdg': '4xdg-gate',
  sy: 'sy-gate',
  sydg: 'sydg-gate',
  '4y': '4y-gate',
  '4ydg': '4ydg-gate'
}

export const populateOperation = (op: Operation, opIndex: number) => {
  // prepare data
  const {
    qubitLaneHeight,
    bitLaneHeight,
    stepWidth,
    gateSize,
    gateOutlinePadding,
    controlSize,
    laneLineThickness,
    bitLineSpacing
  } = renderConfig

  const {qubits, ops} = circuitData

  const {qubit, step, type, active} = op

  // calculate a constants
  const bitLaneStartY = qubitLaneHeight * qubits.length

  const halfStepWidth = stepWidth / 2
  const halfQubitLaneHeight = qubitLaneHeight / 2
  const halfBitLaneHeight = bitLaneHeight / 2
  const halfGateSize = gateSize / 2

  const doubleGateOutlineSize = gateOutlinePadding * 2

  // calculate position
  const centerX = stepWidth * step + halfStepWidth
  const centerY = qubitLaneHeight * qubit + halfQubitLaneHeight

  // construct operation
  const opElement = document.createElementNS(svgNamespace, 'g')

  opGroupElement.append(opElement)

  opElement.dataset.index = `${opIndex}`

  // construct halo
  const haloElement = document.createElementNS(svgNamespace, 'rect')

  haloElement.classList.add('halo')

  opElement.append(haloElement)

  if ('controlBits' in op) {
    const {controlBits} = op

    if (controlBits.length > 0) {
      const maxBit = Math.max(
        ... controlBits.map(
          (entry) => entry.index
        )
      )

      let maxQubit = qubit

      if ('controlQubits' in op) {
        const {controlQubits} = op

        maxQubit = Math.max(maxQubit, ... controlQubits)
      }

      if ('targetQubit' in op) {
        const {targetQubit} = op

        maxQubit = Math.max(maxQubit, targetQubit)
      }

      const centerX1 = centerX - bitLineSpacing
      const centerX2 = centerX + bitLineSpacing

      const startY = qubitLaneHeight * maxQubit + halfQubitLaneHeight
      const endY = bitLaneStartY + bitLaneHeight * maxBit + halfBitLaneHeight

      const controlLineGroup = document.createElementNS(svgNamespace, 'g')

      const controlLine1 = document.createElementNS(svgNamespace, 'line')
      const controlLine2 = document.createElementNS(svgNamespace, 'line')

      controlLineGroup.append(controlLine1, controlLine2)

      controlLine1.setAttribute('x1', `${centerX1}`)
      controlLine1.setAttribute('x2', `${centerX1}`)

      controlLine1.setAttribute('y1', `${startY}`)
      controlLine1.setAttribute('y2', `${endY}`)

      controlLine1.setAttribute('stroke', 'black')
      controlLine1.setAttribute('stroke-width', `${laneLineThickness}`)

      controlLine2.setAttribute('x1', `${centerX2}`)
      controlLine2.setAttribute('x2', `${centerX2}`)

      controlLine2.setAttribute('y1', `${startY}`)
      controlLine2.setAttribute('y2', `${endY}`)

      controlLine2.setAttribute('stroke', 'black')
      controlLine2.setAttribute('stroke-width', `${laneLineThickness}`)

      const controlPoints = controlBits.map(
        (entry, entryIndex) => {
          // prepare data
          const {index, invert} = entry

          // calculate position
          const centerY = bitLaneStartY + bitLaneHeight * index + halfBitLaneHeight

          const fillColor = invert ? 'white' : 'black'

          // construct element
          const gateControl = document.createElementNS(svgNamespace, 'circle')

          gateControl.dataset.bit = `${index}`

          gateControl.setAttribute('cx', `${centerX}`)
          gateControl.setAttribute('cy', `${centerY}`)

          gateControl.setAttribute('r', `${controlSize}`)

          gateControl.setAttribute('stroke', 'black')
          gateControl.setAttribute('stroke-width', `${laneLineThickness}`)

          gateControl.setAttribute('fill', fillColor)

          gateControl.addEventListener(
            'mousedown',
            (e) => {
              e.preventDefault()
              e.stopPropagation()

              if (e.buttons === 4) {
                // delete
                controlBits.splice(entryIndex, 1)

                opElement.remove()

                // create updated varsion
                populateOperation(op, opIndex)

                return
              }

              if (e.buttons !== 1) return

              // new operation to be changed and validated
              let newBit = index

              // change is valid
              let changeValid = false

              const updateValid = (b: boolean) => {
                // update flag
                changeValid = b

                // visual feedback
                workbenchElement.style.cursor = b ? 'ns-resize' : 'not-allowed'
              }

              const moveHandler = (e: MouseEvent) => {
                const {
                  laneType,
                  bitType,

                  step: movedStep,
                  index: movedBit
                } = getLocationInfo(e.offsetX, e.offsetY)

                if (
                  bitType !== 'bit' ||
                  laneType !== 'op' ||
                  movedStep !== step
                ) return updateValid(false)

                newBit = movedBit

                const failed =
                  // overlaps with other control bit
                  controlBits.some(
                    (prop) => prop.index === movedBit
                  )

                // update flag and feedback
                updateValid(
                  !failed
                )
              }

              const upHandler = () => {
                workbenchElement.style.cursor = ''

                workbenchElement.removeEventListener('mousemove', moveHandler)
                workbenchElement.removeEventListener('mouseup', upHandler)

                if (!changeValid) return

                entry.index = newBit

                opElement.remove()

                // create updated varsion
                populateOperation(op, opIndex)
              }

              workbenchElement.addEventListener('mousemove', moveHandler)
              workbenchElement.addEventListener('mouseup', upHandler)
            }
          )

          return gateControl
        }
      )

      opElement.append(controlLineGroup, ... controlPoints)
    }
  }

  if ('controlQubits' in op) {
    const {controlQubits} = op

    if (controlQubits.length > 0) {
      const qubits = [qubit, ... controlQubits]

      let minQubit = Math.min(... qubits)
      let maxQubit = Math.max(... qubits)

      if ('targetQubit' in op) {
        const {targetQubit} = op

        minQubit = Math.min(minQubit, targetQubit)
        maxQubit = Math.max(maxQubit, targetQubit)
      }

      const startY = qubitLaneHeight * minQubit + halfQubitLaneHeight
      const endY = qubitLaneHeight * maxQubit + halfQubitLaneHeight

      // construct element
      const controlLine = document.createElementNS(svgNamespace, 'line')

      controlLine.setAttribute('x1', `${centerX}`)
      controlLine.setAttribute('x2', `${centerX}`)

      controlLine.setAttribute('y1', `${startY}`)
      controlLine.setAttribute('y2', `${endY}`)

      controlLine.setAttribute('stroke', 'black')
      controlLine.setAttribute('stroke-width', `${laneLineThickness}`)

      const controlPoints = controlQubits.map(
        (controlQubit, entryIndex) => {
          // calculate position
          const centerY = qubitLaneHeight * controlQubit + halfQubitLaneHeight

          // construct element
          const gateControl = document.createElementNS(svgNamespace, 'circle')

          gateControl.dataset.qubit = `${controlQubit}`

          gateControl.setAttribute('cx', `${centerX}`)
          gateControl.setAttribute('cy', `${centerY}`)

          gateControl.setAttribute('r', `${controlSize}`)

          gateControl.setAttribute('fill', 'blue')

          gateControl.addEventListener(
            'mousedown',
            (e) => {
              e.preventDefault()
              e.stopPropagation()

              if (e.buttons === 4) {
                // delete
                controlQubits.splice(entryIndex, 1)

                opElement.remove()

                // create updated varsion
                populateOperation(op, opIndex)

                return
              }

              if (e.buttons !== 1) return

              // new operation to be changed and validated
              let newQubit = controlQubit

              // change is valid
              let changeValid = false

              const updateValid = (b: boolean) => {
                // update flag
                changeValid = b

                // visual feedback
                workbenchElement.style.cursor = b ? 'ns-resize' : 'not-allowed'
              }

              const moveHandler = (e: MouseEvent) => {
                const {
                  laneType,
                  bitType,

                  step: movedStep,
                  index: movedQubit
                } = getLocationInfo(e.offsetX, e.offsetY)

                if (
                  bitType !== 'qubit' ||
                  laneType !== 'op' ||
                  movedStep !== step
                ) return updateValid(false)

                newQubit = movedQubit

                const opSpan: OperationLocation = {
                  step: {
                    lower: step,
                    upper: step
                  },
                  qubit: {
                    lower: newQubit,
                    upper: newQubit
                  }
                }

                const failed =
                  // moved over its control qubit
                  controlQubits.includes(newQubit) ||

                  // moved over its gate
                  newQubit === qubit ||

                  'targetQubit' in op && newQubit === op.targetQubit ||

                  // overlaps with other operation
                  ops.some(
                    (op, index) => opIndex !== index && opOverlaps(getOpSpan(op), opSpan)
                  )

                // update flag and feedback
                updateValid(
                  !failed
                )
              }

              const upHandler = () => {
                workbenchElement.style.cursor = ''

                workbenchElement.removeEventListener('mousemove', moveHandler)
                workbenchElement.removeEventListener('mouseup', upHandler)

                if (!changeValid) return

                controlQubits[entryIndex] = newQubit

                opElement.remove()

                // create updated varsion
                populateOperation(op, opIndex)
              }

              workbenchElement.addEventListener('mousemove', moveHandler)
              workbenchElement.addEventListener('mouseup', upHandler)
            }
          )

          return gateControl
        }
      )

      opElement.append(controlLine, ... controlPoints)
    }
  }

  if ('assignBit' in op) {
    const {assignBit} = op
    const {index} = assignBit

    const assignSymbolSize = controlSize * 2.5, halfAssignSymbolSize = assignSymbolSize / 2

    const centerX1 = centerX - bitLineSpacing
    const centerX2 = centerX + bitLineSpacing

    const startY = qubitLaneHeight * qubit + halfQubitLaneHeight
    const endY = bitLaneStartY + bitLaneHeight * index + halfBitLaneHeight

    const stopY = endY - halfAssignSymbolSize

    const assignSymbolX = centerX - halfAssignSymbolSize
    const assignSymbolY = endY - assignSymbolSize

    const controlLine1 = document.createElementNS(svgNamespace, 'line')
    const controlLine2 = document.createElementNS(svgNamespace, 'line')

    const assignSymbol = document.createElementNS(svgNamespace, 'use')

    controlLine1.setAttribute('x1', `${centerX1}`)
    controlLine1.setAttribute('x2', `${centerX1}`)

    controlLine1.setAttribute('y1', `${startY}`)
    controlLine1.setAttribute('y2', `${stopY}`)

    controlLine1.setAttribute('stroke', 'black')
    controlLine1.setAttribute('stroke-width', `${laneLineThickness}`)

    controlLine2.setAttribute('x1', `${centerX2}`)
    controlLine2.setAttribute('x2', `${centerX2}`)

    controlLine2.setAttribute('y1', `${startY}`)
    controlLine2.setAttribute('y2', `${stopY}`)

    controlLine2.setAttribute('stroke', 'black')
    controlLine2.setAttribute('stroke-width', `${laneLineThickness}`)

    assignSymbol.setAttribute('x', `${assignSymbolX}`)
    assignSymbol.setAttribute('y', `${assignSymbolY}`)

    assignSymbol.setAttribute('width', `${assignSymbolSize}`)
    assignSymbol.setAttribute('height', `${assignSymbolSize}`)

    assignSymbol.setAttribute('href', '#symmetric-triangle')

    assignSymbol.addEventListener(
      'mousedown',
      (e) => {
        e.stopPropagation()
        e.preventDefault()

        // new operation to be changed and validated
        let newBit = index

        // change is valid
        let changeValid = false

        const updateValid = (b: boolean) => {
          // update flag
          changeValid = b

          // visual feedback
          workbenchElement.style.cursor = b ? 'ns-resize' : 'not-allowed'
        }

        const moveHandler = (e: MouseEvent) => {
          const {
            laneType,
            bitType,

            step: movedStep,
            index: movedBit
          } = getLocationInfo(e.offsetX, e.offsetY)

          if (
            bitType !== 'bit' ||
            laneType !== 'op' ||
            movedStep !== step
          ) return updateValid(false)

          newBit = movedBit

          // update flag and feedback
          updateValid(true)
        }

        const upHandler = () => {
          workbenchElement.style.cursor = ''

          workbenchElement.removeEventListener('mousemove', moveHandler)
          workbenchElement.removeEventListener('mouseup', upHandler)

          if (!changeValid) return

          assignBit.index = newBit

          opElement.remove()

          // create updated varsion
          populateOperation(op, opIndex)
        }

        workbenchElement.addEventListener('mousemove', moveHandler)
        workbenchElement.addEventListener('mouseup', upHandler)
      }
    )

    opElement.append(controlLine1, controlLine2, assignSymbol)
  }

  const activateGate = (e: MouseEvent) => {
    let active = !op.active

    if (!e.shiftKey) {
      ops.forEach(
        (op) => op.active = false
      )
      active = true
    }

    op.active = active

    // update halo of other operation
    ops.forEach(
      (op, i) => {
        const e = opGroupElement.querySelector(`g[data-index="${i}"]>.halo`)!
        e.setAttribute('stroke', op.active ? 'red' : 'none')
      }
    )
  }

  // ------------ gate rendition ------------

  if (type === 'barrier') {
    // populate barrier
    const {qubitSpan: span} = op

    const startX = centerX - halfGateSize

    const startY = qubitLaneHeight * qubit
    const lengthY = qubitLaneHeight * span

    const endY = startY + lengthY

    const bodyElement = document.createElementNS(svgNamespace, 'g')

    opElement.append(bodyElement)

    const lineElement = document.createElementNS(svgNamespace, 'line')

    lineElement.setAttribute('x1', `${centerX}`)
    lineElement.setAttribute('x2', `${centerX}`)

    lineElement.setAttribute('y1', `${startY}`)
    lineElement.setAttribute('y2', `${endY}`)

    lineElement.setAttribute('stroke', 'black')
    lineElement.setAttribute('stroke-width', '2')
    lineElement.setAttribute('stroke-dasharray', '8 4')

    const hitElement = document.createElementNS(svgNamespace, 'rect')

    hitElement.setAttribute('x', `${startX}`)
    hitElement.setAttribute('y', `${startY}`)

    hitElement.setAttribute('width', `${gateSize}`)
    hitElement.setAttribute('height', `${lengthY}`)

    hitElement.setAttribute('fill', 'none')

    hitElement.classList.add('opaque')

    bodyElement.append(lineElement, hitElement)

    bodyElement.addEventListener(
      'mousedown',
      (e) => {
        // stop bubbling
        e.preventDefault()
        e.stopPropagation()

        if (e.buttons === 4) {
          // delete
          ops.splice(opIndex, 1)

          clearOps()
          populateOps()

          adjustWorkbenchSize()

          return
        }

        if (e.buttons !== 1) return

        activateGate(e)

        // new operation to be changed and validated
        const newOp = deepClone(op)

        // change is valid
        let changeValid = false

        const updateValid = (b: boolean) => {
          // update flag
          changeValid = b

          // visual feedback
          workbenchElement.style.cursor = b ? 'move' : 'not-allowed'
        }

        // qubit offset
        const {index: startQubit} = getLocationInfo(e.offsetX, e.offsetY), qubitOffset = startQubit - qubit

        const moveHandler = (e: MouseEvent) => {
          const {
            laneType,
            bitType,

            step: movedStep,
            index: movedQubit
          } = getLocationInfo(e.offsetX, e.offsetY)

          if (
            bitType !== 'qubit' ||
            laneType !== 'op'
          ) return updateValid(false)

          newOp.step = movedStep
          newOp.qubit = movedQubit - qubitOffset // can move from any span of barrier!

          const opSpan = getOpSpan(newOp)

          const failed =
            // barrier spans out of qubit lane
            opSpan.qubit.lower < 0 ||
            opSpan.qubit.upper >= qubits.length ||

            // overlaps with other operation
            ops.some(
              (op, index) => opIndex !== index && opOverlaps(getOpSpan(op), opSpan)
            )

          // update flag and feedback
          updateValid(
            !failed
          )
        }

        const upHandler = () => {
          workbenchElement.style.cursor = ''

          workbenchElement.removeEventListener('mousemove', moveHandler)
          workbenchElement.removeEventListener('mouseup', upHandler)

          if (!changeValid) return

          op.qubit = newOp.qubit
          op.step = newOp.step

          // resize workbench in case of moved to the far right
          adjustWorkbenchSize()

          opElement.remove()

          // create updated varsion
          populateOperation(op, opIndex)
        }

        workbenchElement.addEventListener('mousemove', moveHandler)
        workbenchElement.addEventListener('mouseup', upHandler)
      }
    )

    const resizeElement = document.createElementNS(svgNamespace, 'rect')

    bodyElement.append(resizeElement)

    const resizeStartY = endY - halfQubitLaneHeight - 7.5
    resizeElement.setAttribute('x', `${startX}`)
    resizeElement.setAttribute('y', `${resizeStartY}`)

    resizeElement.setAttribute('width', `${gateSize}`)
    resizeElement.setAttribute('height', '15')

    resizeElement.setAttribute('fill', 'none')
    resizeElement.setAttribute('fill-opacity', '0.3')

    let resizing = false

    resizeElement.addEventListener(
      'mousedown',
      (e) => {
        // stop bubbling
        e.stopPropagation()
        e.preventDefault()

        resizing = true

        // new operation to be changed and validated
        const newOp = deepClone(op)

        // change is valid
        let changeValid = false

        const updateValid = (b: boolean) => {
          // update flag
          changeValid = b

          // visual feedback
          workbenchElement.style.cursor = b ? 'ns-resize' : 'not-allowed'
        }

        const moveHandler = (e: MouseEvent) => {
          const {
            laneType,
            bitType,

            step: movedStep,
            index: movedQubit
          } = getLocationInfo(e.offsetX, e.offsetY)

          if (
            bitType !== 'qubit' ||
            laneType !== 'op' ||
            movedStep !== step
          ) return updateValid(false)

          newOp.qubitSpan = movedQubit - newOp.qubit + 1

          const opSpan = getOpSpan(newOp)

          const failed =
            // barrier spans out of qubit lane
            newOp.qubit < 0 ||
            newOp.qubit + newOp.qubitSpan > qubits.length ||

            newOp.qubitSpan < 1 ||

            // overlaps with other operation
            ops.some(
              (op, index) => opIndex !== index && opOverlaps(getOpSpan(op), opSpan)
            )

          // update flag and feedback
          updateValid(
            !failed
          )
        }

        const upHandler = () => {
          workbenchElement.style.cursor = ''

          workbenchElement.removeEventListener('mousemove', moveHandler)
          workbenchElement.removeEventListener('mouseup', upHandler)

          if (!changeValid) return

          op.qubitSpan = newOp.qubitSpan

          opElement.remove()

          // create updated varsion
          populateOperation(op, opIndex)
        }

        workbenchElement.addEventListener('mousemove', moveHandler)
        workbenchElement.addEventListener('mouseup', upHandler)
      }
    )

    // show/hide resize gutter
    bodyElement.addEventListener(
      'mouseenter',
      () => resizeElement.setAttribute('fill', 'black')
    )

    bodyElement.addEventListener(
      'mouseleave',
      () => !resizing && resizeElement.setAttribute('fill', 'none')
    )
  } else if (type === 'swap') {
    // populate swap
    const {targetQubit, controlQubits} = op

    // calculate position
    const targetCenterY = qubitLaneHeight * targetQubit + halfQubitLaneHeight

    const startX = centerX - halfGateSize
    const startY = centerY - halfGateSize
    const targetStartY = targetCenterY - halfGateSize

    const bodyElement = document.createElementNS(svgNamespace, 'g')

    opElement.append(bodyElement)

    if (controlQubits.length === 0) {
      const bridgeLine = document.createElementNS(svgNamespace, 'line')

      bridgeLine.setAttribute('x1', `${centerX}`)
      bridgeLine.setAttribute('x2', `${centerX}`)

      bridgeLine.setAttribute('y1', `${centerY}`)
      bridgeLine.setAttribute('y2', `${targetCenterY}`)

      bridgeLine.setAttribute('stroke', 'black')
      bridgeLine.setAttribute('stroke-width', `${laneLineThickness}`)

      bodyElement.append(bridgeLine)
    }

    const useElement1 = document.createElementNS(svgNamespace, 'use')

    useElement1.setAttribute('x', `${startX}`)
    useElement1.setAttribute('y', `${startY}`)

    useElement1.setAttribute('width', `${gateSize}`)
    useElement1.setAttribute('height', `${gateSize}`)

    useElement1.setAttribute('href', '#swap-gate')

    useElement1.classList.add('opaque')

    const useElement2 = document.createElementNS(svgNamespace, 'use')

    useElement2.setAttribute('x', `${startX}`)
    useElement2.setAttribute('y', `${targetStartY}`)

    useElement2.setAttribute('width', `${gateSize}`)
    useElement2.setAttribute('height', `${gateSize}`)

    useElement2.setAttribute('href', '#swap-gate')

    useElement2.classList.add('opaque')

    bodyElement.append(useElement1, useElement2)

    useElement1.addEventListener(
      'mousedown',
      (e) => {
        // stop bubbling
        e.stopPropagation()
        e.preventDefault()

        if (e.buttons === 4) {
          // delete
          ops.splice(opIndex, 1)

          clearOps()
          populateOps()

          adjustWorkbenchSize()

          return
        }

        if (e.buttons !== 1) return

        activateGate(e)

        // new operation to be changed and validated
        const newOp = deepClone(op)

        // change is valid
        let changeValid = false

        const updateValid = (b: boolean) => {
          // update flag
          changeValid = b

          // visual feedback
          workbenchElement.style.cursor = b ? 'move' : 'not-allowed'
        }

        const moveHandler = (e: MouseEvent) => {
          const {
            laneType,
            bitType,

            step: movedStep,
            index: movedQubit
          } = getLocationInfo(e.offsetX, e.offsetY)

          if (
            bitType !== 'qubit' ||
            laneType !== 'op'
          ) return updateValid(false)

          newOp.step = movedStep
          newOp.qubit = movedQubit

          const opSpan = getOpSpan(newOp)

          const failed =
            // moved over itself
            qubit === movedQubit && movedStep === step ||
            targetQubit === movedQubit ||

            // moved over its control qubits
            'controlQubits' in op && op.controlQubits.includes(movedQubit) ||

            // overlaps with other operation
            ops.some(
              (op, index) => opIndex !== index && opOverlaps(getOpSpan(op), opSpan)
            )

          // update flag and feedback
          updateValid(
            !failed
          )
        }

        const upHandler = () => {
          workbenchElement.style.cursor = ''

          workbenchElement.removeEventListener('mousemove', moveHandler)
          workbenchElement.removeEventListener('mouseup', upHandler)

          if (!changeValid) return

          op.qubit = newOp.qubit
          op.step = newOp.step

          // resize workbench in case of moved to the far right
          adjustWorkbenchSize()

          opElement.remove()

          // create updated varsion
          populateOperation(op, opIndex)
        }

        workbenchElement.addEventListener('mousemove', moveHandler)
        workbenchElement.addEventListener('mouseup', upHandler)
      }
    )

    useElement2.addEventListener(
      'mousedown',
      (e) => {
        // stop bubbling
        e.stopPropagation()
        e.preventDefault()

        if (e.buttons === 4) {
          // delete
          ops.splice(opIndex, 1)

          clearOps()
          populateOps()

          adjustWorkbenchSize()

          return
        }

        if (e.buttons !== 1) return

        activateGate(e)

        // new operation to be changed and validated
        const newOp = deepClone(op)

        // change is valid
        let changeValid = false

        const updateValid = (b: boolean) => {
          // update flag
          changeValid = b

          // visual feedback
          workbenchElement.style.cursor = b ? 'move' : 'not-allowed'
        }

        const moveHandler = (e: MouseEvent) => {
          const {
            laneType,
            bitType,

            step: movedStep,
            index: movedQubit
          } = getLocationInfo(e.offsetX, e.offsetY)

          if (
            bitType !== 'qubit' ||
            laneType !== 'op'
          ) return updateValid(false)

          newOp.step = movedStep
          newOp.targetQubit = movedQubit

          const opSpan = getOpSpan(newOp)

          const failed =
            // moved over itself
            qubit === movedQubit ||
            targetQubit === movedQubit && movedStep === step ||

            // moved over its control qubits
            'controlQubits' in op && op.controlQubits.includes(movedQubit) ||

            // overlaps with other operation
            ops.some(
              (op, index) => opIndex !== index && opOverlaps(getOpSpan(op), opSpan)
            )

          // update flag and feedback
          updateValid(
            !failed
          )
        }

        const upHandler = () => {
          workbenchElement.style.cursor = ''

          workbenchElement.removeEventListener('mousemove', moveHandler)
          workbenchElement.removeEventListener('mouseup', upHandler)

          if (!changeValid) return

          op.targetQubit = newOp.targetQubit
          op.step = newOp.step

          // resize workbench in case of moved to the far right
          adjustWorkbenchSize()

          opElement.remove()

          // create updated varsion
          populateOperation(op, opIndex)
        }

        workbenchElement.addEventListener('mousemove', moveHandler)
        workbenchElement.addEventListener('mouseup', upHandler)
      }
    )
  } else if (type === 'custom') {
    const {template} = op
    const opInfo = circuitData.customOperations[template]!

    const span = opInfo.type === 'rotation' ? 1 : opInfo.qubitCount

    const startX = centerX - halfGateSize
    const startY = centerY - halfGateSize

    const lengthY = gateSize + (span === 1 ? 0 : (span - 1) * qubitLaneHeight)

    const textCenterY = startY + lengthY / 2

    const mainElement = document.createElementNS(svgNamespace, 'g')

    opElement.append(mainElement)

    const boxElement = document.createElementNS(svgNamespace, 'rect')

    boxElement.setAttribute('x', `${startX}`)
    boxElement.setAttribute('y', `${startY}`)

    boxElement.setAttribute('width', `${gateSize}`)
    boxElement.setAttribute('height', `${lengthY}`)

    boxElement.setAttribute('fill', 'white')

    boxElement.setAttribute('stroke', 'black')
    boxElement.setAttribute('stroke-width', '2')

    const labelElement = document.createElementNS(svgNamespace, 'text')

    labelElement.setAttribute('x', `${centerX}`)
    labelElement.setAttribute('y', `${textCenterY}`)

    labelElement.setAttribute('textLength', `${lengthY}`)
    labelElement.setAttribute('lengthAdjust', 'spacingAndGlyphs')

    labelElement.setAttribute('transform', `rotate(90, ${centerX}, ${textCenterY})`)

    labelElement.classList.add('gate-label')

    labelElement.textContent = template

    mainElement.append(boxElement, labelElement)

    mainElement.addEventListener(
      'mousedown',
      (e) => {
        // stop bubbling
        e.stopPropagation()
        e.preventDefault()

        if (e.buttons === 4) {
          // delete
          ops.splice(opIndex, 1)

          clearOps()
          populateOps()

          adjustWorkbenchSize()

          return
        }

        if (e.buttons !== 1) return

        activateGate(e)

        // new operation to be changed and validated
        const newOp = deepClone(op)

        // change is valid
        let changeValid = false

        const updateValid = (b: boolean) => {
          // update flag
          changeValid = b

          // visual feedback
          workbenchElement.style.cursor = b ? 'move' : 'not-allowed'
        }

        // qubit offset
        const {index: startQubit} = getLocationInfo(e.offsetX, e.offsetY), qubitOffset = startQubit - qubit

        const moveHandler = (e: MouseEvent) => {
          const {
            laneType,
            bitType,

            step: movedStep,
            index: movedQubit
          } = getLocationInfo(e.offsetX, e.offsetY)

          if (
            bitType !== 'qubit' ||
            laneType !== 'op'
          ) return updateValid(false)

          newOp.step = movedStep
          newOp.qubit = movedQubit - qubitOffset

          const opSpan = getOpSpan(newOp)

          const failed =
            // barrier spans out of qubit lane
            opSpan.qubit.lower < 0 ||
            opSpan.qubit.upper >= qubits.length ||

            // moved over itself
            qubit === movedQubit && step === movedStep ||

            // overlaps with other operation
            ops.some(
              (op, index) => opIndex !== index && opOverlaps(getOpSpan(op), opSpan)
            )

          // update flag and feedback
          updateValid(
            !failed
          )
        }

        const upHandler = () => {
          workbenchElement.style.cursor = ''

          workbenchElement.removeEventListener('mousemove', moveHandler)
          workbenchElement.removeEventListener('mouseup', upHandler)

          if (!changeValid) return

          op.qubit = newOp.qubit
          op.step = newOp.step

          // resize workbench in case of moved to the far right
          adjustWorkbenchSize()

          opElement.remove()

          // create updated varsion
          populateOperation(op, opIndex)
        }

        workbenchElement.addEventListener('mousemove', moveHandler)
        workbenchElement.addEventListener('mouseup', upHandler)
      }
    )
  } else {
    let mainElement

    if (type in opSymbolMapping) {
      const startX = centerX - halfGateSize
      const startY = centerY - halfGateSize

      const symbolId = opSymbolMapping[type]!

      mainElement = document.createElementNS(svgNamespace, 'use')

      opElement.append(mainElement)

      mainElement.setAttribute('x', `${startX}`)
      mainElement.setAttribute('y', `${startY}`)

      mainElement.setAttribute('width', `${gateSize}`)
      mainElement.setAttribute('height', `${gateSize}`)

      mainElement.setAttribute('href', `#${symbolId}`)

      mainElement.classList.add('opaque')
    } else {
      const startX = centerX - halfGateSize
      const startY = centerY - halfGateSize

      mainElement = document.createElementNS(svgNamespace, 'g')

      opElement.append(mainElement)

      const boxElement = document.createElementNS(svgNamespace, 'use')

      boxElement.setAttribute('x', `${startX}`)
      boxElement.setAttribute('y', `${startY}`)

      boxElement.setAttribute('width', `${gateSize}`)
      boxElement.setAttribute('height', `${gateSize}`)

      boxElement.setAttribute('href', '#operation-container')

      const labelElement = document.createElementNS(svgNamespace, 'text')

      labelElement.setAttribute('x', `${centerX}`)
      labelElement.setAttribute('y', `${centerY}`)

      labelElement.classList.add('gate-label')

      labelElement.textContent = type

      mainElement.append(boxElement, labelElement)
    }

    mainElement.addEventListener(
      'mousedown',
      (e) => {
        // stop bubbling
        e.stopPropagation()
        e.preventDefault()

        if (e.buttons === 4) {
          // delete
          ops.splice(opIndex, 1)

          clearOps()
          populateOps()

          adjustWorkbenchSize()

          return
        }

        if (e.buttons !== 1) return

        activateGate(e)

        // new operation to be changed and validated
        const newOp = deepClone(op)

        // change is valid
        let changeValid = false

        const updateValid = (b: boolean) => {
          // update flag
          changeValid = b

          // visual feedback
          workbenchElement.style.cursor = b ? 'move' : 'not-allowed'
        }

        const moveHandler = (e: MouseEvent) => {
          const {
            laneType,
            bitType,

            step: movedStep,
            index: movedQubit
          } = getLocationInfo(e.offsetX, e.offsetY)

          if (
            bitType !== 'qubit' ||
            laneType !== 'op'
          ) return updateValid(false)

          newOp.step = movedStep
          newOp.qubit = movedQubit

          const opSpan = getOpSpan(newOp)

          const failed =
            // moved over itself
            qubit === movedQubit && step === movedStep ||

            // moved over its control qubits
            'controlQubits' in op && op.controlQubits.includes(movedQubit) ||

            // overlaps with other operation
            ops.some(
              (op, index) => opIndex !== index && opOverlaps(getOpSpan(op), opSpan)
            )

          // update flag and feedback
          updateValid(
            !failed
          )
        }

        const upHandler = () => {
          workbenchElement.style.cursor = ''

          workbenchElement.removeEventListener('mousemove', moveHandler)
          workbenchElement.removeEventListener('mouseup', upHandler)

          if (!changeValid) return

          op.qubit = newOp.qubit
          op.step = newOp.step

          // resize workbench in case of moved to the far right
          adjustWorkbenchSize()

          opElement.remove()

          // create updated varsion
          populateOperation(op, opIndex)
        }

        workbenchElement.addEventListener('mousemove', moveHandler)
        workbenchElement.addEventListener('mouseup', upHandler)
      }
    )
  }

  const {
    x: opX,
    y: opY,
    width: opWidth,
    height: opHeight
  } = opElement.getBBox()

  const selectX = opX - gateOutlinePadding
  const selectY = opY - gateOutlinePadding

  const selectWidth = opWidth + doubleGateOutlineSize
  const selectHeight = opHeight + doubleGateOutlineSize

  haloElement.setAttribute('x', `${selectX}`)
  haloElement.setAttribute('y', `${selectY}`)

  haloElement.setAttribute('width', `${selectWidth}`)
  haloElement.setAttribute('height', `${selectHeight}`)

  haloElement.setAttribute('fill', 'none')

  haloElement.setAttribute('stroke', active ? 'red' : 'none')
  haloElement.setAttribute('stroke-width', '1.5')
  haloElement.setAttribute('stroke-dasharray', '6 4')
}
