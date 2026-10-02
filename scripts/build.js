const cheerio = require('cheerio')
const fs = require('fs')
const path = require('path')

const PROJECT = path.join(__dirname, '..')
const SITE = path.join(PROJECT, 'site')
const IMG_DIR = path.join(SITE, 'assets', 'img')
const CSS_DIR = path.join(SITE, 'assets', 'css')
const OUT = path.join(SITE, 'vn', 'vn', 'index.html')

// Origin that served root-relative url(/images/...) references inside the saved CSS
const ASSET_ORIGIN = 'https://img.b729j88.com'
const BREAKPOINT = 1024

// Each layout is a separate Angular render, so it needs its own pages and stylesheets
const LAYOUTS = {
  desktop: {
    pages: {
      home: 'BJ88_ Đá Gà Trực Tiếp Thomo Hôm Nay _ Nhà Cái Online Uy Tín.html',
      login: 'login.html',
      register: 'bj88 - Đăng ký ngay để nhận tiền trải nghiệm và phần thưởng giới thiệu.html'
    },
    css: ['dark-standard-desktop.css'],
    media: `(min-width: ${BREAKPOINT}px)`
  },
  mobile: {
    pages: { home: 'home-mb.html', login: 'login-mb.html', register: 'register-mb.html' },
    css: ['standard-mobile.css', 'dark-standard-mobile.css'],
    media: `(max-width: ${BREAKPOINT - 1}px)`
  }
}

const load = (name) => cheerio.load(fs.readFileSync(path.join(PROJECT, name), 'utf8'))

// Saved pages reference "./<folder>_files/<name>"; map them to flat site assets
const filesRef = /^\.\/[^/]+_files\/(.+)$/

const assetUrl = (value) => {
  const match = filesRef.exec(value || '')
  if (!match) return value
  const name = decodeURIComponent(match[1])
  return (/\.css$/i.test(name) ? '/assets/css/' : '/assets/img/') + name
}

const copyAssets = () => {
  fs.mkdirSync(IMG_DIR, { recursive: true })
  fs.mkdirSync(CSS_DIR, { recursive: true })
  const seen = new Map()
  let count = 0

  Object.values(LAYOUTS).forEach((layout) => {
    Object.values(layout.pages).forEach((page) => {
      const folder = path.join(PROJECT, page.replace(/\.html$/, '_files'))
      if (!fs.existsSync(folder)) return
      fs.readdirSync(folder).forEach((file) => {
        const isCss = /\.css$/i.test(file)
        // Scripts and trackers are replaced by hand-written JS
        if (/\.(js|html)$/i.test(file) || /^(js|gtm|sp)(\(\d+\))?(\.js)?$/.test(file)) return
        if (isCss && !layout.css.includes(file)) return
        const src = path.join(folder, file)
        const dest = path.join(isCss ? CSS_DIR : IMG_DIR, file)
        const size = fs.statSync(src).size
        if (seen.has(dest)) {
          if (seen.get(dest) !== size) console.warn('Same name, different size:', file)
          return
        }
        seen.set(dest, size)
        fs.copyFileSync(src, dest)
        count++
      })
    })
  })
  console.log(`Copied ${count} assets`)
}

