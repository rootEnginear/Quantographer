<template>
  <ul class="menubar-body" ref="menu_element">
    <li v-for="menu_item, index in MENU_ITEMS" :key="index" data-menu-item tabindex="-1">
      {{ menu_item.name }}
      <ul v-if="'items' in menu_item">
        <li
          v-for="submenu_item, jndex in menu_item.items"
          :key="jndex"
          :data-newcategory="!!submenu_item.newCategory"
          data-submenu-item
          tabindex="-1"
          @click="submenu_item.onClick">{{ submenu_item.name }}</li>
      </ul>
    </li>
  </ul>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'

// -----------------------------------------------------------------------------
// Interfaces
// -----------------------------------------------------------------------------
interface SubMenuItem {
  name: string
  newCategory?: boolean
  onClick: () => any
}

interface MenuItem {
  name: string
  items?: (SubMenuItem)[]
}

// -----------------------------------------------------------------------------
// Menu Items
// -----------------------------------------------------------------------------
const MENU_ITEMS: MenuItem[] = [
  {
    name: 'File',
    items: [
      {
        name: 'New',
        onClick() {
          location.reload();
        }
      },
      {
        name: 'Open',
        onClick() {
          // @ts-expect-error
          window.chooseAndLoadFile()
        }
      },
      {
        name: 'Save',
        newCategory: true,
        onClick() {
          // @ts-expect-error
          window.saveFile()
        }
      },
      {
        name: 'Export',
        newCategory: true,
        onClick() {
          // @ts-expect-error
          window.openExportDialog()
        }
      },
    ]
  },
  {
    name: 'Edit',
    items: [
      {
        name: 'Undo',
        onClick() {}
      },
      {
        name: 'Redo',
        onClick() {}
      },
      {
        name: 'Cut',
        newCategory: true,
        onClick() {}
      },
      {
        name: 'Copy',
        onClick() {}
      },
      {
        name: 'Paste',
        onClick() {}
      },
      {
        name: 'Delete',
        newCategory: true,
        onClick() {
          // @ts-expect-error
          window.gateDeleteSelected()
        }
      },
      {
        name: 'Select all',
        onClick() {
          // @ts-expect-error
          window.gateSelectAll()
        }
      },
      {
        name: 'Duplicate to left',
        newCategory: true,
        onClick() {}
      },
      {
        name: 'Duplicate to right',
        onClick() {}
      },
      {
        name: 'Flip horizontally',
        newCategory: true,
        onClick() {}
      },
      {
        name: 'Conjugate transpose',
        onClick() {}
      }
    ]
  },
  {
    name: 'View',
    items: [
      {
        name: 'Zoom in',
        onClick() {
          // @ts-expect-error
          window.changeZoomLevel(1)
        }
      },
      {
        name: 'Zoom out',
        onClick() {
          // @ts-expect-error
          window.changeZoomLevel(-1)
        }
      },
      {
        name: '25%',
        newCategory: true,
        onClick() {
          // @ts-expect-error
          window.setZoomLevel(0)
        }
      },
      {
        name: '50%',
        onClick() {
          // @ts-expect-error
          window.setZoomLevel(1)
        }
      },
      {
        name: '75%',
        onClick() {
          // @ts-expect-error
          window.setZoomLevel(2)
        }
      },
      {
        name: '100%',
        onClick() {
          // @ts-expect-error
          window.setZoomLevel(3)
        }
      },
      {
        name: '125%',
        onClick() {
          // @ts-expect-error
          window.setZoomLevel(4)
        }
      },
      {
        name: '150%',
        onClick() {
          // @ts-expect-error
          window.setZoomLevel(5)
        }
      },
      {
        name: '175%',
        onClick() {
          // @ts-expect-error
          window.setZoomLevel(6)
        }
      },
      {
        name: '200%',
        onClick() {
          // @ts-expect-error
          window.setZoomLevel(7)
        }
      },
      {
        name: 'Toggle Gate Palette',
        newCategory: true,
        onClick() {
          // @ts-expect-error
          window.togglePalette()
        }
      },
      {
        name: 'Toggle Code Palette',
        onClick() {
          // @ts-expect-error
          window.toggleCode()
        }
      },
    ]
  },
  {
    name: 'Help',
    items: [
      {
        name: 'About',
        onClick() {}
      }
    ]
  }
]

// -----------------------------------------------------------------------------
// Logics
// -----------------------------------------------------------------------------
const menu_element = ref<HTMLElement | null>(null)

onMounted(() => {
  initMenu()
})

