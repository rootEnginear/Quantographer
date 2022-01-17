import {canvasElement, canvasContext} from './element'

const fillText = (
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number
) => ctx.fillText(text, x, y)

const strokeRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) => ctx.strokeRect(x, y, w, h)

const fillRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number
) => ctx.fillRect(x, y, w, h)

const strokeLine = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  x2: number,
  y2: number
) => {
  ctx.beginPath()
  ctx.moveTo(x, y)
  ctx.lineTo(x2, y2)
  ctx.closePath()
  ctx.stroke()
}

const roundRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  radius: number,
  fill: boolean,
  stroke: boolean
) => {
  ctx.beginPath()
  ctx.moveTo(x + radius, y)
  ctx.lineTo(x + w - radius, y)
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius)
  ctx.lineTo(x + w, y + h - radius)
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h)
  ctx.lineTo(x + radius, y + h)
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius)
  ctx.lineTo(x, y + radius)
  ctx.quadraticCurveTo(x, y, x + radius, y)
  ctx.closePath()
  if (fill) ctx.fill()
  if (stroke) ctx.stroke()
}

export const updateSize = () => {
  const {width, height} = canvasElement.parentElement!.getBoundingClientRect()
  canvasElement.width = width
  canvasElement.height = height
}

const qBitTrackStartY = 20
const qBitTrackStartX = 20

const qBitTrackLabelWidth = 40

const gateBoxWidth = 30
const gateBoxHeight = 30

const halfGateBoxHeight = gateBoxHeight / 2

const gateBoxDistance = 15

export const findTarget = (x: number, y: number) => {
  if (
    x > qBitTrackStartX + qBitTrackLabelWidth + gateBoxDistance &&
    y > qBitTrackStartY
  ) {
    const realX = x - (qBitTrackStartX + qBitTrackLabelWidth + gateBoxDistance)
    const realY = y - qBitTrackStartY

    const maybeTrack = realY / (gateBoxHeight + gateBoxDistance)
    const maybeLayer = realX / (gateBoxWidth + gateBoxDistance)

    const track = Math.floor(maybeTrack)
    const layer = Math.floor(maybeLayer)

    return [track, layer]
  }
}

export const clearCanvas = () => canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height)

export const drawCircuit = () => {
  const {
    width: canvasWidth
  } = canvasElement

  for (let trackNum = 0; trackNum < 3; trackNum += 1) {
    const trackLineX = qBitTrackStartX + qBitTrackLabelWidth
    const trackY = qBitTrackStartY + trackNum * (gateBoxHeight + gateBoxDistance)
    const trackCenterY = trackY + halfGateBoxHeight

    canvasContext.font = '500 20px sans-serif'

    canvasContext.textBaseline = 'middle'
    canvasContext.textAlign = 'left'

    canvasContext.fillStyle = 'red'
    fillText(canvasContext, 'q', qBitTrackStartX, trackCenterY)
    fillText(canvasContext, `${trackNum}`, qBitTrackStartX + 13, trackCenterY + 12)

    canvasContext.strokeStyle = 'gray'
    canvasContext.lineWidth = 1
    strokeLine(
      canvasContext,
      trackLineX,
      trackCenterY,
      canvasWidth - qBitTrackStartX,
      trackCenterY
    )

    // for (let layerNum = 0; layerNum < 5; layerNum += 1) {
    //   const layerStartX = trackLineX + gateBoxDistance + layerNum * (gateBoxWidth + gateBoxDistance)

    //   canvasContext.fillStyle = 'white'
    //   canvasContext.strokeStyle = 'blue'
    //   canvasContext.lineWidth = 2.4
    //   roundRect(
    //     canvasContext,
    //     layerStartX,
    //     trackY,
    //     gateBoxWidth,
    //     gateBoxHeight,
    //     5,
    //     true,
    //     true
    //   )
    // }
  }
}

export const drawHighlight = (track: number, layer: number) => {
  const x =  qBitTrackStartX + qBitTrackLabelWidth + gateBoxDistance + layer * (gateBoxWidth + gateBoxDistance)
  const y = qBitTrackStartY + track * (gateBoxHeight + gateBoxDistance)

  canvasContext.fillStyle = '#0061FF33'
  // canvasContext.strokeStyle = 'blue'
  canvasContext.lineWidth = 2.4
  fillRect(
    canvasContext,
    x-2,
    y-2,
    gateBoxWidth+4,
    gateBoxHeight+4,
  )
  // roundRect(
  //   canvasContext,
  //   x,
  //   y,
  //   5,
  //   true,
  //   false
  // )
}
