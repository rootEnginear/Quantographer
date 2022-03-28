import {renderConfig} from './config'
import {circuitData} from './data'

import {populateOperation} from './op'
import {deepClone, getLocationInfo, getOpSpan, opOverlaps} from './util'

export const svgNamespace = 'http://www.w3.org/2000/svg'

export const workbenchElement = document.querySelector<SVGElement>('#workbench')!

const zoomInButton = document.querySelector<HTMLElement>('#zoom-in-btn')!
const zoomOutButton = document.querySelector<HTMLElement>('#zoom-out-btn')!
const zoomLevelSelector = document.querySelector<HTMLSelectElement>('#zoom-level')!

// create drawing layers
const trackGroupElement = document.createElementNS(svgNamespace, 'g')
export const opGroupElement = document.createElementNS(svgNamespace, 'g')
const opGroupOverlayElement = document.createElementNS(svgNamespace, 'g')
workbenchElement.append(trackGroupElement, opGroupOverlayElement, opGroupElement)

export const trackLabelGroupElement = document.createElementNS(svgNamespace, 'g')
export const trackLineGroupElement = document.createElementNS(svgNamespace, 'g')

trackGroupElement.append(trackLabelGroupElement, trackLineGroupElement)

const calcOperationSize = (): {width: number, height: number} => {
  const {
    stepWidth,
    qubitLaneHeight,
    bitLaneHeight,
    headerPadding
  } = renderConfig

  const {qubits, bits, ops} = circuitData

  const overlongStep = 2 + (
    ops.length === 0 ?
      0 :
      Math.max(
        ... ops.map(
          (op) => op.step
        )
      )
  )

  const opWidth = stepWidth * overlongStep + headerPadding
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
      labelElement.classList.add('opaque')

      labelElement.addEventListener(
        'dblclick',
        (e) => {
          e.stopPropagation()

          let newName: string
          for (;;) {
            const newNamePrompt = prompt('Rename qubit', name)
            // press cancel
            if (newNamePrompt === null) return
            // validation
            if (!newNamePrompt.trim()) continue
            // update
            newName = newNamePrompt
            break
          }

          item.name = newName

          clearTrack()
          populateTrack()
          adjustWorkbenchSize()
        }
      )

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
      labelElement.classList.add('opaque')

      labelElement.addEventListener(
        'dblclick',
        (e) => {
          e.stopPropagation()

          let newName: string
          for (;;) {
            const newNamePrompt = prompt('Rename qubit', name)
            // press cancel
            if (newNamePrompt === null) return
            // validation
            if (!newNamePrompt.trim()) continue
            // update
            newName = newNamePrompt
            break
          }

          item.name = newName

          clearTrack()
          populateTrack()
          adjustWorkbenchSize()
        }
      )

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
  opGroupOverlayElement.style.transform = `translateX(${labelsWidth}px)`
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

    const loc = getLocationInfo(e.offsetX, e.offsetY)
    switch (gateid) {
    case 'ctrl':
      const stepOperations = circuitData.ops.filter(
        (op) => op.step === loc.step
      )
      const opToAddIndex = stepOperations.findIndex(
        (op) => op.qubit === loc.index || 'targetQubit' in op && op.targetQubit === loc.index
      )
      // drag on nothing, stop
      if (opToAddIndex === -1) return
      const opToAdd = stepOperations[opToAddIndex]
      if (
        !('controlQubits' in opToAdd)
      ) return
      // find suitable qubit for control
      for (let ctrlIndex = 0; ctrlIndex < circuitData.qubits.length; ctrlIndex += 1) {
        // don't place on these location
        if (
          opToAdd.controlQubits.includes(ctrlIndex) ||
          ctrlIndex === opToAdd.qubit ||
          'targetQubit' in opToAdd && ctrlIndex === opToAdd.targetQubit
        ) continue
        // try adding control
        const newOp = deepClone(opToAdd)
        newOp.controlQubits.push(ctrlIndex)
        // measure its span
        const opSpan = getOpSpan(newOp)
        if (
          // not overlap with anything
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
      // TODO: might show some feedback here?
      break
    default:
      const op = constructOperation(gateid as OperationTypes, loc.index, loc.step)
      const opSpan = getOpSpan(op)
      if (
        !op ||
        // prevent gate span out of qubit lane
        opSpan.qubit.lower < 0 ||
        opSpan.qubit.upper >= circuitData.qubits.length ||
        // prevent overlaps
        circuitData.ops.some(
          (opi) => opOverlaps(
            getOpSpan(opi),
            opSpan
          )
        )
      ) return // TODO: might show some feedback in here?
      const i = circuitData.ops.push(op) - 1
      populateOperation(op, i)
    }
    adjustWorkbenchSize()
  }
)

const constructOperation = (type: OperationTypes, qubit: number, step: number): Operation => {
  switch (type) {
  // @ts-expect-error
  case 'cnot':
    return {
      type: 'x',
      step,
      qubit,
      active: false,

      controlBits: [],
      controlQubits: [qubit + 1]
    }
  // @ts-expect-error
  case 'toff':
    return {
      type: 'x',
      step,
      qubit,
      active: false,

      controlBits: [],
      controlQubits: [
        qubit + 1,
        qubit + 2
      ]
    }
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
  case 'y':
  case 'z':
  case 'h':
  case 's':
  case 'sdg':
  case 'sx':
  case 'sxdg':
  case '4x':
  case '4xdg':
  case 'sy':
  case 'sydg':
  case '4y':
  case '4ydg':
  case 't':
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
  case 'u1':
  case 'u2':
  case 'u3':
  case 'rx':
  case 'ry':
  case 'rz':
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
const cellHoverElement = document.createElementNS(svgNamespace, 'rect')

workbenchElement.append(selectElement)
opGroupOverlayElement.append(cellHoverElement)

selectElement.setAttribute('fill', 'none')

selectElement.setAttribute('stroke', 'none')
selectElement.setAttribute('stroke-dasharray', '6 5')

cellHoverElement.setAttribute('fill', 'blue')
cellHoverElement.setAttribute('fill-opacity', '0.3')

workbenchElement.addEventListener(
  'mousedown',
  (e) => {
    dragging = true

    circuitData.ops.forEach(
      (op) => op.active = false
    )

    clearOps()
    populateOps()

    startX = endX = e.offsetX / renderConfig.zoomLevel
    startY = endY = e.offsetY / renderConfig.zoomLevel

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
    const eX = e.offsetX / renderConfig.zoomLevel
    const eY = e.offsetY / renderConfig.zoomLevel

    const startLoc = getLocationInfo(eX, eY)

    if (startLoc.laneType === 'op') {
      const startX = renderConfig.stepWidth * startLoc.step
      const startY =
        renderConfig.qubitLaneHeight * (
          startLoc.bitType === 'qubit' ?
            startLoc.index :
            circuitData.qubits.length
        ) + (
          startLoc.bitType === 'qubit' ?
            0 :
            renderConfig.bitLaneHeight * startLoc.index
        )

      cellHoverElement.setAttribute('x', `${startX}`)
      cellHoverElement.setAttribute('y', `${startY}`)

      cellHoverElement.setAttribute('width', `${renderConfig.stepWidth}`)
      cellHoverElement.setAttribute('height', `${startLoc.bitType === 'qubit' ? renderConfig.qubitLaneHeight : renderConfig.bitLaneHeight}`)
    } else {
      cellHoverElement.setAttribute('width', '0')
      cellHoverElement.setAttribute('height', '0')
    }

    if (!dragging) return

    endX = eX
    endY = eY

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

    // swap location to make start location always less than end location
    const rectStartX = Math.min(startX, endX)
    const rectStartY = Math.min(startY, endY)

    const rectLengthX = Math.abs(endX - startX)
    const rectLengthY = Math.abs(endY - startY)

    const startLoc = getLocationInfo(rectStartX, rectStartY)
    const endLoc = getLocationInfo(
      rectStartX + rectLengthX,
      rectStartY + rectLengthY
    )

    const correct = (x: LocationInfo) => {
      if (x.bitType === 'bit') x.index = circuitData.qubits.length - 1
      if (x.laneType === 'head') x.step = 0
    }

    correct(startLoc)
    correct(endLoc)

    const {index: startQubit, step: startStep} = startLoc
    const {index: endQubit, step: endStep} = endLoc

    circuitData.ops.forEach(
      (op) => {
        const {qubit, step} = op
        op.active =
          qubit >= startQubit &&
          qubit <= endQubit &&
          step >= startStep &&
          step <= endStep
      }
    )

    clearOps()
    populateOps()
  }
)

workbenchElement.addEventListener(
  'mouseleave',
  () => {
    cellHoverElement.setAttribute('width', '0')
    cellHoverElement.setAttribute('height', '0')
  }
)

populateTrack()
populateOps()

adjustWorkbenchSize()

zoomLevelSelector.addEventListener(
  'change',
  () => {
    const val = zoomLevelSelector.value
    renderConfig.zoomLevel = +val

    adjustWorkbenchSize()
  }
)

const changeZoomLevel = (offset: number) => {
  const {options, selectedIndex} = zoomLevelSelector
  const target = selectedIndex + offset
  if (target < 0 || target > options.length - 1) return
  zoomLevelSelector.selectedIndex = target
  zoomLevelSelector.dispatchEvent(
    new Event('change')
  )
}

zoomInButton.addEventListener(
  'click',
  () => changeZoomLevel(1)
)

zoomOutButton.addEventListener(
  'click',
  () => changeZoomLevel(-1)
)

// trigger zoom level readout
zoomLevelSelector.dispatchEvent(
  new Event('change')
)

const chooseAndLoadFile = () => {
  const f = document.createElement('input')
  f.type = 'file'
  f.addEventListener(
    'change',
    () => {
      const reader = new FileReader()
      reader.addEventListener(
        'load',
        () => loadCircuit(reader.result as string)
      )
      reader.readAsBinaryString(
        f.files![0]
      )
    }
  )

  f.click()
}

const loadCircuit = (data: string) => {
  const loadedCircuitData = JSON.parse(data)
  Object.assign(
    circuitData,
    loadedCircuitData
  )

  clearOps()
  clearTrack()

  populateTrack()
  populateOps()

  adjustWorkbenchSize()
}

const saveFileDialog = (fileName: string, data: string) => {
  const blobData = new Blob(
    [data],
    {type: 'text/plain'}
  )

  const urlData = URL.createObjectURL(blobData)

  const linkElement = document.createElement('a')

  linkElement.href = urlData
  linkElement.download = fileName

  linkElement.click()

  URL.revokeObjectURL(urlData)
}

const saveFile = () => {
  const data = JSON.stringify(circuitData)
  saveFileDialog('circuit.json', data)
}

Object.assign(
  window,
  {
    chooseAndLoadFile,
    saveFile
  }
)
