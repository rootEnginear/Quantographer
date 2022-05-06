import {createApp} from 'vue'
import Menubar from './components/Menubar.vue'

createApp(Menubar).mount('#menu')

import './styles/main.scss'

const gateButtons = document.querySelectorAll<HTMLElement>('.gate')

const workspaceElement = document.querySelector<HTMLElement>('#workspace')!

const togglePaletteButton = document.getElementById('btn-toggle-palette')!
const toggleCodeButton = document.getElementById('btn-toggle-code')!

const accordionGroups = document.querySelectorAll('details')

import './ui/gate_tooltip'
import './ui/contextmenu'

import {addButtonDraglistener} from './render/util'

for (const gateButton of gateButtons)
  addButtonDraglistener(gateButton)

import './translator/index'
import './render'

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
    // @ts-expect-error
    window.chooseAndLoadFile()
  }

  if (e.ctrlKey && e.key === 's') {
    e.stopPropagation()
    e.preventDefault()
    // @ts-expect-error
    window.saveFile()
  }

  if (e.ctrlKey && e.key === 'a') {
    e.stopPropagation()
    e.preventDefault()
    // @ts-expect-error
    window.gateSelectAll()
  }

  if (e.key == 'Delete') {
    e.stopPropagation()
    e.preventDefault()
    // @ts-expect-error
    window.gateDeleteSelected()
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
// convert snake case to capitalize each word
// const toTitleCase = (str: string) => str.split('_').map((w) => w[0].toUpperCase() + w.slice(1))
//   .join(' ')

import Execute from './components/Execute.vue'
createApp(Execute).mount('#execute-circuit-dialog')

let isExecuteDialogOpen = false
// const recommend_oplv = ''
// const recommend_rtmt = ''
// const recommend_lomt = ''
// const recommend_sdmt = ''
const openExecuteDialog = () => {
  if (isExecuteDialogOpen) return
  isExecuteDialogOpen = true

  // @ts-expect-error
  initExecuteDialog()

  new window.WinBox({
    title: 'Execute',
    border: 4,
    mount: document.getElementById('execute-circuit-dialog') as Node,
    onclose: () => {
      isExecuteDialogOpen = false
      // document.getElementById('waitForOptimal')!.style.display = ''
      // document.getElementById('gotOptimal')!.style.display = 'none'
      return false
    },
    width: 750,
    height: 550,
    x: 'center',
    y: 'center'
  })
  // updateTranspileResult()
  // fetch('https://quantum-backend-flask.herokuapp.com/recommend', {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json'
  //   },
  //   body: JSON.stringify({
  //     // @ts-expect-error
  //     code: window.translateCircuit(),
  //     // TODO: Change this system to other systems
  //     system: 'guadalupe'
  //   })
  // }).then((r) => r.json())
  //   .then((r) => {
  //     // console.log(r[0])
  //     document.getElementById('waitForOptimal')!.style.display = 'none'
  //     document.getElementById('gotOptimal')!.style.display = ''
  //     recommend_oplv = `${r[0].optlvl}`
  //     recommend_rtmt = r[0].routing
  //     recommend_lomt = r[0].layout
  //     recommend_sdmt = r[0].scheduling
  //     document.getElementById('oplv')!.textContent = r[0].optlvl
  //     document.getElementById('rtmt')!.textContent = toTitleCase(r[0].routing)
  //     document.getElementById('lomt')!.textContent = toTitleCase(r[0].layout)
  //     document.getElementById('sdmt')!.textContent = toTitleCase(r[0].scheduling || 'None')
  //   })
}

// const copyRecommendTranspile = () => {
//   if (recommend_oplv) document.querySelector<HTMLInputElement>('#input-otlv')!.value = recommend_oplv
//   if (recommend_rtmt) document.querySelector<HTMLInputElement>('#input-rtmt')!.value = recommend_rtmt
//   if (recommend_lomt) document.querySelector<HTMLInputElement>('#input-lomt')!.value = recommend_lomt
//   if (recommend_sdmt) document.querySelector<HTMLInputElement>('#input-sdmt')!.value = recommend_sdmt
// }

// const updateTranspileResult = () => {
//   const otlv = document.querySelector<HTMLInputElement>('#input-otlv')!.value
//   const lomt = document.querySelector<HTMLInputElement>('#input-lomt')!.value
//   const rtmt = document.querySelector<HTMLInputElement>('#input-rtmt')!.value
//   const sdmt = document.querySelector<HTMLInputElement>('#input-sdmt')!.value

//   fetch('https://quantum-backend-flask.herokuapp.com/transpile', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json'
//     },
//     body: JSON.stringify({
//       // @ts-expect-error
//       code: window.translateCircuit(),
//       // TODO: Change this system to other systems
//       system: 'guadalupe',
//       layout: lomt,
//       routing: rtmt,
//       scheduling: sdmt === 'none' ? null : sdmt,
//       optlvl: +otlv
//     })
//   }).then((r) => r.json())
//     .then((r) => {
//       (document.getElementById('transpiled_circuit_image') as HTMLImageElement).src = r.pic
//     })
// }

import Export from './components/Export.vue'
createApp(Export).mount('#export-circuit-dialog')

let isExportDialogOpen = false
const openExportDialog = () => {
  if (isExportDialogOpen) return
  isExportDialogOpen = true

  // @ts-expect-error
  initExportDialog()

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

let newGateDialogInstance: any = null
let isNewGateDialogOpen = false
const openNewGateDialog = () => {
  if (isNewGateDialogOpen) return
  isNewGateDialogOpen = true
  // @ts-expect-error
  initNewGateDialog()
  newGateDialogInstance = new window.WinBox({
    title: 'New Gate',
    border: 4,
    mount: document.getElementById('new-gate-dialog') as Node,
    onclose: () => {
      isNewGateDialogOpen = false
      Object.assign(window, {
        newGateDialogInstance
      })
      return false
    },
    width: 750,
    height: 530,
    x: 'center',
    y: 'center'
  })
  Object.assign(window, {
    newGateDialogInstance
  })
}

// -----------------------------------------------------------------------------
// Alertify
// -----------------------------------------------------------------------------
// @ts-expect-error
alertify.defaults = {
  // @ts-expect-error
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
  // @ts-expect-error
  alertify.prompt('Rename File', 'Please enter the name of your file', window.getFileName(), (evt, value) => {
    // @ts-expect-error
    window.setFileName(value)
  }, () => {
    // alertify.error('Cancel')
    /* do nothing when cancel */
  })
}

const changeIbmKey = () => {
  // @ts-expect-error
  alertify.prompt('Connect to IBMQ', 'Please enter the API Key of your IBMQ<br>Your key will only be used when executing the circuit on particular system. We *will not* store your key in any ways.', window.getApiKey(), (evt, value) => {
    // @ts-expect-error
    window.setApiKey(value)
  }, () => {
    // alertify.error('Cancel')
    /* do nothing when cancel */
  })
}

// -----------------------------------------------------------------------------
// Global Things
// -----------------------------------------------------------------------------
Object.assign(window, {
  openExportDialog,
  openExecuteDialog,
  openNewGateDialog,
  togglePalette,
  toggleCode,
  renameFile,
  changeIbmKey,
  newGateDialogInstance
  // updateTranspileResult,
  // copyRecommendTranspile
})

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
    height: 340,
    x: 'center',
    y: 'center'
  })

const changeIntroductionDialogPref = (el: HTMLInputElement) => {
  console.log(el.checked)
  if (el.checked)
    localStorage.removeItem('quantoHideIntroduction')
  else
    localStorage.setItem('quantoHideIntroduction', 'true')
}

Object.assign(window, {
  changeIntroductionDialogPref,
  introductionDialogInstance
})

document.body.onmousedown = function (e) {
  if (e.button === 1) return false
  return true
}
