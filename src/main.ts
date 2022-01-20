import { createApp } from 'vue'
import Menubar from './components/Menubar.vue'

createApp(Menubar).mount('#menubar')

import './styles/main.scss'

import { gateButtons, canvasElement } from './element'
import { drawCanvas, clearCanvas, updateSize } from './render'

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
		const { target, dataTransfer } = e

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

	const { dataTransfer } = e
	const transfer = dataTransfer as DataTransfer
	const data = transfer.getData('text/plain')

	console.log('drop', data)
})

// -----------------------------------------------------------------------------
// DOM
// -----------------------------------------------------------------------------
function togglePalette() {
	document.getElementById('pallette')?.classList.toggle('open')
}

function toggleCode() {
	document.getElementById('code')?.classList.toggle('open')
}

const execute = () => {
	new window.WinBox({
		class: ['no-full'],
		title: 'Basic Window',
	})
}

Object.assign(window, { execute, togglePalette, toggleCode })
