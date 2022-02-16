import {createApp} from 'vue'
import Menubar from './components/Menubar.vue'

createApp(Menubar).mount('#menu')

import './styles/main.scss'

import {gateButtons, canvasElement} from './element'
import {drawCanvas, clearCanvas, updateSize} from './render'

import './ui/gate_tooltip'

window.addEventListener('resize', () => {
  updateSize()
  clearCanvas()
  drawCanvas()
})

document.fonts.ready.then(() => {
  updateSize()
  clearCanvas()
  drawCanvas()
})

for (const gateButton of gateButtons)
  gateButton.addEventListener('dragstart', (e) => {
    const {target, dataTransfer} = e

    const node = target as Node
    const transfer = dataTransfer as DataTransfer

    const data = node.textContent ?? '?'

    transfer.setData('text/plain', data)

    console.log('dragstart', data)
  })

canvasElement.addEventListener('dragover', (e) => {
  e.preventDefault()

  console.log('dragover', e.offsetX, e.offsetY)
})

canvasElement.addEventListener('drop', (e) => {
  e.preventDefault()

  const {dataTransfer} = e
  const transfer = dataTransfer as DataTransfer
  const data = transfer.getData('text/plain')

  console.log('drop', data)
})

// -----------------------------------------------------------------------------
// Shortcuts
// -----------------------------------------------------------------------------
// Chrome: Ctrl+Shift+N, Ctrl+T, Ctrl+Shift+T, Ctrl+W, Ctrl+Shift+W don't work
// https://stackoverflow.com/questions/7295508/javascript-capture-browser-shortcuts-ctrlt-n-w/7296303#7296303
const handlingShortcuts = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'p')
    togglePalette()


  if (e.ctrlKey && e.key === 'b')
    toggleCode()


  if (e.ctrlKey && e.key === 'e')
    execute()


  if (e.ctrlKey && e.key === 'n')
    location.reload()


  e.stopPropagation()
  e.preventDefault()
  return 0
}

window.addEventListener('keydown', handlingShortcuts)

// -----------------------------------------------------------------------------
// DOM
// -----------------------------------------------------------------------------
const togglePalette = () => {
  document.getElementById('btn-toggle-palette')?.classList.toggle('active')
  document.getElementById('pallette')?.classList.toggle('open')
}

const toggleCode = () => {
  document.getElementById('btn-toggle-code')?.classList.toggle('active')
  document.getElementById('code')?.classList.toggle('open')
}

const execute = () => {
  new window.WinBox({
    class: ['no-full'],
    title: 'Execute'
  })
}

Object.assign(window, {
  execute,
  togglePalette,
  toggleCode
})
