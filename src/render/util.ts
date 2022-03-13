import {renderConfig} from './config'
import {circuitData} from './data'

import {trackLabelGroupElement} from '.'

export const rangeOverlaps = (left: NumberRange, right: NumberRange) => Math.max(left.lower, right.lower) <= Math.min(left.upper, right.upper)

export const deepClone = <T>(target: T): T => {
  if (typeof target !== 'object')
    // primitive type
    return target
  // object type
  // create container
  const newTargert: any = Array.isArray(target) ? [] : {}
  for (const key in target)
    // clone child
    newTargert[key] = deepClone(
      target[key]
    )
  return newTargert
}

export const getLocationInfo = (x: number, y: number): LocationInfo => {
  // prepare data
  const {
    zoomLevel,
    qubitLaneHeight,
    bitLaneHeight,
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
  let laneType = 'head'
  let bitType = 'qubit'

  if (x > labelsWidth) {
    x -= labelsWidth

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

export const getOpSpan = (op: Operation): OpLocation => {
  // prepare data
  const {
    qubits: {
      length: qubitCount
    }
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

export const opOverlaps = (left: OpLocation, right: OpLocation) => rangeOverlaps(left.qubit, right.qubit) && rangeOverlaps(left.step, right.step)
