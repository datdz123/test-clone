const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', 'site', 'vn', 'vn')
const source = fs.readFileSync(path.join(root, 'index.html'), 'utf8')

const variants = {
  login: { title: 'Đăng nhập' },
  register: { title: 'Đăng ký' }
}

Object.entries(variants).forEach(([route, meta]) => {
  const html = source
    .replace('<body data-route="home">', `<body data-route="${route}">`)
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${meta.title}</title>`)
  fs.mkdirSync(path.join(root, route), { recursive: true })
  fs.writeFileSync(path.join(root, route, 'index.html'), html)
})

console.log('Synced routes:', Object.keys(variants).join(', '))
