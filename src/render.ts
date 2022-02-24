import {renderConfig} from './config'
import {circuitData} from './data'

const svgNamespace = 'http://www.w3.org/2000/svg'

const workbenchElement = document.querySelector<SVGElement>('#workbench')!

// create drawing layers
const trackGroupElement = document.createElementNS(svgNamespace, 'g')
const opGroupElement = document.createElementNS(svgNamespace, 'g')

workbenchElement.append(trackGroupElement, opGroupElement)

const trackLabelGroupElement = document.createElementNS(svgNamespace, 'g')
const trackLineGroupElement = document.createElementNS(svgNamespace, 'g')

trackGroupElement.append(trackLabelGroupElement, trackLineGroupElement)

const calcOperationSize = (): {width: number, height: number} => {
  const {
    stepWidth,
    qubitLaneHeight,
    bitLaneHeight
  } = renderConfig

  const {qubits, bits, ops} = circuitData

  const overlongStep = 2 + Math.max(
    ... ops.map(
      (op) => op.step
    )
  )

  const opWidth = stepWidth * overlongStep
  const opHeight =
    qubitLaneHeight * qubits.length +
    bitLaneHeight * bits.length

  return {
    width: opWidth,
    height: opHeight
  }
}

const populateTrack = () => {
  // prepare data
  const {
    qubitLaneHeight,
    bitLaneHeight,
    bitLineSpacing,
    laneLineThickness,
    headerPadding
  } = renderConfig

  const {qubits, bits} = circuitData

  const {width: opWidth} = calcOperationSize()

  // calculate constants
  const halfQubitLaneHeight = qubitLaneHeight / 2
  const halfBitLaneHeight = bitLaneHeight / 2

  // construct tracks
  const trackLabels: SVGGElement[] = []
  const trackLines: SVGGElement[] = []

  // draw qubit track and label
  qubits.forEach(
    (item, i) => {
      const {name} = item

      const startY = qubitLaneHeight * i + halfQubitLaneHeight

      const labelElement = document.createElementNS(svgNamespace, 'text')

      trackLabels.push(labelElement)

      labelElement.setAttribute('x', '0')
      labelElement.setAttribute('y', `${startY}`)

      labelElement.textContent = `q${name}`

      labelElement.classList.add('track-label')

      const lineElement = document.createElementNS(svgNamespace, 'line')

      trackLines.push(lineElement)

      lineElement.setAttribute('x1', '0')
      lineElement.setAttribute('x2', `${opWidth}`)

      lineElement.setAttribute('y1', `${startY}`)
      lineElement.setAttribute('y2', `${startY}`)

      lineElement.setAttribute('stroke', 'black')
      lineElement.setAttribute('stroke-width', `${laneLineThickness}`)
    }
  )

  // draw bit track and label
  const bitLineStartY = qubitLaneHeight * qubits.length

  bits.forEach(
    (item, i) => {
      const {name} = item

      const startY = bitLineStartY + bitLaneHeight * i + halfBitLaneHeight

      const labelElement = document.createElementNS(svgNamespace, 'text')

      trackLabels.push(labelElement)

      labelElement.setAttribute('x', '0')
      labelElement.setAttribute('y', `${startY}`)

      labelElement.textContent = `c${name}`

      labelElement.classList.add('track-label')

      const startY1 = startY - bitLineSpacing
      const startY2 = startY + bitLineSpacing

      const lineGroupElement = document.createElementNS(svgNamespace, 'g')

      trackLines.push(lineGroupElement)

      const lineElement1 = document.createElementNS(svgNamespace, 'line')
      const lineElement2 = document.createElementNS(svgNamespace, 'line')

      lineElement1.setAttribute('x1', '0')
      lineElement1.setAttribute('x2', `${opWidth}`)

      lineElement1.setAttribute('y1', `${startY1}`)
      lineElement1.setAttribute('y2', `${startY1}`)

      lineElement1.setAttribute('stroke', 'black')
      lineElement1.setAttribute('stroke-width', `${laneLineThickness}`)

      lineElement2.setAttribute('x1', '0')
      lineElement2.setAttribute('x2', `${opWidth}`)

      lineElement2.setAttribute('y1', `${startY2}`)
      lineElement2.setAttribute('y2', `${startY2}`)

      lineElement2.setAttribute('stroke', 'black')
      lineElement2.setAttribute('stroke-width', `${laneLineThickness}`)

      lineGroupElement.append(lineElement1, lineElement2)
    }
  )

  trackLabelGroupElement.append(... trackLabels)
  trackLineGroupElement.append(... trackLines)

  // find maximum track label width
  const {width: rawLabelsWidth} = trackLabelGroupElement.getBBox()

  // add some padding
  const labelsWidth = rawLabelsWidth + headerPadding

  const halfLabelsWidth = labelsWidth / 2

  // move things into the right place
  trackLabelGroupElement.style.transform = `translateX(${halfLabelsWidth}px)`
  trackLineGroupElement.style.transform = `translateX(${labelsWidth}px)`

  opGroupElement.style.transform = `translateX(${labelsWidth}px)`
}

const adjustWorkbenchSize = () => {
  const {zoomLevel} = renderConfig

  const {
    width: opWidth,
    height: opHeight
  } = calcOperationSize()

  const {width: labelsWidth} = trackLabelGroupElement.getBBox()

  const svgWidth = labelsWidth + opWidth

  const finalWidth = svgWidth * zoomLevel
  const finalHeight = opHeight * zoomLevel

  workbenchElement.setAttribute('width', `${finalWidth}`)
  workbenchElement.setAttribute('height', `${finalHeight}`)

  workbenchElement.setAttribute('viewBox', `0 0 ${svgWidth} ${opHeight}`)
}

const populateOps = () => {
  const {ops} = circuitData

  ops.forEach(
    (op, i) => {
      const {type} = op

      switch (type) {
      case 'barrier':
        populateBarrierDirective(op, i)
        break
      case 'reset':
        break
      case 'measure':
        break
      case 'x':
      case 'z':
      case 'h':
        populateGate(op, i)
        break
      }
    }
  )
}

const populateBarrierDirective = (op: BarrierDirective, opIndex: number) => {
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

const populateGate = (op: BaseGate<any>, opIndex: number) => {
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
    type,
    controlQubits,
    controlBits
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

  if (controlBits.length > 0) {
    const maxQubit = Math.max(qubit, ... controlQubits)
    const maxBit = Math.max(
      ... controlBits.map(
        (entry) => entry.index
      )
    )

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

  // construct halo
  const haloElement = document.createElementNS(svgNamespace, 'rect')

  opElement.append(haloElement)

  haloElement.setAttribute('x', `${selectX}`)
  haloElement.setAttribute('y', `${selectY}`)

  haloElement.setAttribute('width', `${selectWidth}`)
  haloElement.setAttribute('height', `${selectHeight}`)

  haloElement.setAttribute('fill', 'none')
}

workbenchElement.addEventListener(
  'dragover',
  (e) => e.preventDefault()
)

workbenchElement.addEventListener(
  'drop',
  () => {}
)

populateTrack()
populateOps()

adjustWorkbenchSize()
