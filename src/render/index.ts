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

export {
  svgNamespace,
  workbenchElement,
  opGroupElement,
  trackLabelGroupElement,
  trackLineGroupElement
}

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

      lineElement1.setAttribute('y1', `${startY1}`)
      lineElement1.setAttribute('y2', `${startY1}`)

      lineElement1.setAttribute('stroke', 'black')
      lineElement1.setAttribute('stroke-width', `${laneLineThickness}`)

      lineElement2.setAttribute('x1', '0')

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

  trackLineGroupElement
    .querySelectorAll('line')
    .forEach(
      (line) => line.setAttribute('x2', `${opWidth}`)
    )

  const svgWidth = labelsWidth + opWidth

  const finalWidth = svgWidth * zoomLevel
  const finalHeight = opHeight * zoomLevel

  workbenchElement.setAttribute('width', `${finalWidth}`)
  workbenchElement.setAttribute('height', `${finalHeight}`)

  workbenchElement.setAttribute('viewBox', `0 0 ${svgWidth} ${opHeight}`)
}

import {populateOperation} from './op'

const populateOps = () => {
  const {ops} = circuitData

  ops.forEach(populateOperation)
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
