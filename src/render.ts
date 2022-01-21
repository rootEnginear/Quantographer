import {canvasElement, canvasContext} from './element'

import {renderOption} from './option'

import {
  drawMeasure,
  drawBarrier,
  drawControl,
  drawControlXGate,
  drawGate,
  drawGateRelation
} from './render-gate'

// import {drawDebug} from './render-debug'

import circuit from './circuit'

export const updateSize = () => {
  const {step: circuitStep} = circuit

  const width = renderOption.gridSize * (circuitStep.length + 2)
  const height = renderOption.gridSize * (circuit.qubitCount + circuit.bitCount + 2)

  canvasElement.width = width
  canvasElement.height = height

  canvasElement.style.width = width + 'px'
  canvasElement.style.height = height + 'px'
}

export const clearCanvas = () => {
  // canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)
  canvasContext.fillStyle = 'white'
  canvasContext.fillRect(0, 0, canvasElement.width, canvasElement.height)
}

export const drawCanvas = () => {
  // drawDebug()
  drawCircuit()
}

const drawCircuit = () => {
  const {step: circuitStep} = circuit
  drawTrack()
  for (let s = 0; s < circuitStep.length; s += 1) {
    const step = circuitStep[s]
    for (let i = 0; i < circuit.qubitCount; i += 1) {
      const cell = step[i]
      if (cell) drawCell(s, i, cell)
    }
  }
}

const drawTrack = () => {
  const {step: circuitStep} = circuit

  const circuitWidth = circuitStep.length * renderOption.gridSize

  canvasContext.font = renderOption.ketFont

  canvasContext.textBaseline = 'middle'
  canvasContext.textAlign = 'center'

  canvasContext.fillStyle = 'black'

  canvasContext.lineWidth = renderOption.qubitLineWidth

  /* draw quantum bit line */
  for (let i = 0; i < circuit.qubitCount; i += 1) {
    const centerY = i * renderOption.gridSize + renderOption.halfGridSize

    const ketText = 'q' + i

    canvasContext.fillText(ketText, renderOption.halfGridSize, centerY)

    const {width: ketWidth} = canvasContext.measureText(ketText), halfKetWidth = ketWidth / 2

    const ketStartX = renderOption.halfGridSize - halfKetWidth
    const ketEndX = ketStartX + ketWidth

    const ketPadStart = ketStartX - 3
    const ketPadEnd = ketEndX + 2
    const ketCurve = ketPadEnd + 4

    const ket = new Path2D

    ket.moveTo(ketPadStart, centerY - 12)
    ket.lineTo(ketPadStart, centerY + 11)

    ket.moveTo(ketPadEnd, centerY - 12)
    ket.lineTo(ketCurve, centerY)
    ket.lineTo(ketPadEnd, centerY + 11)

    canvasContext.stroke(ket)

    const lineStartX = renderOption.gridSize

    const track = new Path2D

    track.moveTo(lineStartX, centerY)
    track.lineTo(lineStartX + circuitWidth, centerY)

    canvasContext.stroke(track)
  }

  /* draw classical bit line */
  canvasContext.lineWidth = renderOption.bitLineWidth

  for (let i = 0; i < circuit.bitCount; i += 1) {
    const centerY = (i + circuit.qubitCount + 1) * renderOption.gridSize + renderOption.halfGridSize

    const lineStartX = renderOption.gridSize

    const lineY1 = centerY - renderOption.bitLineSpacing
    const lineY2 = centerY + renderOption.bitLineSpacing

    const line = new Path2D

    line.moveTo(lineStartX, lineY1)
    line.lineTo(lineStartX + circuitWidth, lineY1)

    line.moveTo(lineStartX, lineY2)
    line.lineTo(lineStartX + circuitWidth, lineY2)

    canvasContext.stroke(line)
  }
}

const drawCell = (step: number, bit: number, cell: Gate) => {
  const startX = (step + 1) * renderOption.gridSize
  const startY = bit * renderOption.gridSize

  const centerX = startX + renderOption.halfGridSize
  const centerY = startY + renderOption.halfGridSize

  canvasContext.save()

  canvasContext.translate(centerX, centerY)

  switch (cell.type) {
  case 'm':
    drawMeasure(bit, cell.assign)
    break

  case 'b':
    drawBarrier()
    break

  case 'c':
    drawControl()
    break

  case 'h':
  case 'x':
    const {type: cellType, control: cellControl} = cell

    for (const control of cellControl)
      drawGateRelation(bit, control, cellControl.length === 1)

    if (cell.type === 'x' && cellControl.length > 0)
      drawControlXGate()
    else
      drawGate(cellType)


    break
  }

  canvasContext.restore()
}
