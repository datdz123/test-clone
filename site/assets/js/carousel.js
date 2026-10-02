const INTERVAL_MS = 4000
const TRANSITION = 'transform 0.5s ease'
const UNIT = 'carousel-frame-alpha__unit'
const DUPLICATED_CLASS = `${UNIT}--duplicated`
const STATE_CLASSES = ['active', 'prev', 'next'].map((name) => `${UNIT}--${name}`)

// The site renders [clones][real units][clones] so wrapping needs no extra DOM work
function initializeCarousel (root) {
  const track = root.querySelector('.carousel-frame-alpha__track')
  if (!track) return

  const units = Array.from(track.children).filter((el) => el.classList.contains(UNIT))
  const total = units.filter((el) => !el.classList.contains(DUPLICATED_CLASS)).length
  if (total < 1 || units.length < total * 3) return

  // Inline heights from the original script hide non-active units
  units.forEach((unit) => { unit.style.height = '' })

  let index = 0
  let timer = null

  const getStep = () => units[total].offsetLeft - units[total - 1].offsetLeft

  const markStates = () => {
    const position = total + index
    units.forEach((unit, i) => {
      STATE_CLASSES.forEach((name) => unit.classList.remove(name))
      if (i === position) unit.classList.add(STATE_CLASSES[0])
      if (i === position - 1) unit.classList.add(STATE_CLASSES[1])
      if (i === position + 1) unit.classList.add(STATE_CLASSES[2])
    })
  }

  const moveTo = (next, animate = true) => {
    index = next
    track.style.transition = animate ? TRANSITION : 'none'
    track.style.transform = `translate3d(${-(total + index) * getStep()}px, 0, 0)`
    markStates()
  }

  // After sliding onto a clone, jump back to the matching real unit without animation
  track.addEventListener('transitionend', () => {
    if (index < 0 || index >= total) moveTo((index + total) % total, false)
  })

  // Hidden modals report zero width, so realign once the carousel gets a real size
  new ResizeObserver(() => moveTo(index, false)).observe(root)

  // A single slide never moves, but it still has to sit on the real unit
  if (total === 1) {
    moveTo(0, false)
    return
  }

  const start = () => {
    stop()
    timer = setInterval(() => moveTo(index + 1), INTERVAL_MS)
  }
  const stop = () => clearInterval(timer)

  const scope = root.parentElement
  const prev = scope.querySelector('.navigation__prev')
  const next = scope.querySelector('.navigation__next')
  const navigate = (direction) => {
    if (index < 0 || index >= total) return
    moveTo(index + direction)
    start()
  }
  if (prev) prev.addEventListener('click', () => navigate(-1))
  if (next) next.addEventListener('click', () => navigate(1))

  root.addEventListener('mouseenter', stop)
  root.addEventListener('mouseleave', start)
  window.addEventListener('resize', () => moveTo(index, false))

  moveTo(0, false)
  // Only run while the carousel is visible, e.g. not inside a hidden modal
  new IntersectionObserver((entries) => {
    entries.forEach((entry) => (entry.isIntersecting ? start() : stop()))
  }).observe(root)
}

export function initializeCarousels () {
  document.querySelectorAll('.carousel-frame-alpha').forEach(initializeCarousel)
}
