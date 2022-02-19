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
// Accordion
// -----------------------------------------------------------------------------
const computeTotalHeight = (element: HTMLElement) => {
  const relative_height = element.getBoundingClientRect().height

  const {marginTop, marginBottom} = window.getComputedStyle(element)
  const margin_top = parseInt(marginTop)
  const margin_bottom = parseInt(marginBottom)

  return relative_height + margin_top + margin_bottom
}
class Accordion {
  el: HTMLDetailsElement
  summary: HTMLElement | null
  content: HTMLElement | null
  animation: Animation | null
  isClosing: boolean
  isExpanding: boolean

  // The default constructor for each accordion
  constructor(el: HTMLDetailsElement) {
    // Store the <details> element
    this.el = el
    // Store the <summary> element
    this.summary = el.querySelector('summary')
    // Store the <div class="content"> element
    this.content = el.querySelector('section')

    if (!this.summary) throw new Error('Summary Not Found')
    if (!this.content) throw new Error('Content Not Found')

    // Store the animation object (so we can cancel it, if needed)
    this.animation = null
    // Store if the element is closing
    this.isClosing = false
    // Store if the element is expanding
    this.isExpanding = false
    // Detect user clicks on the summary element
    this.summary.addEventListener('click', (e) => this.onClick(e))
  }

  // Function called when user clicks on the summary
  onClick(e: MouseEvent) {
    // Stop default behaviour from the browser
    e.preventDefault()
    // Add an overflow on the <details> to avoid content overflowing
    this.el.style.overflow = 'hidden'
    // Check if the element is being closed or is already closed
    if (this.isClosing || !this.el.open)
      this.open()
    // Check if the element is being openned or is already open
    else if (this.isExpanding || this.el.open)
      this.shrink()
  }

  // Function called to close the content with an animation
  shrink() {
    // Set the element as "being closed"
    this.isClosing = true

    // Store the current height of the element
    const startHeight = `${computeTotalHeight(this.el)}px`
    // Calculate the height of the summary
    const endHeight = `${computeTotalHeight(this.summary!)}px`

    // If there is already an animation running
    if (this.animation)
      // Cancel the current animation
      this.animation.cancel()


    // Start a WAAPI animation
    this.animation = this.el.animate({
      // Set the keyframes from the startHeight to endHeight
      height: [startHeight, endHeight]
    }, {
      // If the duration is too slow or fast, you can change it here
      duration: 300,
      // You can also change the ease of the animation
      easing: 'ease-out'
    })

    // When the animation is complete, call onAnimationFinish()
    this.animation.onfinish = () => this.onAnimationFinish(false)
    // If the animation is cancelled, isClosing variable is set to false
    this.animation.oncancel = () => this.isClosing = false
  }

  // Function called to open the element after click
  open() {
    // Apply a fixed height on the element
    this.el.style.height = `${computeTotalHeight(this.el)}px`
    // Force the [open] attribute on the details element
    this.el.open = true
    // Wait for the next frame to call the expand function
    window.requestAnimationFrame(() => this.expand())
  }

  // Function called to expand the content with an animation
  expand() {
    // Set the element as "being expanding"
    this.isExpanding = true
    // Get the current fixed height of the element
    const startHeight = `${computeTotalHeight(this.el)}px`
    // Calculate the open height of the element (summary height + content height)
    const endHeight = `${computeTotalHeight(this.summary!) + computeTotalHeight(this.content!)}px`

    // If there is already an animation running
    if (this.animation)
      // Cancel the current animation
      this.animation.cancel()


    // Start a WAAPI animation
    this.animation = this.el.animate({
      // Set the keyframes from the startHeight to endHeight
      height: [startHeight, endHeight]
    }, {
      // If the duration is too slow of fast, you can change it here
      duration: 300,
      // You can also change the ease of the animation
      easing: 'ease-out'
    })
    // When the animation is complete, call onAnimationFinish()
    this.animation.onfinish = () => this.onAnimationFinish(true)
    // If the animation is cancelled, isExpanding variable is set to false
    this.animation.oncancel = () => this.isExpanding = false
  }

  // Callback when the shrink or expand animations are done
  onAnimationFinish(open: boolean) {
    // Set the open attribute based on the parameter
    this.el.open = open
    // Clear the stored animation
    this.animation = null
    // Reset isClosing & isExpanding
    this.isClosing = false
    this.isExpanding = false
    // Remove the overflow hidden and the fixed height
    this.el.style.height = this.el.style.overflow = ''
  }
}

document.querySelectorAll('details').forEach((el) => {
  new Accordion(el)
})

// -----------------------------------------------------------------------------
// DOM
// -----------------------------------------------------------------------------
const togglePalette = () => {
  document.getElementById('btn-toggle-palette')?.classList.toggle('active')
  document.getElementById('workspace')?.classList.toggle('palette-open')
}

const toggleCode = () => {
  document.getElementById('btn-toggle-code')?.classList.toggle('active')
  document.getElementById('workspace')?.classList.toggle('code-open')
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

// If everything loaded correctly, show the content
requestAnimationFrame(() => {
  document.querySelector('html')!.style.opacity = ''
})
