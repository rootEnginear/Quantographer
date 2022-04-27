import {renderConfig} from './config'
import {circuitData} from './data'

import {populateOperation} from './op'
import {addButtonDraglistener, deepClone, getLocationInfo, getOpSpan, opOverlaps} from './util'

export const svgNamespace = 'http://www.w3.org/2000/svg'

export const workbenchElement = document.querySelector<SVGElement>('#workbench')!

const zoomInButton = document.querySelector<HTMLElement>('#zoom-in-btn')!
const zoomOutButton = document.querySelector<HTMLElement>('#zoom-out-btn')!
const zoomLevelSelector = document.querySelector<HTMLSelectElement>('#zoom-level')!
const newGateArea = document.querySelector<HTMLElement>('#new-gate-area')!

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
        async (e) => {
          e.stopPropagation()

          let newName: string
          for (;;) {
            const newNamePrompt = await new Promise<string | null>(
              // @ts-expect-error
              (res) => window.alertify.prompt(
                'Quantographer',
                'Rename qubit',
                name,
                (_: any, val: string) => res(val),
                () => res(null)
              )
            )
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

      labelElement.addEventListener(
        'mousedown',
        (e) => {
          e.stopPropagation()
          if (e.buttons !== 4) return
          // @ts-expect-error
          window.alertify.confirm(
            'Quantographer',
            'Are you sure to delete this qubit?',

            () => {
              const customOpsWidth = (name: string) => {
                const prop = circuitData.customOperations[name]
                return prop.type === 'rotation' ? 1 : prop.qubitCount
              }

              const {ops} = circuitData
              let opIndex = ops.length
              while (opIndex) {
                opIndex -= 1
                const op = ops[opIndex]
                if (
                  op.qubit === i ||
                  'controlQubits' in op && op.controlQubits.includes(i) ||
                  op.type === 'custom' && i >= op.qubit && i <= op.qubit + customOpsWidth(op.template) ||
                  op.type === 'barrier' && i >= op.qubit && i <= op.qubit + op.qubitSpan ||
                  op.type === 'swap' && i == op.targetQubit
                )
                  ops.splice(opIndex, 1)
              }
              ops.forEach(
                (op) => {
                  if (op.qubit > i) {
                    op.qubit -= 1
                    if ('controlQubits' in op) {
                      const newC: number[] = []
                      op.controlQubits.forEach(
                        (ii) => {
                          if (ii > i)
                            newC.push(ii - 1)
                          else
                            newC.push(ii)
                        }
                      )
                      op.controlQubits.splice(0, op.controlQubits.length, ...newC)
                    }
                  }
                }
              )

              qubits.splice(i, 1)

              // @ts-expect-error
              window.updateCodeOutput?.()

              clearOps()
              clearTrack()

              populateTrack()
              populateOps()

              adjustWorkbenchSize()
            },
            () => {}
          )
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
        async (e) => {
          e.stopPropagation()

          let newName: string
          for (;;) {
            const newNamePrompt = await new Promise<string | null>(
              // @ts-expect-error
              (res) => window.alertify.prompt(
                'Quantographer',
                'Rename bit',
                name,
                (_: any, val: string) => res(val),
                () => res(null)
              )
            )
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

      labelElement.addEventListener(
        'mousedown',
        (e) => {
          e.stopPropagation()
          if (e.buttons !== 4) return
          // @ts-expect-error
          window.alertify.confirm(
            'Quantographer',
            'Are you sure to delete this bit?',

            () => {
              const {ops} = circuitData
              let opIndex = ops.length
              while (opIndex) {
                opIndex -= 1
                const op = ops[opIndex]
                if (
                  'controlBits' in op && op.controlBits.some(
                    (b) => b.index == i
                  )
                )
                  ops.splice(opIndex, 1)
              }
              ops.forEach(
                (op) => {
                  if ('controlBits' in op)
                    op.controlBits.forEach(
                      (e) => {
                        if (e.index > i)
                          e.index -= 1
                      }
                    )
                }
              )

              bits.splice(i, 1)

              // @ts-expect-error
              window.updateCodeOutput?.()

              clearOps()
              clearTrack()

              populateTrack()
              populateOps()

              adjustWorkbenchSize()
            },
            () => {}
          )
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
    case 'ctrl': {
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

          // @ts-expect-error
          window.updateCodeOutput?.()
          break
        }
      }
      break
    }
    case 'ctrlbit': {
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
        !('controlBits' in opToAdd)
      ) return
      // find suitable bit for control
      for (let ctrlIndex = 0; ctrlIndex < circuitData.bits.length; ctrlIndex += 1) {
        const addedControl = {
          index: ctrlIndex,
          invert: false,
          value: 1
        }
        // try adding control
        const newOp = deepClone(opToAdd)
        newOp.controlBits.push(addedControl)
        // measure its span
        const opSpan = getOpSpan(newOp)
        if (
          // not already existed
          opToAdd.controlBits.every(
            (entry) => entry.index !== ctrlIndex
          ) &&
          // not overlap with anything
          stepOperations.every(
            (op, i) => !(opOverlaps(getOpSpan(op), opSpan) && i !== opToAddIndex)
          )
        ) {
          opToAdd.controlBits.push(addedControl)
          clearOps()
          populateOps()
          // @ts-expect-error
          window.updateCodeOutput?.()
          break
        }
      }
      break
    }
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
      ) return
      const i = circuitData.ops.push(op) - 1
      populateOperation(op, i)
      // @ts-expect-error
      window.updateCodeOutput()
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
      qubit: qubit + 1,
      active: false,

      controlBits: [],
      controlQubits: [qubit]
    }
  // @ts-expect-error
  case 'toff':
    return {
      type: 'x',
      step,
      qubit: qubit + 2,
      active: false,

      controlBits: [],
      controlQubits: [
        qubit,
        qubit + 1
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
      params: []
    }
  default:
    if (type.startsWith('custom:')) {
      const subtype = type.replace('custom:', '')
      return {
        type: 'custom',
        step,
        qubit,
        active: false,

        template: subtype
      }
    }
    throw new Error('unknow gate')
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
    const startLoc = getLocationInfo(e.offsetX, e.offsetY)

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

    endX = e.offsetX / renderConfig.zoomLevel
    endY = e.offsetY / renderConfig.zoomLevel

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

    if (startLoc.bitType === 'qubit' || endLoc.bitType === 'qubit')
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


const getFileName = () => circuitData.metadata.name

const updateNameInDom = () => {
  const name = `${circuitData.metadata.name} — Quantographer`
  document.title = name
  document.getElementById('filename')!.textContent = name
}

const setFileName = (name: string) => {
  circuitData.metadata.name = name
  updateNameInDom()
}

const getApiKey = () => circuitData.metadata.key

const updateApiInDom = () => {
  document.getElementById('ibmkey')!.textContent = getApiKey() ? 'Change your key' : 'Connect to IBMQ'
}

const setApiKey = (key: string) => {
  circuitData.metadata.key = key
  updateApiInDom()
}

zoomLevelSelector.addEventListener(
  'change',
  () => {
    const val = zoomLevelSelector.value
    renderConfig.zoomLevel = +val

    adjustWorkbenchSize()
  }
)

const setZoomLevel = (target: number) => {
  zoomLevelSelector.selectedIndex = target
  zoomLevelSelector.dispatchEvent(
    new Event('change')
  )
}

const changeZoomLevel = (offset: number) => {
  const {options, selectedIndex} = zoomLevelSelector
  const target = selectedIndex + offset
  if (target < 0 || target > options.length - 1) return
  setZoomLevel(target)
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
  const loadedCircuitData = JSON.parse(data) as Circuit
  Object.assign(
    circuitData,
    loadedCircuitData
  )

  // @ts-expect-error
  window.updateCodeOutput()

  updateNameInDom()
  updateApiInDom()

  clearOps()
  clearTrack()

  populateTrack()
  populateOps()

  adjustWorkbenchSize()

  addCustomGatesUI()
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

const addCustomGateUI = (name: string) => {
  const userGateBtn = document.createElement('button')

  userGateBtn.draggable = true

  userGateBtn.classList.add('toolbar-btn')
  userGateBtn.classList.add('gate')
  userGateBtn.classList.add('fluid')
  userGateBtn.classList.add('custom')

  userGateBtn.dataset.gateid = 'custom:' + name
  userGateBtn.dataset.tooltip = name + ' Gate'

  userGateBtn.textContent = name

  addButtonDraglistener(userGateBtn)

  newGateArea.prepend(userGateBtn)
}

const addCustomGate = (name: string, gate: CustomGateProperties) => {
  if (name in circuitData.customOperations)
    throw new Error('duplicate name')

  circuitData.customOperations[name] = gate

  addCustomGateUI(name)
}

const addCustomGatesUI = () => {
  for (const name in circuitData.customOperations)
    addCustomGateUI(name)
}

const saveFile = () => {
  const data = JSON.stringify(circuitData)
  saveFileDialog('circuit.json', data)
}

const generateQasm = (): string => `
OPENQASM 2.0;
include "qelib1.inc";
qreg q[${circuitData.qubits.length}];
creg c[${circuitData.bits.length}];
${
  circuitData.ops
    .map(
      (op) => op.toString()
    )
    .join('\n')
}
`

const appendNewQubit = () => {
  const {qubits} = circuitData
  let i = 0
  while (
    qubits.some(
      (qub) => qub.name === `${i}`
    )
  ) i += 1

  qubits.push(
    {
      name: `${i}`
    }
  )

  clearOps()
  clearTrack()

  populateTrack()
  populateOps()
  // @ts-expect-error
  window.updateCodeOutput?.()

  adjustWorkbenchSize()
}

const appendNewBit = () => {
  const {bits} = circuitData
  let i = 0
  while (
    bits.some(
      (b) => b.name == `${i}`
    )
  ) i += 1

  bits.push(
    {
      name: `${i}`,
      size: 1
    }
  )

  clearOps()
  clearTrack()

  populateTrack()
  populateOps()
  // @ts-expect-error
  window.updateCodeOutput?.()

  adjustWorkbenchSize()
}

// @ts-expect-error
window.updateCodeOutput?.()

updateNameInDom()
updateApiInDom()

populateTrack()
populateOps()

adjustWorkbenchSize()

addCustomGatesUI()

Object.assign(
  window,
  {
    chooseAndLoadFile,
    saveFile,
    addCustomGate,
    generateQasm,
    setZoomLevel,
    changeZoomLevel,
    getFileName,
    setFileName,
    getApiKey,
    setApiKey,
    appendNewQubit,
    appendNewBit
  }
)
