# Blu-ray Catalog

Mobile-first static web catalog for browsing a personal Blu-ray collection. Built with Vite, React, and TypeScript. Designed for GitHub Pages at `/Bluray/`.

**Live (after Pages is enabled):** https://morgankarven-sudo.github.io/Bluray/

## Features

- Poster grid browse (mobile-first, dark home-theater UI)
- Search by title
- Filter by genre and director
- Sort by title or year
- Detail modal: larger poster, year, directors, genres, runtime, synopsis
- Data driven by editable `public/movies.json`
- Sample movies are clearly badged; a banner reminds you to replace them

## Run locally

```bash
cd Bluray
npm install
npm run dev
```

Open the URL Vite prints (usually `http://localhost:5173/Bluray/`).

### Build / preview production

```bash
npm run build
npm run preview
```

The build uses `base: '/Bluray/'` so asset paths work on GitHub Pages.

## Movie JSON schema

Each entry in `public/movies.json` is an object:

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | string | yes | Stable unique id |
| `title` | string | yes | Display title |
| `year` | number | yes | Release year |
| `directors` | string[] | yes | One or more names |
| `genres` | string[] | yes | e.g. `["Sci-Fi", "Drama"]` |
| `runtimeMinutes` | number | no | Runtime in minutes |
| `synopsis` | string | yes | Short plot blurb |
| `posterUrl` | string | yes | Absolute image URL (or path under `public/`) |
| `format` | string | no | e.g. `"Blu-ray"` |
| `sample` | boolean | no | Set `true` for placeholder titles |

Example:

```json
{
  "id": "inception-2010",
  "title": "Inception",
  "year": 2010,
  "directors": ["Christopher Nolan"],
  "genres": ["Sci-Fi", "Action", "Thriller"],
  "runtimeMinutes": 148,
  "synopsis": "A thief who steals secrets through dream-sharing is offered a chance at redemption.",
  "posterUrl": "https://example.com/posters/inception.jpg",
  "format": "Blu-ray",
  "sample": false
}
```

## Add a batch of movies

1. Edit `public/movies.json`.
2. Append new objects using the schema above (keep valid JSON — trailing commas will break the file).
3. Prefer hosting posters yourself under `public/posters/` and referencing them as `/Bluray/posters/your-file.jpg`, or use absolute HTTPS URLs you have rights to use.
4. Run the local dev server and confirm the new titles appear.
5. Commit and push to `main` to redeploy (once Pages + Actions are set up).

## Replace sample movies

The starter catalog includes **sample** titles only (classic / public-domain style placeholders with Wikimedia Commons posters). They are **not** a real personal collection.

1. Delete every object with `"sample": true`, or set `"sample": false` after you replace fields with your real discs.
2. Add your own movies as described above.
3. When no movie has `"sample": true`, the yellow “Sample movies — replace with your collection” banner disappears automatically.
4. Each sample card also shows a **Sample** badge until you remove or clear the flag.

## Enable GitHub Pages

Repo: https://github.com/morgankarven-sudo/Bluray

1. Push this project to the `main` branch of that repository.
2. In the repo on GitHub: **Settings → Pages**.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Push to `main` (or run the **Deploy to GitHub Pages** workflow manually under the **Actions** tab).
5. After the workflow succeeds, the site is available at:

   `https://morgankarven-sudo.github.io/Bluray/`

The workflow (`.github/workflows/deploy.yml`) builds with Vite and deploys the `dist` folder using the official Pages actions (`upload-pages-artifact` + `deploy-pages`).

## Stack

- Vite + React + TypeScript
- Static `public/movies.json` (no backend)
- GitHub Actions → GitHub Pages