const initMenu = () => {
  const menu_el = menu_element.value!

  const closeMenu = () => {
    (document.activeElement as HTMLElement).blur()
    menu_el.classList.remove('active');

    [...menu_el.children].forEach(el => {
      el.classList.remove('active')
    });
  }

  [...document.querySelectorAll('.menubar-body li')].forEach(el => {
    el.addEventListener('blur', () => {
      if (!getComputedStyle(menu_el).getPropertyValue('--menu-still-open')) {
        closeMenu()
      }
    });
  });

  menu_el.addEventListener('click', (event) => {
    const target = event.target! as HTMLElement
    if (target.dataset.menuItem != undefined) {
      menu_el.classList.toggle('active')
    }
  });

  menu_el.addEventListener('keydown', (event) => {
    // ESC
    if (event.keyCode == 27) {
      closeMenu()
    }

    const children = [...menu_el.children] as HTMLElement[]
    const isChildOpen = [...menu_el.children].map(el => el.classList.contains("active"))
    const currentOpenIndex = isChildOpen.indexOf(true)

    // Left
    if (event.key === "ArrowLeft") {
      if (currentOpenIndex === 0) return

      children.forEach(el => {
        el.classList.remove('active')
      });

      children[currentOpenIndex - 1].classList.add('active')
      if (children[currentOpenIndex - 1].children.length) {
        (children[currentOpenIndex - 1].children[0].children[0] as HTMLElement).focus()
      } else {
        (children[currentOpenIndex - 1]).focus()
      }
    }

    // Right
    if (event.key === "ArrowRight") {
      if (currentOpenIndex === children.length - 1) return

      children.forEach(el => {
        el.classList.remove('active')
      });

      children[currentOpenIndex + 1].classList.add('active')
      if (children[currentOpenIndex + 1].children.length) {
        (children[currentOpenIndex + 1].children[0].children[0] as HTMLElement).focus()
      } else {
        (children[currentOpenIndex + 1]).focus()
      }
    }

    const currentSubmenu_els = [...children[currentOpenIndex].children[0].children] as HTMLElement[]
    const currentSubMenuFocus = [...currentSubmenu_els].map(el => el === document.activeElement)
    const currentSubMenuFocusIndex = currentSubMenuFocus.indexOf(true)
    const lastSubMenuIndex = currentSubmenu_els.length - 1
    const isAllSubMenuBlur = currentSubMenuFocus.every(el => el === false)

    // Up
    if (event.key === "ArrowUp") {
      // if all empty -> focus the last one
      if (isAllSubMenuBlur) {
        (currentSubmenu_els[lastSubMenuIndex]).focus()
      } else {
        if (currentSubMenuFocusIndex === 0) {
          (currentSubmenu_els[lastSubMenuIndex]).focus()
        } else {
          (currentSubmenu_els[currentSubMenuFocusIndex - 1]).focus()
        }
      }
    }

    // Down
    if (event.key === "ArrowDown") {
      // if all empty -> focus the first one
      if (isAllSubMenuBlur) {
        (currentSubmenu_els[0]).focus()
      } else {
        if (currentSubMenuFocusIndex === lastSubMenuIndex) {
          (currentSubmenu_els[0]).focus()
        } else {
          (currentSubmenu_els[currentSubMenuFocusIndex + 1]).focus()
        }
      }
    }
  });

  // .menubar-body > li
  [...menu_el.children].forEach(el => {
    el.addEventListener('mousemove', function (this: HTMLElement) {
      if (this.classList.contains('active')) return

      [...this.parentElement!.children].forEach(el => {
        if (el === this) {
          this.focus()
          el.classList.add('active')
        } else {
          el.classList.remove('active')
        }
      });

    })

    el.addEventListener('mouseleave', function (this: HTMLElement) {
      if (!menu_el.classList.contains('active')) this.classList.remove('active');
    })
  });

  // .menubar-body > li > ul > li
  [...document.querySelectorAll('.menubar-body > li > ul > li')].forEach(el => {
    el.addEventListener('mouseenter', function (this: HTMLElement) {
      if (this.classList.contains('active')) return

      [...this.parentElement!.children].forEach(el => {
        if (el === this) {
          this.focus()
        } else {
          el.classList.remove('active')
        }
      });
    })

    el.addEventListener('mouseleave', function (this: HTMLElement) {
      if (!menu_el.classList.contains('active')) this.classList.remove('active');
    })

    el.addEventListener('focus', function (this: HTMLElement) {
      this.classList.add('active');
    })

    el.addEventListener('blur', function (this: HTMLElement) {
      this.classList.remove('active');
    })
  })
}
</script>

<style scoped lang="scss">
.menubar-body {
  list-style: none;
  padding: 0;
  margin: 0;

  display: flex;

  cursor: default;
}

.menubar-body * {
  outline: none;
}

.menubar-body:focus-within {
  --menu-still-open: 1;
}

.menubar-body>li {
  position: relative;

  display: flex;
  align-items: center;

  padding: 0 12px;

  transition: background 0.1s;
}

.menubar-body>li.active {
  background: rgba(0, 0, 0, 0.1);
}

.menubar-body>li>ul {
  display: none;

  list-style: none;
  padding: 0;
  margin: 0;

  color: black;
}

.menubar-body.active>li.active {
  // border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.menubar-body.active>li.active>ul {
  position: absolute;
  z-index: 99;

  display: flex;
  flex-direction: column;

  left: 0px;
  top: calc(100% + 1px);
  background: #f5f9ff;

  filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
}

.menubar-body>li>ul>li {
  position: relative;
  padding: 8px;

  cursor: pointer;
  white-space: nowrap;

  transition: background 0.1s;
}

.menubar-body>li>ul>li.active {
  background: rgba(0, 0, 0, 0.1);
}

.menubar-body>li>ul>li[data-newcategory="true"] {
  border-top: 1px solid #0061ff;
}
</style>