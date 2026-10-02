export const BASE = '/vn/vn/'
const MODAL_ROUTES = ['login', 'register']

export function getRoute () {
  const { pathname } = window.location
  if (!pathname.startsWith(BASE)) return 'home'
  const rest = pathname.slice(BASE.length).replace(/\/+$/, '')
  return MODAL_ROUTES.includes(rest) ? rest : 'home'
}

function toUrl (route) {
  return route === 'home' ? BASE : BASE + route
}

export function createRouter (onChange) {
  function go (route, { replace = false } = {}) {
    const url = toUrl(route)
    if (url === window.location.pathname) return
    const method = replace ? 'replaceState' : 'pushState'
    window.history[method]({ route }, '', url)
    onChange(route)
  }

  window.addEventListener('popstate', () => onChange(getRoute()))

  // Keep new-tab shortcuts working by ignoring modified clicks
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented) return
    if (event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return

    const link = event.target.closest('[data-route]')
    if (!link) return

    event.preventDefault()
    go(link.dataset.route, { replace: link.hasAttribute('data-replace') })
  })

  return { go, current: getRoute }
}
