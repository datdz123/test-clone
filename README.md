# bj88 static clone

Static HTML/CSS/JS rebuild of the home page with login and register modals at `/vn/vn/login` and `/vn/vn/register`. The same URLs switch between desktop and mobile layouts below 1024px.

```bash
npm install
npm run dev   # sync routes and serve site/ on http://localhost:3000/vn/vn/
```

Serve the `site/` folder as the web root: every asset path is absolute (`/assets/...`). With VS Code Live Server the root is already set in `.vscode/settings.json`.

## Layout

- `site/vn/vn/index.html` holds the desktop markup plus a `<template>` with the mobile markup; `site/assets/js/layout.js` swaps it in on narrow screens.
- `site/vn/vn/login/` and `site/vn/vn/register/` are generated copies. Run `npm run sync` after editing `index.html`.
- `scripts/build.js` regenerated `index.html` from the saved Angular pages. Those pages were removed, so edit `index.html` directly from now on.

## Hotlink warning

Banners, game thumbnails, background images and fonts referenced from CSS are loaded from `img.b729j88.com`. The demo depends on that host being up; if it changes files or blocks hotlinking, those images disappear. Images that were saved with the pages live in `site/assets/img`.
