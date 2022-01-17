import { computePosition, shift, offset } from '@floating-ui/dom'

const toolbar_gates = [...document.querySelectorAll<HTMLElement>('.toolbar-btn.gate')]
const tooltip = document.querySelector<HTMLElement>('#tooltip')

const getTooltipContent = (title: string, description: string) => {
	return `<b>${title}</b><br>${description}`
}

const updateTooltip = (target: HTMLElement) => {
	computePosition(target, tooltip!, {
		placement: 'bottom-start',
		middleware: [shift({ padding: 4 }), offset(4)],
	}).then(({ x, y }) => {
		Object.assign(tooltip!.style, {
			left: `${x}px`,
			top: `${y}px`,
		})
	})
}

function showTooltip(target: HTMLElement) {
	tooltip!.style.display = 'block'
	tooltip!.innerHTML = getTooltipContent(
		target!.dataset.title ?? '',
		target!.dataset.description ?? ''
	)
	updateTooltip(target)
}

function hideTooltip() {
	tooltip!.style.display = ''
}

const showEvents = ['mouseenter', 'focus']
const hideEvents = ['mouseleave', 'blur', 'dragstart']

toolbar_gates.forEach((el: HTMLElement) => {
	showEvents.forEach((e) => el.addEventListener(e, () => showTooltip(el)))
	hideEvents.forEach((e) => el.addEventListener(e, hideTooltip))
})
