export function openNoticeModal () {
  const modal = document.getElementById('bj-notice-modal')
  if (modal) modal.classList.add('open')
}

export function closeNoticeModal () {
  const modal = document.getElementById('bj-notice-modal')
  if (modal) modal.classList.remove('open')
}

// Expose on window for easy global access / inline event handlers
if (typeof window !== 'undefined') {
  window.openNoticeModal = openNoticeModal
  window.closeNoticeModal = closeNoticeModal
}

// Close notice modal on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' || e.keyCode === 27) {
    closeNoticeModal()
  }
})

export function initializeLoaderAndNotice (initialRoute) {
  const loader = document.getElementById('bj-page-loader')
  const noticeModal = document.getElementById('bj-notice-modal')

  if (noticeModal && !noticeModal.__inited) {
    noticeModal.__inited = true
    noticeModal.addEventListener('click', (e) => {
      if (e.target.closest('.bj-notice-close') || e.target.classList.contains('bj-notice-backdrop')) {
        closeNoticeModal()
      }
    })
  }

  // If loading directly on auth routes (/vn/vn/login or /vn/vn/register), dismiss loader immediately
  if (initialRoute === 'login' || initialRoute === 'register') {
    if (loader) {
      loader.style.display = 'none'
      loader.classList.add('hidden')
    }
    if (noticeModal) {
      noticeModal.classList.remove('open')
    }
    return
  }

  // Normal flow: animate loader for 1.2s, fade out, then open notice modal
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden')
      setTimeout(() => {
        if (noticeModal) {
          openNoticeModal()
        }
      }, 300)
    }, 1200)
  } else if (noticeModal) {
    setTimeout(() => {
      openNoticeModal()
    }, 500)
  }
}
