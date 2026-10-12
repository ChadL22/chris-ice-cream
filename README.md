# Chris' Ice Cream & Mexican Food — Online Menu

A virtual menu for Chris' Ice Cream & Mexican Food in Nora Corners, Indianapolis.

- **Address:** 1484 East 86th St, Nora Corners Shopping Center, Indianapolis, IN 46240
- **Phone (orders):** (317) 255-2156
- **Hours:** 10:30am – 8:00pm, closed Sundays
- **Instagram:** [@ChrisIceCreamIndy](https://instagram.com/ChrisIceCreamIndy)

This site is a virtual menu only. It does not take online orders; customers order in person or by phone.

## How it's built

| File | What it holds |
|---|---|
| `index.html` | Page layout, styles, logo, and the code that draws the menu |
| `data/menu.json` | Food sections and items (prices, descriptions, sold out, hidden) |
| `data/ice-cream.json` | Ice cream sizes/prices, flavors, smoothies |
| `data/info.json` | Phone, hours, address, Instagram |
| `data/notice.json` | Closure / announcement banner |
| `.pages.yml` | Defines the admin forms managers use |
| `MANAGERS.md` | Plain-language guide for restaurant management |

The page loads the four JSON files when it opens, so content changes never require touching `index.html`.

**Previewing locally:** opening `index.html` by double-clicking won't load the menu (browsers block reading local files). From this folder, run `python3 -m http.server` and visit http://localhost:8000.

## Content management (for managers)

Managers edit through **Pages CMS** at https://app.pagescms.org — forms only, no code. Each save commits to this repo and GitHub Pages republishes in about a minute. See `MANAGERS.md`.

**One-time setup (owner):**
1. Sign in at https://app.pagescms.org with GitHub and grant it access to this repository.
2. For each manager: they create a free GitHub account, then add them under this repo's **Settings → Collaborators** (role: Write).
3. Send them `MANAGERS.md`.

Every save is a git commit, so any change can be reviewed or reverted from the repo's commit history.

## Publishing with GitHub Pages

1. **Settings → Pages**, source: `main` branch, root folder.
2. Once you own the domain, add it under **Custom domain** and point the domain's DNS at GitHub Pages.

## Before launch

- Swap the camera placeholder for Instagram's official glyph (free from Instagram's brand resources).
- Double-check every price against the current in-store menu.
