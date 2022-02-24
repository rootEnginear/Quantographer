import {renderConfig} from './config'
import {circuitData} from './data'

import {svgNamespace, opGroupElement} from './render'

export const populateBarrierDirective = (op: BarrierDirective, opIndex: number) => {
  // prepare data
  const {
    qubitLaneHeight,
    stepWidth,
    gateSize,
    gateBorderThickness
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
  bodyElement.setAttribute('stroke-width', `${gateBorderThickness}`)
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
    gateBorderThickness,
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

      const centerX1 = centerX - bitLineSpacing
      const centerX2 = centerX + bitLineSpacing

      const centerLineY1 = qubitLaneHeight * maxQubit + halfQubitLaneHeight
      const centerLineY2 = bitLaneStartY + bitLaneHeight * maxBit + halfBitLaneHeight

      const controlLine1 = document.createElementNS(svgNamespace, 'line')
      const controlLine2 = document.createElementNS(svgNamespace, 'line')

      controlLine1.setAttribute('x1', `${centerX1}`)
      controlLine1.setAttribute('x2', `${centerX1}`)

      controlLine1.setAttribute('y1', `${centerLineY1}`)
      controlLine1.setAttribute('y2', `${centerLineY2}`)

      controlLine1.setAttribute('stroke', 'black')
      controlLine1.setAttribute('stroke-width', `${laneLineThickness}`)

      controlLine2.setAttribute('x1', `${centerX2}`)
      controlLine2.setAttribute('x2', `${centerX2}`)

      controlLine2.setAttribute('y1', `${centerLineY1}`)
      controlLine2.setAttribute('y2', `${centerLineY2}`)

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

      opElement.append(controlLine1, controlLine2, ... controlPoints)
    }
  }

  if ('controlQubits' in op) {
    const {controlQubits} = op

    if (controlQubits.length > 0) {
      const qubits = [qubit, ... controlQubits]

      const minQubit = Math.min(... qubits)
      const maxQubit = Math.max(... qubits)

      const centerLineY1 = qubitLaneHeight * minQubit + halfQubitLaneHeight
      const centerLineY2 = qubitLaneHeight * maxQubit + halfQubitLaneHeight

      // construct element
      const controlLine = document.createElementNS(svgNamespace, 'line')

      controlLine.setAttribute('x1', `${centerX}`)
      controlLine.setAttribute('x2', `${centerX}`)

      controlLine.setAttribute('y1', `${centerLineY1}`)
      controlLine.setAttribute('y2', `${centerLineY2}`)

      controlLine.setAttribute('stroke', 'black')
      controlLine.setAttribute('stroke-width', `${laneLineThickness}`)

      const controlPoints = controlQubits.map(
        (controlQubit, i) => {
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

  const bodyElement = document.createElementNS(svgNamespace, 'g')

  opElement.append(bodyElement)

  if (0) {
    // TODO: change gate body by condition
    // TODO: change gate body to template symbol if exists
  } else {
    const bodyStartX = centerX - halfGateSize
    const bodyStartY = centerY - halfGateSize

    const boxElement = document.createElementNS(svgNamespace, 'rect')

    boxElement.setAttribute('x', `${bodyStartX}`)
    boxElement.setAttribute('y', `${bodyStartY}`)

    boxElement.setAttribute('width', `${gateSize}`)
    boxElement.setAttribute('height', `${gateSize}`)

    boxElement.setAttribute('fill', 'white')

    boxElement.setAttribute('stroke', 'black')
    boxElement.setAttribute('stroke-width', `${gateBorderThickness}`)

    const labelElement = document.createElementNS(svgNamespace, 'text')

    labelElement.setAttribute('x', `${centerX}`)
    labelElement.setAttribute('y', `${centerY}`)

    labelElement.classList.add('gate-label')

    labelElement.textContent = type[0]

    bodyElement.append(boxElement, labelElement)
  }

  bodyElement.addEventListener(
    'contextmenu',
    (e) => {
      e.stopPropagation()
      e.preventDefault()
    }
  )

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
