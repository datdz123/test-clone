const MINI_CLASSES = [
  ['.left-menu', 'left-menu--mini'],
  ['.left-menu-content__toggle-box', 'toggle-box--fold'],
  ['.nav-item', 'nav-item--mini']
]

// Mini classes are the collapsed state captured from the site; toggling them gives the open state
function setSidebarOpen (isOpen) {
  MINI_CLASSES.forEach(([selector, name]) => {
    document.querySelectorAll(selector).forEach((el) => el.classList.toggle(name, !isOpen))
  })
  const icon = document.querySelector('.head-arrow__icon')
  if (icon) icon.style.transform = isOpen ? 'rotate(180deg)' : ''
}

export function initializeSidebar () {
  const toggle = document.querySelector('.left-menu__head-arrow')
  if (!toggle) return

  let isOpen = true
  setSidebarOpen(isOpen)

  toggle.addEventListener('click', () => {
    isOpen = !isOpen
    setSidebarOpen(isOpen)
  })
}
