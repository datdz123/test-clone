// Delegated so it also covers inputs inside the login and register modals
export function initializeFormControls () {
  document.addEventListener('click', (event) => {
    const eye = event.target.closest('.eyes')
    if (eye) {
      const input = eye.parentElement.querySelector('input.input')
      if (input) {
        const isHidden = input.type === 'password'
        input.type = isHidden ? 'text' : 'password'
        eye.classList.toggle('active', isHidden)
      }
      return
    }

    const clear = event.target.closest('input.clear')
    if (clear) {
      const input = clear.parentElement.querySelector('input.input')
      if (input) {
        input.value = ''
        input.focus()
      }
    }
  })

  // Floating promo banners and widgets have a close button
  document.addEventListener('click', (event) => {
    const close = event.target.closest('.float-banner .close, .float-wrap-btn__img--close, .game-entrance__btn-img--close')
    if (!close) return
    const target = close.closest('.float-banner, .float-wrap-btn, .game-entrance__btn')
    if (target) target.hidden = true
  })
}
