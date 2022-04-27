import {computePosition, shift, offset} from '@floating-ui/dom'

import {circuitData} from '../render/data'
import {adjustWorkbenchSize, clearOps, populateOps} from '../render'
import {deepClone} from '../util'
import {getLocationInfo} from '../render/util'

const ctxmenu = document.querySelector<HTMLElement>('#contextmenu')!

const cutMenu = ctxmenu.querySelector<HTMLElement>('.cut')!
const copyMenu = ctxmenu.querySelector<HTMLElement>('.copy')!
const pasteMenu = ctxmenu.querySelector<HTMLElement>('.paste')!

const deleteMenu = ctxmenu.querySelector<HTMLElement>('.delete')!
const selectAllMenu = ctxmenu.querySelector<HTMLElement>('.select-all')!

const gateSelectAll = () => {
  circuitData.ops.forEach(
    (op) => op.active = true
  )
  clearOps()
  populateOps()
  hideCtx()
}

const gateDeleteSelected = () => {
  const {ops} = circuitData
  let i = ops.length
  while (i) {
    i -= 1
    if (ops[i].active)
      ops.splice(i, 1)
  }
  // @ts-expect-error
  window.updateCodeOutput?.()
  clearOps()
  populateOps()
  adjustWorkbenchSize()
  hideCtx()
}

let workbenchLocation: LocationInfo | null = null
let clipboardData: Operation[] = []

const gateCopySelected = () => {
  clipboardData = circuitData.ops
    .filter(
      (op) => op.active
    )
    .sort(
      (a, b) => a.step - b.step
    )
}

const gateCutSelected = () => {
  gateCopySelected()
  gateDeleteSelected()
}

const gatePasteClipboard = () => {
  if (clipboardData.length === 0) return
  const {ops} = circuitData
  const maxStep =
    ops.length === 0 ?
      0 :
      1 + Math.max(
        ... ops.map(
          (op) => op.step
        )
      )
  const minGroup = Math.min(
    ... clipboardData.map(
      (op) => op.step
    )
  )
  const newSection = clipboardData.map(
    (op) => {
      const newOp = deepClone(op)
      newOp.step = newOp.step - minGroup + maxStep
      return newOp
    }
  )
  ops.push(... newSection)

  // @ts-expect-error
  window.updateCodeOutput?.()
  clearOps()
  populateOps()
  adjustWorkbenchSize()
}

pasteMenu.addEventListener(
  'click',
  () => {
    if (clipboardData.length === 0 || workbenchLocation === null || workbenchLocation.laneType !== 'op') return
    const possiblyLoc = workbenchLocation

    const {ops} = circuitData
    const afterSection = []

    let i = ops.length
    while (i) {
      i -= 1
      const dop = ops[i]
      if (dop.step >= possiblyLoc.step) {
        const [cop] = ops.splice(i, 1)
        afterSection.push(cop)
      }
    }

    const minGroup = Math.min(
      ... clipboardData.map(
        (op) => op.step
      )
    )
    const newSection = clipboardData.map(
      (op) => {
        const newOp = deepClone(op)
        newOp.step = newOp.step - minGroup + possiblyLoc.step
        return newOp
      }
    )
    const maxNewSection = 1 + Math.max(
      ... newSection.map(
        (op) => op.step
      )
    )

    const newSection2 = afterSection.map(
      (op) => {
        const newOp = deepClone(op)
        newOp.step = newOp.step - possiblyLoc.step + maxNewSection
        return newOp
      }
    )
    ops.push(
      ... newSection,
      ... newSection2
    )

    // @ts-expect-error
    window.updateCodeOutput?.()
    clearOps()
    populateOps()
    adjustWorkbenchSize()
  }
)

cutMenu.addEventListener('click', gateCutSelected)
copyMenu.addEventListener('click', gateCopySelected)
deleteMenu.addEventListener('click', gateDeleteSelected)
selectAllMenu.addEventListener('click', gateSelectAll)

Object.assign(
  window,
  {
    gateSelectAll,
    gateDeleteSelected,
    gateCutSelected,
    gateCopySelected,
    gatePasteClipboard
  }
)

const updateCtx = async (target: HTMLElement | { getBoundingClientRect: () => any }) => {
  const {x, y} = await computePosition(
    target,
    ctxmenu,
    {
      placement: 'bottom-start',
      middleware: [
        shift(),
        offset(4)
      ]
    }
  )
  Object.assign(
    ctxmenu.style,
    {
      left: `${x}px`,
      top: `${y}px`,
      transform: 'scale(1)',
      opacity: 1
    }
  )
}


let ctx_timeout: number | undefined

const showCtx = (event: MouseEvent) => {
  workbenchLocation = getLocationInfo(event.offsetX, event.offsetY)
  clearTimeout(ctx_timeout)

  ctxmenu.style.display = 'block'
  // ctxmenu.innerHTML = getTooltipContent(
  //   target!.dataset.tooltipTitle ?? '',
  //   target!.dataset.tooltip ?? ''
  // )

  const virtualEl = {
    getBoundingClientRect() {
      const x = event.clientX + 8
      const y = event.clientY + 8
      return {
        width: 0,
        height: 0,
        x,
        y,
        left: x,
        top: y,
        right: x,
        bottom: y
      }
    }
  }
  return updateCtx(virtualEl)
}

const hideCtx = () => {
  ctxmenu.style.transform = ''
  ctxmenu.style.opacity = ''

  workbenchLocation = null
  ctx_timeout = setTimeout(() => ctxmenu.style.display = '', 100)
}

let is_ctx_shown = false

const workbench = document.getElementById('workbench')!

document.addEventListener('contextmenu', (e) => {
  // @ts-expect-error
  const is_on_self = e.path.some((el) => el === ctxmenu)
  if (is_on_self) e.preventDefault()

  // @ts-expect-error
  const is_on_workbench = e.path.some((el) => el === workbench)

  if (is_on_workbench) {
    if (is_ctx_shown) {
      hideCtx()
      setTimeout(() => {
        is_ctx_shown = true
        showCtx(e)
      }, 100)
    } else {
      is_ctx_shown = true
      showCtx(e)
    }
    e.preventDefault()
  } else {
    hideCtx()
    is_ctx_shown = false
  }
}, false)

ctxmenu?.addEventListener('contextmenu', (e) => e.preventDefault())

workbench.addEventListener('mousedown', () => {
  if (is_ctx_shown) {
    hideCtx()
    is_ctx_shown = false
  }
})