const rewriteCss = () => {
  fs.readdirSync(CSS_DIR).forEach((file) => {
    if (file === 'modal.css') return
    const target = path.join(CSS_DIR, file)
    const css = fs.readFileSync(target, 'utf8').replace(/url\(\s*(['"]?)(\/(?!\/)[^'")]+)\1\s*\)/g, (match, quote, url) => `url("${ASSET_ORIGIN}${url}")`)
    fs.writeFileSync(target, css)
  })
}

const stripNoise = ($) => {
  $('script, noscript, iframe, base, .cdk-overlay-container, app-rotating-phone, link[rel="manifest"], link[rel="preconnect"], link[rel="preload"], link[rel="modulepreload"], meta[http-equiv="refresh"]').remove()
  $('*').each((index, el) => {
    Object.keys(el.attribs || {}).forEach((name) => {
      if (name.startsWith('ng-reflect-') || name === 'ng-version' || name === 'ng-server-context') $(el).removeAttr(name)
    })
  })
  $('link').removeAttr('integrity').removeAttr('crossorigin')
}

const rewriteUrls = ($) => {
  $('[src], link[href], [poster]').each((index, el) => {
    ;['src', 'href', 'poster'].forEach((attr) => {
      const value = $(el).attr(attr)
      if (value && filesRef.test(value)) $(el).attr(attr, assetUrl(value))
    })
  })
  $('[srcset]').each((index, el) => {
    const out = $(el).attr('srcset').split(',').map((part) => {
      const [url, ...rest] = part.trim().split(/\s+/)
      return [assetUrl(url), ...rest].join(' ')
    })
    $(el).attr('srcset', out.join(', '))
  })
}

const extractPopup = (pageName, name) => {
  const $ = load(pageName)
  const popup = $('app-popup-page').first()
  popup.attr('data-modal-view', name).attr('hidden', '')
  popup.find('.popup-page__backdrop, .popup-page-main__close').attr('data-modal-close', '')
  popup.find('a[href]').each((index, el) => {
    const match = /\/vn\/vn\/(register|login)(\(|$)/.exec($(el).attr('href'))
    if (match) $(el).attr({ href: `/vn/vn/${match[1]}`, 'data-route': match[1], 'data-replace': '' })
  })
  // Other links inside the popup go nowhere
  popup.find('a[href^="http"]').attr('href', '#')
  const styles = $('head style').map((index, el) => $(el).html()).get()
  return { html: $.html(popup), styles }
}

// Header and menu buttons become real links so they work without JS
const routeLinks = ($, selector, route) => {
  $(selector).each((index, el) => {
    const node = $(el)
    if (el.name === 'a') {
      node.attr({ href: `/vn/vn/${route}`, 'data-route': route })
      return
    }
    const attrs = { ...el.attribs, href: `/vn/vn/${route}`, 'data-route': route, role: 'button' }
    node.replaceWith($('<a></a>').attr(attrs).html(node.html()))
  })
}

const LINKS = {
  desktop: [
    ['.auth-container__button--primary', 'login'],
    ['.auth-container__button--secondary', 'register'],
    ['.header-desktop__logo', 'home']
  ],
  mobile: [
    ['a.login.header-right-link, .login-button a', 'login'],
    ['a.register.header-right-link, .register-button a', 'register'],
    ['header .logo', 'home']
  ]
}

const buildLayout = (layoutName) => {
  const layout = LAYOUTS[layoutName]
  const $ = load(layout.pages.home)
  const knownStyles = new Set($('head style').map((index, el) => $(el).html()).get())

  stripNoise($)
  $('link[rel="stylesheet"]').remove()

  // Merge component styles that only exist on the login/register pages
  const popups = ['login', 'register'].map((name) => {
    const popup = extractPopup(layout.pages[name], name)
    popup.styles.forEach((css) => {
      if (css && !knownStyles.has(css)) {
        knownStyles.add(css)
        $('head').append(`<style>${css}</style>`)
      }
    })
    return popup.html
  })

  // The saved home page has no open popup, so drop its empty placeholder first
  $('app-popup-page').remove()
  $('app-root').append(popups.join('\n'))

  LINKS[layoutName].forEach(([selector, route]) => {
    if (route === 'home') $(selector).attr('data-route', 'home')
    else routeLinks($, selector, route)
  })

  // Remaining navigation is inert so nothing jumps to the original site
  $('a[href^="http"], a[href^="./"]').each((index, el) => { $(el).attr('href', '#') })

  rewriteUrls($)
  return $
}

const main = () => {
  copyAssets()
  rewriteCss()

  const $ = buildLayout('desktop')
  const $mobile = buildLayout('mobile')

  // Mobile markup lives in a template and is swapped in by layout.js on narrow screens
  const desktopStyles = new Set($('head style').map((index, el) => $(el).html()).get())
  const mobileStyles = $mobile('head style').map((index, el) => $mobile(el).html()).get()
    .filter((css) => css && !desktopStyles.has(css))
  const template = `<template id="layout-mobile">${mobileStyles.map((css) => `<style>${css}</style>`).join('')}${$mobile.html($mobile('app-root'))}</template>`

  Object.values(LAYOUTS).forEach((layout) => {
    layout.css.forEach((file) => {
      $('head').append(`<link rel="stylesheet" href="/assets/css/${file}" media="${layout.media}">`)
    })
  })
  $('head').append('<link rel="stylesheet" href="/assets/css/modal.css">')
  $('meta[name="viewport"]').remove()
  $('head').prepend('<meta name="viewport" content="width=device-width, initial-scale=1.0">')

  $('body').attr('data-route', 'home')
  $('title').text('BJ88: Đá Gà Trực Tiếp Thomo Hôm Nay | Nhà Cái Online Uy Tín')
  $('body').append(template)
  $('body').append(`<script src="/assets/js/layout.js" data-breakpoint="${BREAKPOINT}"></script>`)
  $('body').append('<script type="module" src="/assets/js/main.js"></script>')

  fs.mkdirSync(path.dirname(OUT), { recursive: true })
  fs.writeFileSync(OUT, $.html())
  console.log('Wrote', OUT, `(${Math.round(fs.statSync(OUT).size / 1024)} KB)`)
}

main()
