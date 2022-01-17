import {gateButtons, canvasElement} from './element'
import {findTarget, drawCircuit, updateSize, clearCanvas, drawHighlight} from './draw'
import './tooltip'

window.addEventListener(
  'resize',
  () => {
    updateSize()
    drawCircuit()
  }
)

updateSize()
drawCircuit()

for (const gateButton of gateButtons)
  gateButton.addEventListener(
    'dragstart',
    (e) => {
      const {target, dataTransfer} = e
      const node = target as Node
      const transfer = dataTransfer as DataTransfer
      transfer.setData('text/plain', node.textContent ?? 'what')
    }
  )

canvasElement.addEventListener(
  'dragover',
  (e) => {
    e.preventDefault()
    const target = findTarget(e.offsetX, e.offsetY)
    clearCanvas()
    drawCircuit()
    if (target === undefined) return
    const [track, layer] = target
    drawHighlight(track, layer)
  }
)

canvasElement.addEventListener(
  'drop',
  (e) => {
    e.preventDefault()
    const {dataTransfer} = e
    const transfer = dataTransfer as DataTransfer
    const data = transfer.getData('text/plain')
  }
)
