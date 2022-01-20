import { computePosition, shift } from '@floating-ui/dom'

const menubar_btn = [...document.querySelectorAll<HTMLElement>('.menubar-btn.file')]
const menu = document.querySelector<HTMLElement>('#dropdown-file-menu')

const updateMenu = (target: HTMLElement) => {
	computePosition(target, menu!, {
		placement: 'bottom-start',
		middleware: [shift()],
	}).then(({ x, y }) => {
		Object.assign(menu!.style, {
			left: `${x}px`,
			top: `${y}px`,
			transform: 'scale(1)',
			opacity: 1,
		})
	})
}

let menu_timeout: number | undefined

function showMenu(target: HTMLElement) {
	clearTimeout(menu_timeout)

	menu!.style.display = 'block'
	return updateMenu(target)
}

function hideMenu() {
	menu!.style.transform = ''
	menu!.style.opacity = ''
	menu_timeout = setTimeout(() => (menu!.style.display = ''), 100)
}

const showEvents = ['focus']
const hideEvents = ['blur']

menubar_btn.forEach((el: HTMLElement) => {
	showEvents.forEach((e) => el.addEventListener(e, () => showMenu(el)))
	hideEvents.forEach((e) => el.addEventListener(e, hideMenu))
})
