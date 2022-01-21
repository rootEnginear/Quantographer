import {canvasContext} from './element'

import {renderOption} from './option'

import circuit from './circuit'

export const drawMeasure = (quBit: number, bit: number) => {
  const dist = Math.abs(quBit - bit)
  const length = (dist + circuit.qubitCount + 1) * renderOption.gridSize

  const line = new Path2D

  line.moveTo(-renderOption.bitLineSpacing, 0)
  line.lineTo(-renderOption.bitLineSpacing, length - renderOption.mArrowHeight)

  line.moveTo(renderOption.bitLineSpacing, 0)
  line.lineTo(renderOption.bitLineSpacing, length - renderOption.mArrowHeight)

  canvasContext.lineWidth = renderOption.bitLineWidth

  canvasContext.strokeStyle = 'black'

  canvasContext.stroke(line)

  const arrow = new Path2D

  arrow.moveTo(0, length - renderOption.bitLineSpacing)
  arrow.lineTo(-renderOption.mArrowWidth, length - renderOption.mArrowHeight)
  arrow.lineTo(renderOption.mArrowWidth, length - renderOption.mArrowHeight)

  canvasContext.fillStyle = 'black'

  canvasContext.fill(arrow)

  drawHolder()

  const meter = new Path2D

  const meterOffset = renderOption.halfGateSize - 6

  meter.arc(0, meterOffset, meterOffset, -Math.PI, 0)

  meter.moveTo(0, meterOffset)
  meter.lineTo(meterOffset, -meterOffset)

  canvasContext.lineWidth = renderOption.gateBorderWidth

  canvasContext.strokeStyle = 'black'

  canvasContext.stroke(meter)
}

export const drawBarrier = () => {
  const line = new Path2D

  line.moveTo(0, -renderOption.halfGridSize)
  line.lineTo(0, renderOption.halfGridSize)

  canvasContext.strokeStyle = 'black'

  canvasContext.lineWidth = renderOption.qubitLineWidth

  canvasContext.setLineDash(renderOption.barrierLineDash)

  canvasContext.stroke(line)
}

export const drawControl = () => {
  const dot = new Path2D

  const halfCGateSize = renderOption.cGateSize / 2

  dot.arc(0, 0, halfCGateSize, -Math.PI, Math.PI)

  canvasContext.fillStyle = 'black'

  canvasContext.fill(dot)
}

export const drawHolder = () => {
  const body = new Path2D

  body.rect(
    -renderOption.halfGateSize,
    -renderOption.halfGateSize,
    renderOption.gateSize,
    renderOption.gateSize
  )

  canvasContext.fillStyle = 'white'
  canvasContext.strokeStyle = 'black'

  canvasContext.lineWidth = renderOption.gateBorderWidth

  canvasContext.fill(body)
  canvasContext.stroke(body)
}

export const drawGateRelation = (from: number, to: number, single: boolean) => {
  const dist = to - from
  const absDist = Math.abs(dist)
  const length = dist * renderOption.gridSize

  const line = new Path2D

  line.moveTo(0, 0)

  if (single && Math.abs(dist) === 1)
    line.lineTo(0, length)
  else {
    const controlX = -renderOption.gridSize * 0.7 * Math.exp(absDist / 10.5)
    const controlY = length / (absDist * 1.6)

    line.quadraticCurveTo(controlX, controlY, 0, length)
  }

  canvasContext.lineWidth = renderOption.qubitLineWidth

  canvasContext.stroke(line)
}

export const drawGate = (type: string) => {
  drawHolder()

  canvasContext.font = renderOption.gateTypeFont

  canvasContext.textBaseline = 'middle'
  canvasContext.textAlign = 'center'

  canvasContext.fillStyle = 'black'

  canvasContext.fillText(type, 0, 0)
}

export const drawControlXGate = () => {
  const halfCXGateSize = renderOption.cxGateSize / 2

  const gateRect = new Path2D

  gateRect.arc(0, 0, halfCXGateSize, -Math.PI, Math.PI)

  gateRect.moveTo(-halfCXGateSize, 0)
  gateRect.lineTo(halfCXGateSize, 0)

  gateRect.moveTo(0, -halfCXGateSize)
  gateRect.lineTo(0, halfCXGateSize)

  canvasContext.fillStyle = 'white'
  canvasContext.strokeStyle = 'black'

  canvasContext.lineWidth = renderOption.gateBorderWidth

  canvasContext.fill(gateRect)
  canvasContext.stroke(gateRect)
}
