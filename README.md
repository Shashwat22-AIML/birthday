# Birthday Website for {name}

A scroll-driven birthday website built as a fake "product page" where the product is **her** — "The world's most unnecessarily wonderful person."

## Features

- **Loader** with animated counter and fake boot lines
- **Hero** with fanned photo stack that scrubs apart on scroll
- **"Isn't Just A"** section with word-by-word reveal and parallax photos
- **Spec Sheet** with counting stats and interactive mood slider
- **Pinned Gallery** — core scroll effect with parallax photos and hero crossfade
- **Flip Cards** — 3D CSS flip cards with memories + scramble-text decode button
- **Reviews** — animated review cards + horizontal marquee
- **Choose Your Own** — three tier cards (illusion of choice)
- **Pivot** — background scrubs from cream to night, "Okay, joke's over."
- **Letter** — sincere personal letter revealed line by line
- **Finale** — interactive birthday cake with blow-out candle + confetti
- **Date Lock** — optional lock until birthday (bypass with `?preview=1`)
- **Reduced Motion** support — respects `prefers-reduced-motion`

## Quick Start

```bash
# Install dependencies
npm install

# Generate placeholder photos (for testing without real photos)
npm run photos:placeholders

# Or optimize your own photos (see "Adding Photos" below)
npm run photos

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## Adding Photos

1. Drop your original photos into `photos-original/` (any format: JPG, PNG, HEIC, etc.)
2. Run the optimization script:
   ```bash
   npm run photos
   ```
   This will:
   - Resize to max 1400px wide
   - Convert to WebP (quality 78)
   - Output to `public/photos/` as `photo-01.webp`, `photo-02.webp`, etc.
   - Generate `src/photos.generated.json` with dimensions

3. Update `src/content.js` to reference your photo filenames in the `memories` array.

**Note:** The site works with 5-15 photos. If `public/photos/` is empty, gradient placeholders are used automatically.

## Editing Content

All text, stats, and configuration lives in **`src/content.js`** — this is the only file you need to edit.

### Required Fields

```js
export const content = {
  name: "Her Name",           // Used everywhere as {name}
  birthdayLabel: "6 October", // Displayed in hero, finale, lock screen
  fromName: "Your Name",      // Letter signature
  lockUntil: null,            // Optional: ISO date string, e.g. "2025-10-06T00:00:00"
  
  stats: {
    messagesExchanged: 109189,
    photosAndVideosSent: 6366,
    daysOfTalking: 379,
    timesSheSaidAree: 2800,
    timesSheCalledMeMittu: 500,
    // Add 4 joke stats:
    jokeStat1: { label: "Custom Stat", value: 12345, suffix: "x" },
    jokeStat2: { label: "Another Stat", value: 678, suffix: "%" },
    jokeStat3: { label: "Third Stat", value: 42, suffix: "" },
    jokeStat4: { label: "Fourth Stat", value: 999, suffix: " pts" }
  },
  
  memories: [
    { photo: "photo-01.webp", caption: "Caption", text: "Memory text..." },
    // ... 6 total
  ],
  
  letter: [
    "Paragraph 1 of sincere letter...",
    "Paragraph 2...",
    // ... 5 paragraphs
  ],
  
  reviews: [
    { stars: 5, quote: "Amazing!", who: "Mom", tag: "Verified Purchaser" },
    // ... 5 total
  ],
  
  galleryCaptions: [
    "IMG_01 / thermodynamic stability",
    // ... up to 15
  ],
  
  footerDisclaimer: "This entire site is a fictional creative project. {name} is very real."
};
```

### TODO Placeholders

Search for `TODO_USER` in `src/content.js` — these are the fields you need to fill in:
- `TODO_USER_NAME` — Her name
- `TODO_USER_LABEL_1` through `TODO_USER_LABEL_4` — Joke stat labels
- `TODO_USER_MEMORY_1` through `TODO_USER_MEMORY_6` — Flip card memory texts
- `TODO_USER_LETTER_PARA_1` through `TODO_USER_LETTER_PARA_5` — Letter paragraphs
- `TODO_USER_REVIEW_1` through `TODO_USER_REVIEW_5` — Review quotes
- `TODO_USER_REVIEWER_1` through `TODO_USER_REVIEWER_5` — Reviewer names
- `TODO_USER_TAG_1` through `TODO_USER_TAG_5` — Review tags
- `TODO_USER_PLACE_1` — Place reference in memories

## Deployment

### Vercel
1. Push to GitHub
2. Import project in Vercel
3. Build command: `npm run build`
4. Output directory: `dist`
5. Deploy

### Netlify
1. Push to GitHub
2. New site from Git
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

### GitHub Pages
1. Enable Pages in repo settings (source: GitHub Actions)
2. Add `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages
on:
  push:
    branches: [main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: dist
  deploy:
    needs: build
    runs-on: ubuntu-latest
    permissions:
      pages: write
      id-token: write
    steps:
      - uses: actions/deploy-pages@v4
```

## Tech Stack

- **Vite** — Build tool
- **Vanilla JS (ES Modules)** — No React, no TypeScript
- **GSAP + ScrollTrigger** — Scroll animations
- **Lenis** — Smooth scrolling
- **canvas-confetti** — Confetti burst
- **Sharp** — Photo optimization (build-time only)
- **Google Fonts** — Instrument Serif, Space Grotesk, JetBrains Mono

## Performance

- Only `transform` and `opacity` animated
- Images lazy-loaded below fold
- Critical photos preloaded
- `ScrollTrigger.refresh()` after fonts/images load
- Total JS ~100KB gzipped (well under 250KB target)

## Browser Support

- Modern browsers (last 2 versions)
- Mobile Safari, Chrome for Android
- Respects `prefers-reduced-motion`

## Customization

### Colors
Edit CSS variables in `src/style.css`:
```css
:root {
  --cream: #F4EEE6;
  --ink: #1B1612;
  --cork: #C9955C;
  --pink: #F2A7B8;
  --night: #14100E;
}
```

### Fonts
Change Google Fonts imports in `index.html` and update `--font-*` variables in `src/style.css`.

### Sections
Each section is in `src/sections/*.js`. They're initialized in `src/main.js` via `initSections()`.

## License

MIT — Built with love for a birthday.