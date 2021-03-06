import {createApp} from 'vue'

import './styles/main.scss'

const gateButtons = document.querySelectorAll<HTMLElement>('.gate')

const workspaceElement = document.querySelector<HTMLElement>('#workspace')!

const togglePaletteButton = document.getElementById('btn-toggle-palette')!
const toggleCodeButton = document.getElementById('btn-toggle-code')!

const accordionGroups = document.querySelectorAll('details')

import './ui/gate_tooltip'
import {
  gateSelectAll,
  gateDeleteSelected,
  gateCopySelected,
  gateCutSelected,
  gatePasteClipboard
} from './ui/contextmenu'

import {addButtonDraglistener} from './render/util'

for (const gateButton of gateButtons)
  addButtonDraglistener(gateButton)

import {translateCircuit} from './translator'

import {
  chooseAndLoadFile,
  saveFile,
  getApiKey,
  isCircuitEmpty,
  setFileName,
  setApiKey,
  getFileName,
  resetProgram,
  appendNewQubit,
  appendNewBit
} from './render'

import {Store} from './store'

// -----------------------------------------------------------------------------
// Shortcuts
// -----------------------------------------------------------------------------
// Chrome: Ctrl+Shift+N, Ctrl+T, Ctrl+Shift+T, Ctrl+W, Ctrl+Shift+W don't work
// https://stackoverflow.com/questions/7295508/javascript-capture-browser-shortcuts-ctrlt-n-w/7296303#7296303
const handlingShortcuts = (e: KeyboardEvent) => {
  if (e.ctrlKey && e.key === 'p') {
    togglePalette()
    e.stopPropagation()
    e.preventDefault()
    return 0
  }


  if (e.ctrlKey && e.key === 'b') {
    toggleCode()
    e.stopPropagation()
    e.preventDefault()
    return 0
  }


  if (e.ctrlKey && e.key === 'e') {
    openExecuteDialog()
    e.stopPropagation()
    e.preventDefault()
    return 0
  }


  if (e.ctrlKey && e.key === 'n') {
    location.reload()
    e.stopPropagation()
    e.preventDefault()
    return 0
  }

  if (e.ctrlKey && e.key === 'o') {
    e.stopPropagation()
    e.preventDefault()
    chooseAndLoadFile()
  }

  if (e.ctrlKey && e.key === 's') {
    e.stopPropagation()
    e.preventDefault()
    saveFile()
  }

  if (e.ctrlKey && e.key === 'a') {
    e.stopPropagation()
    e.preventDefault()
    gateSelectAll()
  }

  if (e.key == 'Delete') {
    e.stopPropagation()
    e.preventDefault()
    gateDeleteSelected()
  }

  // if (e.key === 'F11' || e.key === 'F12' || e.key === 'F5') return 0

  // e.stopPropagation()
  // e.preventDefault()
  return 0
}

window.addEventListener('keydown', handlingShortcuts)
document.addEventListener('keydown', handlingShortcuts)

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

accordionGroups.forEach((el) => {
  new Accordion(el)
})

// -----------------------------------------------------------------------------
// DOM
// -----------------------------------------------------------------------------
const togglePalette = () => {
  togglePaletteButton.classList.toggle('active')
  workspaceElement.classList.toggle('palette-open')
}

const toggleCode = () => {
  toggleCodeButton.classList.toggle('active')
  workspaceElement.classList.toggle('code-open')
}

// -----------------------------------------------------------------------------
// Dialogs
// -----------------------------------------------------------------------------
import Execute from './components/Execute.vue'
createApp(Execute).mount('#execute-circuit-dialog')

let isExecuteDialogOpen = false
const openExecuteDialog = async () => {
  if (isExecuteDialogOpen) return

  if (getApiKey() === '') return alertify.alert('No IBMQ API Key Present', 'You must enter your IBM Cloud API key before executing a circuit.')
  if (isCircuitEmpty()) return alertify.alert('Circuit is Empty!', 'Your circuit is empty. Try to add some gates.')

  isExecuteDialogOpen = true

  Store.initExecuteDialog?.()

  new window.WinBox({
    title: 'Transpile & Execute',
    border: 4,
    mount: document.getElementById('execute-circuit-dialog') as Node,
    onclose: () => {
      isExecuteDialogOpen = false
      return false
    },
    width: 750,
    height: 550,
    x: 'center',
    y: 'center'
  })
}

import Export from './components/Export.vue'
createApp(Export).mount('#export-circuit-dialog')

let isExportDialogOpen = false
const openExportDialog = (choice: 'qasm' | 'png' = 'qasm') => {
  if (isExportDialogOpen) return
  isExportDialogOpen = true

  Store.initExportDialog?.(choice)

  new window.WinBox({
    title: 'Export',
    border: 4,
    mount: document.getElementById('export-circuit-dialog') as Node,
    onclose: () => {
      isExportDialogOpen = false
      return false
    },
    width: 750,
    height: 526,
    x: 'center',
    y: 'center'
  })
}

import NewGate from './components/NewGate.vue'
createApp(NewGate).mount('#new-gate-dialog')

let isNewGateDialogOpen = false
const openNewGateDialog = () => {
  if (isNewGateDialogOpen) return
  isNewGateDialogOpen = true

  Store.initNewGateDialog?.()

  Store.newGateDialogInstance = new window.WinBox({
    title: 'New Gate',
    border: 4,
    mount: document.getElementById('new-gate-dialog') as Node,
    onclose: () => {
      isNewGateDialogOpen = false
      return false
    },
    width: 750,
    height: 530,
    x: 'center',
    y: 'center'
  })
}

