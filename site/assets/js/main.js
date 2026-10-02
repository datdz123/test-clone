import { initializeCarousels } from './carousel.js'
import { initializeMarquees } from './marquee.js'
import { initializeFormControls } from './form.js'
import { initializeSidebar } from './sidebar.js'
import { initializeMenu } from './menu.js'
import { createRouter, getRoute } from './router.js'
import { openModal, closeModal, onRequestClose } from './modal.js'

function render (route) {
  if (route === 'login' || route === 'register') {
    openModal(route)
  } else {
    closeModal()
  }
}

const router = createRouter(render)

// Close (X, backdrop, Esc) returns to home without reload
onRequestClose(() => router.go('home'))

render(getRoute())

initializeCarousels()
initializeMarquees()
initializeFormControls()
initializeSidebar()
initializeMenu()
