# mhvvd.github.io

Personal site of Mahmud Lawal — Robotics & AI Engineer. Built with [Astro](https://astro.build) (static output), deployed to GitHub Pages by `.github/workflows/deploy.yml` on every push to `main`.

> One-time setup: in the repo's **Settings → Pages**, set **Source** to **GitHub Actions**.

## Develop

```sh
npm install
npm run dev       # http://localhost:4321
npm run build     # static site in dist/
npm run preview   # serve dist/
```

Requires Node 22.12+.

## Where things live

| What | Where |
| --- | --- |
| Name, links, blog series | `src/data/site.ts` |
| Highlights, projects, skills, certifications | `src/data/profile.ts` |
| Blog posts (Markdown + LaTeX via KaTeX) | `src/content/posts/*.md` |
| Images, certificates, sheets, `Kalman_Filter_Sheet.html` | `public/` (served at the same paths) |
| Pages | `src/pages/` (`/`, `/blog/`, `/blog/<slug>/`, `404`) |
| Styles / design tokens | `src/styles/global.css` |

Old URLs keep working: `/blog.html` and `/post.html?slug=<slug>` redirect to `/blog/` and `/blog/<slug>/`.

## Writing a post

```sh
npm run new-post -- "What Is Odometry?" --tags odometry,localization --sheet "/assets/img/posts/odometry/sheet.jpg"
```

This creates `src/content/posts/what-is-odometry.md` (numbered in the series, timestamped, `draft: true`). Write the prose, put the sheet image in `public/assets/img/posts/…`, set `draft: false`, and push. Math uses `$inline$` and `$$ … $$` blocks (put the `$$` fences on their own lines).
