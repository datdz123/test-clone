// Mobile drawer: the hamburger toggles `.menu.active`, the mask or close icon dismisses it
function setMenuOpen (isOpen) {
  const menu = document.querySelector('.menu')
  const mask = document.querySelector('.menu-mask')
  if (!menu) return
  menu.classList.toggle('active', isOpen)
  if (isOpen) revealItems(menu)
  document.body.classList.toggle('is-menu-open', isOpen)
  if (mask) {
    mask.style.display = isOpen ? 'block' : 'none'
    mask.style.opacity = isOpen ? '1' : '0'
  }
}

const ITEM_DELAY_MS = 30

// Saved markup freezes the entrance animation at opacity 0, so replay it each time the drawer opens
function revealItems (menu) {
  Array.from(menu.querySelectorAll('[style*="opacity: 0"]')).forEach((item, index) => {
    item.style.transition = `opacity 0.3s ${index * ITEM_DELAY_MS}ms, transform 0.3s ${index * ITEM_DELAY_MS}ms`
    item.style.opacity = '1'
    item.style.transform = 'none'
  })
}

export function initializeMenu () {
  document.addEventListener('click', (event) => {
    if (event.target.closest('.menu-btn')) {
      setMenuOpen(true)
    } else if (event.target.closest('.menu-mask, .menu .btn-close, .menu [data-route]')) {
      setMenuOpen(false)
    }
  })

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setMenuOpen(false)
  })
}
