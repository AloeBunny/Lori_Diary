# Lori Diary — Routine Building PWA

A habit-tracking Progressive Web App designed for neurodivergent users who need structure without friction.

## What it does

- **Routine Timer**: HIIT-style step-by-step timer for morning/evening routines
- **Check-in System**: Daily habit tracking with streak visualization
- **Point System**: Gamified progress with rewards
- **Heatmap + Calendar**: Visual history of your consistency
- **Encouragement**: Gentle nudges from Lori, your bunny companion

## Why it exists

I wanted a routine app that doesn't punish you for missing a day. Most habit trackers are built for neurotypical brains — they assume consistent motivation and linear progress. This one is built for brains that need a softer landing.

Lori (the bunny) is the interface. She doesn't judge. She just sits there eating carrots and waiting for you to come back.

## Tech Stack

- **Vanilla JS** — No framework. No build step. Just files.
- **PWA** — Add to home screen on iOS/Android. Works offline.
- **IndexedDB** — All data stays on your device. No account. No server.
- **GitHub Pages** — Free hosting. Auto-deploy on push.

## Live Demo

[aloebunny.github.io/Lori_Diary](https://aloebunny.github.io/Lori_Diary/)

## Quick Start

1. Open the link above in Safari (iOS) or Chrome (Android)
2. Tap "Add to Home Screen"
3. Done. It's an app now.

## Architecture

```
src/
  index.html          — Entry point
  app.js              — Router + init
  db.js               — IndexedDB layer
  router.js           — Hash-based SPA router
  sw.js               — Service Worker (cache-first)
  components/         — 16 reusable UI components
  screens/            — 19 screens (dashboard, routine, learning, settings)
  utils/              — Helpers, audio, notifications, backup
```

Designed by an SAP consultant who applied ERP system thinking to personal productivity. Built by an AI agent team in one day.

## About

Part of the [Hakoniwa](https://github.com/AloeBunny) project — a virtual company run by AI agents, built for $200/month.

## License

MIT
