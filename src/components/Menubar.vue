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
        >{{ submenu_item.name }}</li>
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
  onClick?: () => any
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
      },
      {
        name: 'Open'
      },
      {
        name: 'Save',
        newCategory: true
      },
      {
        name: 'Save as'
      },
      {
        name: 'Print',
        newCategory: true
      },
      {
        name: 'Exit',
        newCategory: true
      }
    ]
  },
  {
    name: 'Edit',
    items: [
      {
        name: 'Undo'
      },
      {
        name: 'Redo'
      },
      {
        name: 'Cut',
        newCategory: true
      },
      {
        name: 'Copy'
      },
      {
        name: 'Paste'
      },
      {
        name: 'Delete'
      },
      {
        name: 'Select all',
        newCategory: true
      },
      {
        name: 'Duplicate to left',
        newCategory: true
      },
      {
        name: 'Duplicate to right'
      },
      {
        name: 'Flip horizontally',
        newCategory: true
      },
      { name: 'Conjugate transpose' }
    ]
  },
  {
    name: 'View'
  },
  {
    name: 'Insert'
  },
  {
    name: 'Execute'
  },
  {
    name: 'Tools'
  },
  {
    name: 'Windows'
  },
  {
    name: 'Help',
    items: [
      {
        name: 'Update'
      },
      {
        name: 'About'
      }
    ]
  }
]

// -----------------------------------------------------------------------------
// Logics
// -----------------------------------------------------------------------------
const menu_element = ref(null)

onMounted(() => {
  initMenu()
})

const initMenu = () => {
  const menu_el = menu_element.value

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
    if (event.target.dataset.menuItem != undefined) {
      menu_el.classList.toggle('active')
    }
  });

  menu_el.addEventListener('keydown', (event) => {
    // ESC
    if (event.keyCode == 27) {
      closeMenu()
    }

    const children = [...menu_el.children]
    const isChildOpen = [...menu_el.children].map(el => el.classList.contains("active"))
    const currentOpenIndex = isChildOpen.indexOf(true)

    // Left
    if (event.keyCode == 37) {
      if (currentOpenIndex === 0) return

      children.forEach(el => {
        el.classList.remove('active')
      });

      children[currentOpenIndex - 1].classList.add('active')
      if (children[currentOpenIndex - 1].children.length) {
        children[currentOpenIndex - 1].children[0].children[0].focus()
      } else {
        children[currentOpenIndex - 1].focus()
      }
    }

    // Right
    if (event.keyCode == 39) {
      if (currentOpenIndex === children.length - 1) return

      children.forEach(el => {
        el.classList.remove('active')
      });

      children[currentOpenIndex + 1].classList.add('active')
      if (children[currentOpenIndex + 1].children.length) {
        children[currentOpenIndex + 1].children[0].children[0].focus()
      } else {
        children[currentOpenIndex + 1].focus()
      }
    }

    const currentSubmenu_els = children[currentOpenIndex].children[0].children
    const currentSubMenuFocus = [...currentSubmenu_els].map(el => el === document.activeElement)
    const currentSubMenuFocusIndex = currentSubMenuFocus.indexOf(true)
    const lastSubMenuIndex = currentSubmenu_els.length - 1
    const isAllSubMenuBlur = currentSubMenuFocus.every(el => el === false)

    // Up
    if (event.keyCode == 38) {
      // if all empty -> focus the last one
      if (isAllSubMenuBlur) {
        currentSubmenu_els[lastSubMenuIndex].focus()
      } else {
        if (currentSubMenuFocusIndex === 0) {
          currentSubmenu_els[lastSubMenuIndex].focus()
        } else {
          currentSubmenu_els[currentSubMenuFocusIndex - 1].focus()
        }
      }
    }

    // Down
    if (event.keyCode == 40) {
      // if all empty -> focus the first one
      if (isAllSubMenuBlur) {
        currentSubmenu_els[0].focus()
      } else {
        if (currentSubMenuFocusIndex === lastSubMenuIndex) {
          currentSubmenu_els[0].focus()
        } else {
          currentSubmenu_els[currentSubMenuFocusIndex + 1].focus()
        }
      }
    }
  });

  // .menubar-body > li
  [...menu_el.children].forEach(el => {
    el.addEventListener('mousemove', function () {
      if (this.classList.contains('active')) return

      [...this.parentElement.children].forEach(el => {
        if (el === this) {
          this.focus()
          el.classList.add('active')
        } else {
          el.classList.remove('active')
        }
      });

    })

    el.addEventListener('mouseleave', function () {
      if (!menu_el.classList.contains('active')) this.classList.remove('active');
    })
  });

  // .menubar-body > li > ul > li
  [...document.querySelectorAll('.menubar-body > li > ul > li')].forEach(el => {
    el.addEventListener('mouseenter', function () {
      if (this.classList.contains('active')) return

      [...this.parentElement.children].forEach(el => {
        if (el === this) {
          this.focus()
        } else {
          el.classList.remove('active')
        }
      });
    })

    el.addEventListener('mouseleave', function () {
      if (!menu_el.classList.contains('active')) this.classList.remove('active');
    })

    el.addEventListener('focus', function () {
      this.classList.add('active');
    })

    el.addEventListener('blur', function () {
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

.menubar-body > li {
  position: relative;

  display: flex;
  align-items: center;

  padding: 0 12px;
}

.menubar-body > li.active {
  background: rgba(0, 0, 0, 0.1);
}

.menubar-body > li > ul {
  display: none;

  list-style: none;
  padding: 0;
  margin: 0;

  color: black;
}

.menubar-body.active > li.active {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.menubar-body.active > li.active > ul {
  position: absolute;

  display: flex;
  flex-direction: column;

  left: 0px;
  top: calc(100% + 1px);
  background: #f5f9ff;

  filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04))
    drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
}

.menubar-body > li > ul > li {
  position: relative;
  padding: 8px;

  cursor: pointer;
  white-space: nowrap;
}

.menubar-body > li > ul > li.active {
  background: rgba(0, 0, 0, 0.1);
}

.menubar-body > li > ul > li[data-newcategory="true"] {
  border-top: 1px solid #0061ff;
}
</style>