const views = Array.from(document.querySelectorAll('[data-modal-view]'))
const FOCUSABLE = 'a[href], button:not([disabled]), input:not([type="button"]), select, textarea, [tabindex]:not([tabindex="-1"])'

let lastFocused = null
let requestClose = () => {}

const getOpenView = () => views.find((view) => !view.hidden)

export function onRequestClose (fn) {
  requestClose = fn
}

function trapFocus (event) {
  const view = getOpenView()
  if (!view) return
  const focusable = Array.from(view.querySelectorAll(FOCUSABLE)).filter((el) => el.offsetParent !== null)
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault()
    last.focus()
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault()
    first.focus()
  }
}

function onKeydown (event) {
  if (event.key === 'Escape') {
    requestClose()
    return
  }
  if (event.key === 'Tab') trapFocus(event)
}

export function openModal (name) {
  const wasClosed = !getOpenView()
  views.forEach((view) => { view.hidden = view.dataset.modalView !== name })

  if (wasClosed) {
    lastFocused = document.activeElement
    document.body.classList.add('is-modal-open')
    document.addEventListener('keydown', onKeydown)
  }

  const view = views.find((el) => el.dataset.modalView === name)
  const firstInput = view && view.querySelector('input.input')
  if (firstInput) firstInput.focus()
}

export function closeModal () {
  if (!getOpenView()) return
  views.forEach((view) => { view.hidden = true })
  document.body.classList.remove('is-modal-open')
  document.removeEventListener('keydown', onKeydown)
  if (lastFocused && lastFocused.focus) lastFocused.focus()
}

document.addEventListener('click', (event) => {
  if (event.target.closest('[data-modal-close]')) requestClose()
})
