import {computePosition, shift, offset} from '@floating-ui/dom'

const ctxmenu = document.querySelector<HTMLElement>('#contextmenu')

const updateCtx = (target: HTMLElement | { getBoundingClientRect: () => any }) => {
  computePosition(target, ctxmenu!, {
    placement: 'bottom-start',
    middleware: [shift(), offset(4)]
  }).then(({x, y}) => {
    Object.assign(ctxmenu!.style, {
      left: `${x}px`,
      top: `${y}px`,
      transform: 'scale(1)',
      opacity: 1
    })
  })
}


let ctx_timeout: number | undefined

const showCtx = (event: MouseEvent) => {
  clearTimeout(ctx_timeout)

  ctxmenu!.style.display = 'block'
  // ctxmenu!.innerHTML = getTooltipContent(
  //   target!.dataset.tooltipTitle ?? '',
  //   target!.dataset.tooltip ?? ''
  // )

  const virtualEl = {
    getBoundingClientRect() {
      return {
        width: 0,
        height: 0,
        x: event.clientX + 8,
        y: event.clientY + 8,
        top: event.clientY + 8,
        left: event.clientX + 8,
        right: event.clientX + 8,
        bottom: event.clientY + 8
      }
    }
  }
  return updateCtx(virtualEl)
}

const hideCtx = () => {
  ctxmenu!.style.transform = ''
  ctxmenu!.style.opacity = ''
  ctx_timeout = setTimeout(() => ctxmenu!.style.display = '', 100)
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
