import { computePosition, shift, offset } from '@floating-ui/dom'

const toolbar_gates = [...document.querySelectorAll<HTMLElement>('.toolbar-btn.gate')]
const tooltip = document.querySelector<HTMLElement>('#tooltip')

const getTooltipContent = (title: string, description: string) => {
	return `<b>${title}</b><br>${description}`
}

const updateTooltip = (target: HTMLElement | { getBoundingClientRect: () => any }) => {
	computePosition(target, tooltip!, {
		placement: 'bottom-start',
		middleware: [shift({ padding: 4 }), offset(4)],
	}).then(({ x, y }) => {
		Object.assign(tooltip!.style, {
			left: `${x}px`,
			top: `${y}px`,
			transform: 'scale(1)',
			opacity: 1,
		})
	})
}

const isMouseMoveEvent = (event: Event | MouseEvent): event is MouseEvent =>
	event.type === 'mousemove'

let tooltip_timeout: number | undefined

function showTooltip(target: HTMLElement, event: Event | MouseEvent) {
	clearTimeout(tooltip_timeout)

	tooltip!.style.display = 'block'
	tooltip!.innerHTML = getTooltipContent(
		target!.dataset.title ?? '',
		target!.dataset.description ?? ''
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
					bottom: event.clientY + 8,
				}
			},
		}
		return updateTooltip(virtualEl)
	}
	return updateTooltip(target)
}

function hideTooltip() {
	tooltip!.style.transform = ''
	tooltip!.style.opacity = ''
	tooltip_timeout = setTimeout(() => (tooltip!.style.display = ''), 100)
}

const showEvents = ['mousemove', 'focus']
const hideEvents = ['mouseleave', 'blur', 'dragstart']

toolbar_gates.forEach((el: HTMLElement) => {
	showEvents.forEach((e) => el.addEventListener(e, (_) => showTooltip(el, _)))
	hideEvents.forEach((e) => el.addEventListener(e, hideTooltip))
})
