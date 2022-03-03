import {renderConfig} from './config'
import {circuitData} from './data'

import {svgNamespace, opGroupElement} from '.'

const opSymbolMapping: Partial<Record<OperationTypes, string>> = {
  reset: 'reset-operation',
  measure: 'measure-operation',

  x: 'x-gate',
  swap: 'swap-gate',
  sx: 'sx-gate',
  sdg: 'sdg-gate',
  tdg: 'tdg-gate'
}

export const populateBarrierDirective = (op: BarrierDirective, opIndex: number) => {
  // prepare data
  const {
    qubitLaneHeight,
    stepWidth,
    gateSize
  } = renderConfig

  const {qubit, step, span} = op

  // calculate a constants
  const halfStepWidth = stepWidth / 2
  const halfGateSize = gateSize / 2

  // calculate position
  const startX = stepWidth * step, centerX = startX + halfStepWidth

  const startY = qubitLaneHeight * qubit
  const lengthY = qubitLaneHeight * span

  const endY = startY + lengthY

  // construct operation
  const opElement = document.createElementNS(svgNamespace, 'g')

  opGroupElement.append(opElement)

  opElement.dataset.index = `${opIndex}`

  const bodyElement = document.createElementNS(svgNamespace, 'line')

  opElement.append(bodyElement)

  bodyElement.setAttribute('x1', `${centerX}`)
  bodyElement.setAttribute('x2', `${centerX}`)

  bodyElement.setAttribute('y1', `${startY}`)
  bodyElement.setAttribute('y2', `${endY}`)

  bodyElement.setAttribute('stroke', 'black')
  bodyElement.setAttribute('stroke-width', '2')
  bodyElement.setAttribute('stroke-dasharray', '8 4')

  const selectX = centerX - halfGateSize

  // construct halo
  const haloElement = document.createElementNS(svgNamespace, 'rect')

  opElement.append(haloElement)

  haloElement.classList.add('opaque')

  haloElement.setAttribute('x', `${selectX}`)
  haloElement.setAttribute('y', `${startY}`)

  haloElement.setAttribute('width', `${gateSize}`)
  haloElement.setAttribute('height', `${lengthY}`)

  haloElement.setAttribute('fill', 'none')
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

  const {
    qubits: {length: qubitCount}
  } = circuitData

  const {
    qubit,
    step,
    type
  } = op

  // calculate a constants
  const bitLaneStartY = qubitLaneHeight * qubitCount

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
        (entry) => {
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
        (controlQubit) => {
          // calculate position
          const centerY = qubitLaneHeight * controlQubit + halfQubitLaneHeight

          // construct element
          const gateControl = document.createElementNS(svgNamespace, 'circle')

          gateControl.dataset.qubit = `${controlQubit}`

          gateControl.setAttribute('cx', `${centerX}`)
          gateControl.setAttribute('cy', `${centerY}`)

          gateControl.setAttribute('r', `${controlSize}`)

          gateControl.setAttribute('fill', 'blue')

          return gateControl
        }
      )

      opElement.append(controlLine, ... controlPoints)
    }
  }

  if ('assignBit' in op) {
    const {
      assignBit: {
        index
      }
    } = op

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

    opElement.append(controlLine1, controlLine2, assignSymbol)
  }

  const bodyElement = document.createElementNS(svgNamespace, 'g')

  opElement.append(bodyElement)

  if (type === 'swap') {
    const {targetQubit, controlQubits} = op

    // calculate position
    const targetCenterY = qubitLaneHeight * targetQubit + halfQubitLaneHeight

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

    const bodyStartX = centerX - halfGateSize
    const bodyStartY = targetCenterY - halfGateSize

    const useElement = document.createElementNS(svgNamespace, 'use')

    useElement.setAttribute('x', `${bodyStartX}`)
    useElement.setAttribute('y', `${bodyStartY}`)

    useElement.setAttribute('width', `${gateSize}`)
    useElement.setAttribute('height', `${gateSize}`)

    useElement.setAttribute('href', '#swap-gate')

    bodyElement.append(useElement)
  }

  if (type in opSymbolMapping) {
    const bodyStartX = centerX - halfGateSize
    const bodyStartY = centerY - halfGateSize

    const symbolId = opSymbolMapping[type]!

    const useElement = document.createElementNS(svgNamespace, 'use')

    useElement.setAttribute('x', `${bodyStartX}`)
    useElement.setAttribute('y', `${bodyStartY}`)

    useElement.setAttribute('width', `${gateSize}`)
    useElement.setAttribute('height', `${gateSize}`)

    useElement.setAttribute('href', `#${symbolId}`)

    bodyElement.append(useElement)
  } else {
    const bodyStartX = centerX - halfGateSize
    const bodyStartY = centerY - halfGateSize

    const boxElement = document.createElementNS(svgNamespace, 'use')

    boxElement.setAttribute('x', `${bodyStartX}`)
    boxElement.setAttribute('y', `${bodyStartY}`)

    boxElement.setAttribute('width', `${gateSize}`)
    boxElement.setAttribute('height', `${gateSize}`)

    boxElement.setAttribute('href', '#operation-container')

    const labelElement = document.createElementNS(svgNamespace, 'text')

    labelElement.setAttribute('x', `${centerX}`)
    labelElement.setAttribute('y', `${centerY}`)

    labelElement.classList.add('gate-label')

    labelElement.textContent = type

    bodyElement.append(boxElement, labelElement)
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

  // add halo after calculate region
  opElement.append(haloElement)

  haloElement.setAttribute('x', `${selectX}`)
  haloElement.setAttribute('y', `${selectY}`)

  haloElement.setAttribute('width', `${selectWidth}`)
  haloElement.setAttribute('height', `${selectHeight}`)

  haloElement.setAttribute('fill', 'none')
}
