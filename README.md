# 🎨 Hue — Palette Generator

A clean, modern color-palette generator. Click **Generate** (or hit `space`) to
shuffle five harmonious colors, click any swatch to copy its hex code, and lock
the ones you love so they survive the next shuffle.

It's not random noise — palettes are built in HSL using real color-theory
relationships (analogous, complementary, triadic, monochrome), so every result
looks intentional.

## Features

- **Five colors at once**, each with its hex code.
- **Click to copy** any color to your clipboard, with a live toast confirmation.
- **🔒 Lock** colors you want to keep between shuffles.
- **Color schemes** — pick a harmony rule or let "Surprise me" choose for you.
- **Keyboard-first** — press `space` to generate.
- **Zero dependencies**, fully responsive, light/dark-friendly.

## Run locally

It's a static site — just open `index.html` in a browser, or serve it:

```bash
npx serve .
```

## Deploy to Vercel

This repo is deploy-ready (static site, no build step).

**Option A — CLI:**

```bash
npm i -g vercel
vercel        # preview deploy
vercel --prod # production deploy
```

**Option B — Dashboard:**

1. Push this folder to a Git repo (GitHub/GitLab/Bitbucket).
2. Go to [vercel.com/new](https://vercel.com/new) and import the repo.
3. Framework preset: **Other**. Leave build & output settings empty.
4. Click **Deploy**.

That's it — Vercel serves the static files directly.

## Files

| File          | Purpose                                  |
| ------------- | ---------------------------------------- |
| `index.html`  | Markup                                   |
| `styles.css`  | Styling & animations                     |
| `script.js`   | Palette generation, copy, lock, controls |
| `vercel.json` | Clean URLs + security headers            |
