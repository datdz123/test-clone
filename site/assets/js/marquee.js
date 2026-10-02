const SPEED = 60 // px per second

function initializeMarquee (box) {
  const list = box.querySelector('ul')
  if (!list || !list.children.length) return

  // Clone items until one pass of the content is wider than the viewport
  const originals = Array.from(list.children)
  list.style.transform = 'translate3d(0, 0, 0)'
  const cycleWidth = () => list.scrollWidth
  let guard = 0
  while (cycleWidth() < box.clientWidth * 2 && guard < 10) {
    originals.forEach((item) => list.appendChild(item.cloneNode(true)))
    guard++
  }
  const loopWidth = list.scrollWidth / (guard + 1)

  let offset = 0
  let last = performance.now()
  let paused = false

  const tick = (now) => {
    if (!paused) {
      offset = (offset + ((now - last) / 1000) * SPEED) % loopWidth
      list.style.transform = `translate3d(${-offset}px, 0, 0)`
    }
    last = now
    requestAnimationFrame(tick)
  }

  box.addEventListener('mouseenter', () => { paused = true })
  box.addEventListener('mouseleave', () => { paused = false })
  requestAnimationFrame(tick)
}

export function initializeMarquees () {
  document.querySelectorAll('.marquee').forEach(initializeMarquee)
}
