# LuxCraft Invoices

Progress-draw invoice builder for LuxCraft Renovations. Fill in the job, set the number of draws, and compile a professional PDF. Business details live in **Settings**; every compiled invoice is kept under **Saved invoices**.

## Structure

```
public/
  index.html          the whole app (UI, logo, PDF generator)
  luxcraft-logo.png   full-size logo
  favicon.png         browser tab icon
server.js             tiny static server (no dependencies)
package.json          start script for Railway / Node
railway.json          Railway deploy settings
```

## Run locally

```
npm start
```
Then open http://localhost:3000

## Deploy on Railway

1. Push this repo to GitHub.
2. In Railway: **New Project → Deploy from GitHub repo** and pick this repo.
3. When the deploy finishes: **Settings → Networking → Generate Domain** to get the URL.

No environment variables are needed. Railway provides `PORT` automatically.

## Where data is stored

Settings and saved invoices are stored in the browser (localStorage) for the site's address. They do not live on the server, so redeploying never erases them. They are per browser and per device. Use **Settings → Export backup** regularly, and **Import backup** to restore or move to another device.

## Editing the app

Everything is in `public/index.html`. Commit and push; Railway redeploys automatically.
