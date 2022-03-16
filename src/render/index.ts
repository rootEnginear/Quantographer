import {renderConfig} from './config'
import {circuitData} from './data'

import {populateOperation} from './op'
import {deepClone, getLocationInfo, getOpSpan, opOverlaps} from './util'

export const svgNamespace = 'http://www.w3.org/2000/svg'

export const workbenchElement = document.querySelector<SVGElement>('#workbench')!

// create drawing layers
const trackGroupElement = document.createElementNS(svgNamespace, 'g')
export const opGroupElement = document.createElementNS(svgNamespace, 'g')

workbenchElement.append(trackGroupElement, opGroupElement)

export const trackLabelGroupElement = document.createElementNS(svgNamespace, 'g')
export const trackLineGroupElement = document.createElementNS(svgNamespace, 'g')

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

export const populateTrack = () => {
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

      lineGroupElement.append(lineElement1, lineElement2)

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

export const clearTrack = () => {
  let elem
  while (elem = trackLabelGroupElement.firstChild) elem.remove()
  while (elem = trackLineGroupElement.firstChild) elem.remove()
}

export const populateOps = () => {
  const {ops} = circuitData

  ops.forEach(populateOperation)
}

export const clearOps = () => {
  let elem
  while (elem = opGroupElement.firstChild) elem.remove()
}

export const adjustWorkbenchSize = () => {
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

workbenchElement.addEventListener(
  'dragover',
  (e) => {
    e.preventDefault()

    const {dataTransfer} = e
    const transfer = dataTransfer as DataTransfer

    const {
      items: [
        {type: gateid}
      ]
    } = transfer

    const loc = getLocationInfo(e.offsetX, e.offsetY)

    transfer.dropEffect =
      loc.laneType === 'op' &&
      loc.bitType === 'qubit' ?
        'copy' :
        'none'
  }
)

workbenchElement.addEventListener(
  'drop',
  (e) => {
    const {dataTransfer} = e
    const transfer = dataTransfer as DataTransfer

    const {
      items: [
        {type: gateid}
      ]
    } = transfer

    console.log(gateid)

    const loc = getLocationInfo(e.offsetX, e.offsetY)
    switch (gateid) {
    case 'ctrl':
      const stepOperations = circuitData.ops.filter(
        (op) => op.step === loc.step
      )
      const opToAddIndex = stepOperations.findIndex(
        (op) => op.qubit === loc.index || 'targetQubit' in op && op.targetQubit === loc.index
      )
      const opToAdd = stepOperations[opToAddIndex]
      console.log(stepOperations, opToAddIndex, opToAdd)
      if (
        !('controlQubits' in opToAdd)
      ) return
      for (let ctrlIndex = 0; ctrlIndex < circuitData.qubits.length; ctrlIndex += 1) {
        if (
          opToAdd.controlQubits.includes(ctrlIndex) ||
          ctrlIndex === opToAdd.qubit ||
          'targetQubit' in opToAdd && ctrlIndex === opToAdd.targetQubit
        ) continue
        const newOp = deepClone(opToAdd)
        newOp.controlQubits.push(ctrlIndex)
        const opSpan = getOpSpan(newOp)
        if (
          stepOperations.every(
            (op, i) => !(opOverlaps(getOpSpan(op), opSpan) && i !== opToAddIndex)
          )
        ) {
          opToAdd.controlQubits.push(ctrlIndex)
          clearOps()
          populateOps()
          break
        }
      }
      break
    default:
      const op = constructOperation(gateid as OperationTypes, loc.index, loc.step)
      if (!op) return
      const i = circuitData.ops.push(op) - 1
      populateOperation(op, i)
    }
  }
)

const constructOperation = (type: OperationTypes, qubit: number, step: number): Operation => {
  switch (type) {
  case 'barrier':
    return {
      type,
      step,
      qubit,
      active: false,

      qubitSpan: 1
    }
  case 'reset':
    return {
      type,
      step,
      qubit,
      active: false,

      controlBits: []
    }
  case 'measure':
    return {
      type,
      step,
      qubit,
      active: false,

      controlBits: [],

      assignBit: {
        index: 0,
        bit: 0
      }
    }
  case 'x':
  case 'z':
  case 'h':
  case 'sx':
  case 'sdg':
  case 'tdg':
    return {
      type,
      step,
      qubit,
      active: false,

      controlBits: [],
      controlQubits: []
    }
  case 'swap':
    return {
      type,
      step,
      qubit,
      active: false,

      controlBits: [],
      controlQubits: [],

      targetQubit: qubit + 1
    }
  case 'u3':
  case 'rx':
    return {
      type,
      step,
      qubit,
      active: false,

      controlBits: [],
      controlQubits: [],
      params: {}
    }
  }
}

let dragging = false

let startX = 0
let startY = 0

let endX = 0
let endY = 0

const selectElement = document.createElementNS(svgNamespace, 'rect')

workbenchElement.append(selectElement)

selectElement.setAttribute('fill', 'none')

selectElement.setAttribute('stroke', 'none')
selectElement.setAttribute('stroke-dasharray', '6 5')

workbenchElement.addEventListener(
  'mousedown',
  (e) => {
    dragging = true

    startX = e.offsetX
    startY = e.offsetY

    selectElement.setAttribute('stroke', 'blue')

    selectElement.setAttribute('x', `${startX}`)
    selectElement.setAttribute('y', `${startY}`)

    selectElement.setAttribute('width', '0')
    selectElement.setAttribute('height', '0')
  }
)

workbenchElement.addEventListener(
  'mousemove',
  (e) => {
    if (!dragging) return

    endX = e.offsetX
    endY = e.offsetY

    const rectStartX = Math.min(startX, endX)
    const rectStartY = Math.min(startY, endY)

    const rectLengthX = Math.abs(endX - startX)
    const rectLengthY = Math.abs(endY - startY)

    selectElement.setAttribute('x', `${rectStartX}`)
    selectElement.setAttribute('y', `${rectStartY}`)

    selectElement.setAttribute('width', `${rectLengthX}`)
    selectElement.setAttribute('height', `${rectLengthY}`)
  }
)

workbenchElement.addEventListener(
  'mouseup',
  () => {
    if (!dragging) return
    dragging = false
    selectElement.setAttribute('stroke', 'none')
  }
)

populateTrack()
populateOps()

adjustWorkbenchSize()
