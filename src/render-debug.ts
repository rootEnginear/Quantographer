import {canvasElement, canvasContext} from './element'
import {renderOption} from './option'

const debugLineStyle = 'rgb(192, 192, 128)'

const debugLineWidth = 1

const debugLineDash = [7, 5]

export const drawDebug = () => {
  const {
    width: canvasWidth,
    height: canvasHeight
  } = canvasElement

  canvasContext.save()

  canvasContext.strokeStyle = debugLineStyle

  canvasContext.lineWidth = debugLineWidth

  canvasContext.setLineDash(debugLineDash)

  for (let x = 0; x < canvasWidth; x += renderOption.gridSize) {
    const p = new Path2D()

    p.moveTo(x, 0)
    p.lineTo(x, canvasHeight)

    canvasContext.stroke(p)
  }

  for (let y = 0; y < canvasHeight; y += renderOption.gridSize) {
    const p = new Path2D()

    p.moveTo(0, y)
    p.lineTo(canvasWidth, y)

    canvasContext.stroke(p)
  }

  canvasContext.restore()
}
