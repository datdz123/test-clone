// Classic (non-module) script: it must swap the layout before main.js queries the DOM
;(function () {
  var script = document.currentScript
  var breakpoint = Number(script.getAttribute('data-breakpoint')) || 1024
  var query = window.matchMedia('(max-width: ' + (breakpoint - 1) + 'px)')
  var root = document.documentElement
  // Site CSS is written in rem where 1rem = 1% of the design width
  var MAX_REM_WIDTH = 480

  function updateRootSize () {
    var width = Math.min(window.innerWidth, MAX_REM_WIDTH)
    root.style.fontSize = (width / 100) + 'px'
    root.style.setProperty('--dvh', window.innerHeight + 'px')
  }

  // Crossing the breakpoint changes the whole markup, so start over
  query.addEventListener('change', function () { window.location.reload() })

  if (!query.matches) return

  var template = document.getElementById('layout-mobile')
  var content = document.importNode(template.content, true)
  var desktopRoot = document.querySelector('app-root')

  Array.prototype.forEach.call(content.querySelectorAll('style'), function (style) {
    document.head.appendChild(style)
  })
  desktopRoot.parentNode.replaceChild(content.querySelector('app-root'), desktopRoot)

  root.classList.replace('is-desktop', 'is-mobile')
  document.body.removeAttribute('style')
  updateRootSize()
  window.addEventListener('resize', updateRootSize)
})()