// -----------------------------------------------------------------------------
// Alertify
// -----------------------------------------------------------------------------
alertify.defaults = {
  ...alertify.defaults,
  transitionOff: true,
  // theme settings
  theme: {
    // class name attached to prompt dialog input textbox.
    input: 'ajs-input input',
    // class name attached to ok button
    ok: 'ajs-ok button is-primary',
    // class name attached to cancel button
    cancel: 'ajs-cancel button'
  }
}

const renameFile = () => {
  alertify.prompt('Rename File', 'Please enter the name of your file', getFileName(), (_: any, value: any) => {
    setFileName(value)
  }, () => {})
}

const changeIbmKey = () => {
  alertify.prompt('Connect to IBMQ', 'Please enter the API Key of your IBMQ<br>Your key will only be used when executing the circuit on particular system. We *will not* store your key in any ways.', getApiKey(), (_: any, value: any) => {
    setApiKey(value.trim())
  }, () => {})
}

// -----------------------------------------------------------------------------
// Etc.
// -----------------------------------------------------------------------------
const copyQiskitCode = () => {
  const copyText = document.getElementById('qiskit-code-copy-btn')!
  navigator.clipboard.writeText(translateCircuit())
  copyText.textContent = 'Copied!'
  setTimeout(() => {
    copyText.textContent = 'Copy'
  }, 1000)
}

const toggleFullscreen = () => {
  const el = document.getElementById('fullscreen-btn')
  if (document.fullscreenElement) {
    document.exitFullscreen()
    el!.innerHTML = '<i class="fa-solid fa-up-right-and-down-left-from-center"></i>'
  } else {
    document.documentElement.requestFullscreen()
    el!.innerHTML = '<i class="fa-solid fa-down-left-and-up-right-to-center"></i>'
  }
}

// -----------------------------------------------------------------------------
// Global Things
// -----------------------------------------------------------------------------
// If everything loaded correctly, show the content
requestAnimationFrame(() => {
  document.documentElement.style.opacity = ''
  document.documentElement.classList.remove('not-ready')
})

// if `hide-introduction` is set in localstorage, don't show the introduction
let introductionDialogInstance: any = null
if (!localStorage.getItem('quantoHideIntroduction'))
  introductionDialogInstance = new window.WinBox({
    title: 'Welcome to Quantographer!',
    border: 4,
    mount: document.getElementById('introduction-dialog') as Node,
    onclose: () => false,
    width: 750,
    height: 500,
    x: 'center',
    y: 'center'
  })

const changeIntroductionDialogPref = (el: HTMLInputElement) => {
  // console.log(el.checked)
  if (el.checked)
    localStorage.removeItem('quantoHideIntroduction')
  else
    localStorage.setItem('quantoHideIntroduction', 'true')
}

document.body.onmousedown = function (e) {
  if (e.button === 1) return false
  return true
}

const attachOnClick = (el_id: string, fn: () => void) => {
  document.getElementById(el_id)!.addEventListener('click', fn)
}

attachOnClick('fullscreen-btn', toggleFullscreen)
attachOnClick('filename', renameFile)
attachOnClick('ibm-key-btn', changeIbmKey)
attachOnClick('exec-btn', openExecuteDialog)
attachOnClick('toolbar-reset-program-btn', resetProgram)
attachOnClick('toolbar-choose-and-load-file-btn', chooseAndLoadFile)
attachOnClick('toolbar-save-file-btn', saveFile)
attachOnClick('toolbar-open-export-dialog-btn', () => openExportDialog())
attachOnClick('toolbar-gate-cut-selected-btn', gateCutSelected)
attachOnClick('toolbar-gate-copy-selected-btn', gateCopySelected)
attachOnClick('toolbar-gate-paste-clipboard-btn', gatePasteClipboard)
attachOnClick('toolbar-gate-delete-selected-btn', gateDeleteSelected)
attachOnClick('btn-toggle-palette', togglePalette)
attachOnClick('toolbar-secondary-open-new-gate-dialog-btn', openNewGateDialog)
attachOnClick('toolbar-secondary-append-new-qubit-btn', appendNewQubit)
attachOnClick('toolbar-secondary-append-new-bit-btn', appendNewBit)
attachOnClick('btn-toggle-code', toggleCode)
attachOnClick('palette-open-new-gate-dialog-btn', openNewGateDialog)
attachOnClick('palette-append-new-qubit-btn', appendNewQubit)
attachOnClick('palette-append-new-bit-btn', appendNewBit)
attachOnClick('qiskit-code-copy-btn', copyQiskitCode)
attachOnClick('code-get-qasm-btn', () => openExportDialog('qasm'))
attachOnClick('intro-dialog-new-file-btn', () => {
  resetProgram(true)
  introductionDialogInstance.close(true)
})
attachOnClick('intro-dialog-open-file-btn', () => {
  chooseAndLoadFile()
  introductionDialogInstance.close(true)
})

document.getElementById('intro-dialog-never-show-chk')!.addEventListener('change', function () {
  changeIntroductionDialogPref(this as HTMLInputElement)
})

try {
  fetch(import.meta.env.VITE_BACKEND)
} catch (e: any) {
  //
}
