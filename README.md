# LuxCraft Invoices & Estimates

Invoice and estimate builder for LuxCraft Renovations.

- **Invoices** (`/`): progress-draw invoices. Set the contract, number of draws, and which draw is due; compile a PDF.
- **Estimates** (`/estimate.html`): itemized estimates grouped into sections, with optional add-ons, discount, tax, payment schedule, terms, exclusions and a signature block. **Make invoice** turns an accepted estimate into a deposit invoice, using its payment schedule as the draws.

Business details are shared by both and edited in **Settings**. Every compiled document is kept under **Saved invoices** / **Saved estimates**.

## Structure

```
public/
  index.html          invoices
  estimate.html       estimates
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

Settings, saved invoices and saved estimates are stored in the browser (localStorage) for the site's address. They do not live on the server, so redeploying never erases them. They are per browser and per device. Use the Export backup buttons in Settings regularly (invoices and estimates each have one), and **Import backup** to restore or move to another device.

## Editing the app

Invoices are in `public/index.html`, estimates in `public/estimate.html`. Commit and push; Railway redeploys automatically.
