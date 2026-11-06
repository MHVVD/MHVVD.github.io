# mhvvd.github.io

Source for my portfolio and technical blog: **[mhvvd.github.io](https://mhvvd.github.io)**

- **Portfolio**: robotics, computer vision and competition projects with demo videos, plus skills and certifications.
- **Blog**: build logs (for example the ASL fingerspelling series) and *Robotics Concepts*, a series of one-page explainers on topics like least squares and Kalman filtering.

## How it works

A dependency-free static site (HTML, CSS, vanilla JS). Blog posts are Markdown files in
`content/posts/`, indexed by `content/posts.json` and rendered in the browser.
Every push to `main` deploys to GitHub Pages through `.github/workflows/deploy.yml`.

## Writing and previewing

```bash
python tools/new_post.py "Post title"   # scaffold a post and register it in posts.json
python tools/serve.py                   # preview at http://localhost:8000
```

Both scripts use only the Python standard library.
