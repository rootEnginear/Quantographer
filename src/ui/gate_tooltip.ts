import {computePosition, shift, offset} from '@floating-ui/dom'

const toolbar_gates = [...document.querySelectorAll<HTMLElement>('[data-tooltip]')]
const tooltip = document.querySelector<HTMLElement>('#tooltip')

const getTooltipContent = (title: string, description: string) => {
  if (!title) return `<strong>${description}<strong>`
  return `<strong>${title}</strong><br>${description}`
}

const updateTooltip = (target: HTMLElement | { getBoundingClientRect: () => any }) => {
  computePosition(target, tooltip!, {
    placement: 'bottom-start',
    middleware: [shift(), offset(4)]
  }).then(({x, y}) => {
    Object.assign(tooltip!.style, {
      left: `${x}px`,
      top: `${y}px`,
      transform: 'scale(1)',
      opacity: 1
    })
  })
}

const isMouseMoveEvent = (event: Event | MouseEvent): event is MouseEvent =>
  event.type === 'mousemove'

let tooltip_timeout: NodeJS.Timeout | undefined

const showTooltip = (target: HTMLElement, event: Event | MouseEvent) => {
  clearTimeout(tooltip_timeout)

  tooltip!.style.display = 'block'
  tooltip!.innerHTML = getTooltipContent(
    target!.dataset.tooltipTitle ?? '',
    target!.dataset.tooltip ?? ''
  )

  if (isMouseMoveEvent(event)) {
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
    return updateTooltip(virtualEl)
  }
  return updateTooltip(target)
}

const hideTooltip = () => {
  tooltip!.style.transform = ''
  tooltip!.style.opacity = ''
  tooltip_timeout = setTimeout(() => tooltip!.style.display = '', 100)
}

const showEvents = ['mousemove']
const hideEvents = ['mouseleave', 'dragstart']

toolbar_gates.forEach((el: HTMLElement) => {
  showEvents.forEach((e) => el.addEventListener(e, (event) => showTooltip(el, event)))
  hideEvents.forEach((e) => el.addEventListener(e, hideTooltip))
})
