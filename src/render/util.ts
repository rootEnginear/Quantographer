import {renderConfig} from './config'
import {circuitData} from './data'

import {trackLabelGroupElement} from '.'

export const addButtonDraglistener = (btn: HTMLElement) => btn.addEventListener(
  'dragstart',
  (e) => {
    const {target, dataTransfer} = e

    const transfer = dataTransfer as DataTransfer
    const elem = target as HTMLElement

    const {
      dataset: {
        gateid = ''
      }
    } = elem

    // move cursor to the center of drag body
    transfer.setDragImage(
      elem,
      window.devicePixelRatio * (elem.offsetWidth / 2),
      window.devicePixelRatio * (elem.offsetHeight / 2)
    )

    // because Chrome doesn't allow reading data on other drag events
    // except drop. to circumvent the issue, we attach data as a type instead.
    // it can be seen from every event.
    transfer.setData(gateid, '')

    transfer.effectAllowed = 'copy'
  }
)

export const rangeOverlaps = (left: NumberRange, right: NumberRange) => Math.max(left.lower, right.lower) <= Math.min(left.upper, right.upper)

export {deepClone} from '../util'

export const getLocationInfo = (x: number, y: number): LocationInfo => {
  // prepare data
  const {
    zoomLevel,
    qubitLaneHeight,
    bitLaneHeight,
    headerPadding,
    stepWidth
  } = renderConfig

  const {qubits} = circuitData

  // calculate constants
  const bitLineStartY = qubitLaneHeight * qubits.length

  // read stat
  const {width: labelsWidth} = trackLabelGroupElement.getBBox()

  x /= zoomLevel
  y /= zoomLevel

  // do estimation
  let laneType: LocationInfo['laneType'] = 'head'
  let bitType: LocationInfo['bitType'] = 'qubit'

  if (x > labelsWidth) {
    x -= labelsWidth + headerPadding

    laneType = 'op'
  }

  x /= stepWidth

  if (y > bitLineStartY) {
    // bit lane
    y -= bitLineStartY
    y /= bitLaneHeight

    bitType = 'bit'
  } else
    // qubit lane
    y /= qubitLaneHeight

  return {
    laneType,
    bitType,

    step: Math.floor(x),
    index: Math.floor(y)
  }
}

export const getOpSpan = (op: Operation): OperationLocation => {
  // prepare data
  const {
    qubits: {
      length: qubitCount
    },
    customOperations
  } = circuitData

  const {step, qubit} = op

  // eslint-disable-next-line
  let minStep = step
  // eslint-disable-next-line
  let maxStep = step

  let minQubit = qubit
  let maxQubit = qubit

  // any operation with associate bit
  if (
    'assignBit' in op && op.assignBit ||
    'controlBits' in op && op.controlBits.length
  )
    maxQubit = qubitCount - 1

  // operation with control
  if ('controlQubits' in op) {
    const {controlQubits} = op

    minQubit = Math.min(minQubit, ... controlQubits)
    maxQubit = Math.max(maxQubit, ... controlQubits)
  }

  // operation with additional elements
  if ('targetQubit' in op) {
    const {targetQubit} = op

    minQubit = Math.min(minQubit, targetQubit)
    maxQubit = Math.max(maxQubit, targetQubit)
  }

  // operation that span across multiple qubit
  if ('qubitSpan' in op) {
    const {qubitSpan} = op

    maxQubit = Math.max(maxQubit, qubit + qubitSpan - 1)
  }

  if ('template' in op) {
    const {template} = op

    const custom = customOperations[template]!

    // rotation interact on 1 qubt
    const qubitSpan = custom.type === 'rotation' ? 1 : custom.qubitCount

    maxQubit = Math.max(maxQubit, qubit + qubitSpan - 1)
  }

  return {
    step: {
      lower: minStep,
      upper: maxStep
    },
    qubit: {
      lower: minQubit,
      upper: maxQubit
    }
  }
}

export const opOverlaps = (left: OperationLocation, right: OperationLocation) => rangeOverlaps(left.qubit, right.qubit) && rangeOverlaps(left.step, right.step)
