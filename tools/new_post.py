#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
new_post.py — scaffold a blog post, stamp its timestamp, and update the record.

This is the tool that keeps your writing on the record. It:
  * generates a URL-safe slug from the title,
  * stamps an ISO-8601 timestamp (with your local timezone),
  * writes content/posts/<slug>.md with frontmatter + a starter template,
  * inserts/updates the entry in content/posts.json (auto-numbering the series).

USAGE
  Create a post (defaults to the robotics one-page series; the technical
  sheet is shown as a JPEG image below the prose):
    python tools/new_post.py "What Is Odometry?"

  With options (--sheet-image may be repeated for multi-page sheets):
    python tools/new_post.py "State-Space Control" \
        --series robotics-one-page \
        --tags control,linear-algebra \
        --standfirst "Trading three PID knobs for a matrix." \
        --sheet-image assets/img/posts/control/state-space.jpg

  Attach sheet image(s) to an existing post (once you've exported the JPEG):
    python tools/new_post.py --attach what-is-odometry \
        --sheet-image assets/img/posts/odometry/sheet.jpg

  A normal article (no sheet):
    python tools/new_post.py "How I Set Up My Dev Box" --series notes --no-sheet

  Legacy: a sheet written in Markdown and rendered live with MathJax:
    python tools/new_post.py "What Is Odometry?" --live-sheet

  Refresh a post's 'updated' timestamp + recompute reading time after editing:
    python tools/new_post.py --touch what-is-odometry

  Show the record:
    python tools/new_post.py --list

No third-party dependencies — standard library only (Python 3.6+).
"""

import argparse
import datetime
import json
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
POSTS_DIR = os.path.join(ROOT, "content", "posts")
MANIFEST = os.path.join(ROOT, "content", "posts.json")

# Human-readable series titles for the scaffold's intro line.
SERIES_TITLES = {
    "robotics-one-page": "Robotics Concepts in One Page",
}


# --------------------------------------------------------------------------- #
# helpers
# --------------------------------------------------------------------------- #
def now_iso():
    """Local, timezone-aware ISO-8601 timestamp, no microseconds."""
    return datetime.datetime.now().astimezone().replace(microsecond=0).isoformat()


def slugify(title):
    s = title.strip().lower()
    s = s.replace("&", " and ")
    s = re.sub(r"[^a-z0-9]+", "-", s)
    s = re.sub(r"-{2,}", "-", s).strip("-")
    return s or "post"


def load_manifest():
    if not os.path.exists(MANIFEST):
        return {"posts": []}
    with open(MANIFEST, "r", encoding="utf-8") as f:
        data = json.load(f)
    data.setdefault("posts", [])
    return data


def save_manifest(data):
    # newest first, by created timestamp
    data["posts"].sort(key=lambda p: p.get("created", ""), reverse=True)
    with open(MANIFEST, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
        f.write("\n")


def next_number(posts, series):
    nums = [p.get("seriesNumber", 0) for p in posts if p.get("series") == series]
    return (max(nums) + 1) if nums else 1


def reading_time(md_body):
    """Rough estimate at ~200 words/min from visible prose."""
    text = re.sub(r"<!--.*?-->", " ", md_body, flags=re.S)      # comments/markers
    text = re.sub(r"<[^>]+>", " ", text)                        # html tags
    text = re.sub(r"\$\$.*?\$\$", " ", text, flags=re.S)        # display math
    text = re.sub(r"\$[^$\n]+\$", " ", text)                    # inline math
    text = re.sub(r"[#>*`_\-\[\]()|]", " ", text)               # md punctuation
    words = [w for w in re.split(r"\s+", text) if w]
    return "{} min".format(max(1, round(len(words) / 200.0)))


def normalize_image_paths(paths):
    """Make sheet-image paths site-relative with forward slashes; warn if missing."""
    out = []
    for p in paths or []:
        full = p if os.path.isabs(p) else os.path.join(ROOT, p)
        rel = os.path.relpath(os.path.abspath(full), ROOT).replace(os.sep, "/")
        if not os.path.exists(full):
            print("  (warning: sheet image not found yet: {})".format(rel))
        out.append(rel)
    return out


def read_file(path):
    with open(path, "r", encoding="utf-8") as f:
        return f.read()


def write_file(path, text):
    with open(path, "w", encoding="utf-8") as f:
        f.write(text)


# --------------------------------------------------------------------------- #
# templates
# --------------------------------------------------------------------------- #
def frontmatter(meta):
    tags = "[" + ", ".join(meta["tags"]) + "]"
    return (
        "---\n"
        'title: {title}\n'
        "series: {series}\n"
        "seriesNumber: {number}\n"
        "standfirst: {standfirst}\n"
        "tags: {tags}\n"
        "created: {created}\n"
        "updated: {updated}\n"
        "readingTime: {reading}\n"
        "hasSheet: {has_sheet}\n"
        "---\n"
    ).format(**dict(meta, tags=tags, has_sheet="true" if meta["has_sheet"] else "false"))


def body_template(meta, mode):
    """mode: 'image' (JPEG sheet below the prose), 'live' (legacy MathJax sheet), or 'none'."""
    series_title = SERIES_TITLES.get(meta["series"], "Writing")
    if mode == "image":
        return (
            "\nStarting/continuing **\"{series_title}\"** with TODO.\n\n"
            "TODO: Write the intuitive introduction. What is the concept in plain words, "
            "and why does it matter? Keep the reader out of the maths for now — "
            "inline math like $e = r - y$ still works if you need it.\n\n"
            "Find the complete breakdown in the sheet below.\n"
        ).format(series_title=series_title)
    if mode == "live":
        return (
            "\n> **{series_title}** — the intuition lives here in the prose; "
            "the mathematics is distilled onto the printable sheet below.\n\n"
            "TODO: Write the intuitive introduction. What is the concept in plain words, "
            "and why does it matter? Keep the reader out of the maths for now.\n\n"
            '<!-- sheet title="{title}" no="{number}" subtitle="TODO: one-line subtitle" -->\n\n'
            "## Section heading\n\n"
            "TODO: the dense, mathematical core of the concept. Use LaTeX freely — "
            "inline like $e = r - y$, or display:\n\n"
            "$$ f(x) = \\int_0^x g(\\tau)\\,d\\tau $$\n\n"
            '<div class="keybox"><span class="label">Key result</span>\n'
            "$$ \\text{{your headline equation here}} $$\n"
            "</div>\n\n"
            "TODO: keep it to one page — that's the whole point of the series.\n\n"
            "<!-- /sheet -->\n\n"
            "## After the sheet\n\n"
            "TODO: practical notes, ROS tips, gotchas, and a teaser for what's next.\n"
        ).format(series_title=series_title, **meta)
    return (
        "\nTODO: Write your article here. Standard Markdown works — headings, "
        "**bold**, lists, `code`, tables, images, and blockquotes.\n\n"
        "## A section\n\nTODO: content.\n"
    )


# --------------------------------------------------------------------------- #
# commands
# --------------------------------------------------------------------------- #
def cmd_create(args):
    title = args.title
    slug = args.slug or slugify(title)
    path = os.path.join(POSTS_DIR, slug + ".md")
    data = load_manifest()

    if any(p.get("slug") == slug for p in data["posts"]) and not args.force:
        sys.exit("! A post with slug '{}' already exists. Use --force to overwrite, "
                 "or pass --slug.".format(slug))
    if os.path.exists(path) and not args.force:
        sys.exit("! File already exists: {}. Use --force to overwrite.".format(path))

    number = args.number if args.number else next_number(data["posts"], args.series)
    stamp = now_iso()
    tags = [t.strip() for t in (args.tags or "").split(",") if t.strip()]
    standfirst = args.standfirst or "TODO: one-line hook shown under the title."
    if args.no_sheet and (args.live_sheet or args.sheet_image):
        sys.exit("! --no-sheet can't be combined with --live-sheet or --sheet-image.")
    if args.live_sheet and args.sheet_image:
        sys.exit("! Choose either --live-sheet or --sheet-image, not both.")
    mode = "none" if args.no_sheet else ("live" if args.live_sheet else "image")
    with_sheet = mode != "none"
    images = normalize_image_paths(args.sheet_image)

    meta = {
        "title": title, "series": args.series, "number": number,
        "standfirst": standfirst, "created": stamp, "updated": stamp,
        "tags": tags, "reading": args.reading_time or "5 min",
        "has_sheet": with_sheet,
    }
    body = body_template(meta, mode)
    reading = args.reading_time or reading_time(body)
    meta["reading"] = reading

    os.makedirs(POSTS_DIR, exist_ok=True)
    write_file(path, frontmatter(meta) + body)

    # update / insert manifest record
    data["posts"] = [p for p in data["posts"] if p.get("slug") != slug]
    record = {
        "slug": slug, "title": title, "series": args.series,
        "seriesNumber": number,
        "excerpt": standfirst if not standfirst.startswith("TODO")
                   else "TODO: one-line summary for the blog index.",
        "tags": tags, "created": stamp, "updated": stamp,
        "readingTime": reading, "hasSheet": with_sheet,
    }
    if mode == "image":
        record["sheetImages"] = images
    data["posts"].append(record)
    save_manifest(data)

    print("+ Created post   {}".format(os.path.relpath(path, ROOT)))
    print("  slug           {}".format(slug))
    print("  series         {} (No. {:02d})".format(args.series, number))
    print("  created        {}".format(stamp))
    print("  reading time   {}".format(reading))
    if mode == "image":
        for img in images:
            print("  sheet image    {}".format(img))
        if not images:
            print("\n  No sheet image yet. Once you've exported the JPEG, attach it:")
            print("    python tools/new_post.py --attach {} --sheet-image assets/img/posts/<dir>/<file>.jpg".format(slug))
    print("\n  Edit the file, then preview:")
    print("    python tools/serve.py")
    print("    http://localhost:8000/post.html?slug={}".format(slug))
    print("\n  When you finish editing, refresh timestamp + reading time:")
    print("    python tools/new_post.py --touch {}".format(slug))


def cmd_touch(slug):
    path = os.path.join(POSTS_DIR, slug + ".md")
    if not os.path.exists(path):
        sys.exit("! No such post: {}".format(path))
    stamp = now_iso()
    text = read_file(path)

    # split frontmatter / body
    m = re.match(r"^﻿?---\s*\n(.*?)\n---\s*\n?", text, flags=re.S)
    body = text[m.end():] if m else text
    reading = reading_time(body)

    # update the .md frontmatter in place
    def repl(match, key, value):
        return re.sub(r"(?m)^{}:.*$".format(key), "{}: {}".format(key, value), match)
    if m:
        fm = m.group(0)
        fm = repl(fm, "updated", stamp)
        fm = repl(fm, "readingTime", reading)
        text = fm + body
        write_file(path, text)

    # update the manifest record
    data = load_manifest()
    hit = False
    for p in data["posts"]:
        if p.get("slug") == slug:
            p["updated"] = stamp
            p["readingTime"] = reading
            hit = True
    if hit:
        save_manifest(data)

    print("~ Touched {}".format(slug))
    print("  updated        {}".format(stamp))
    print("  reading time   {}".format(reading))
    if not hit:
        print("  (note: no manifest entry found for this slug)")


def cmd_attach(slug, image_args):
    if not image_args:
        sys.exit("! --attach needs at least one --sheet-image PATH.")
    data = load_manifest()
    hits = [p for p in data["posts"] if p.get("slug") == slug]
    if not hits:
        sys.exit("! No manifest entry for slug '{}'.".format(slug))
    p = hits[0]
    images = p.setdefault("sheetImages", [])
    added = [img for img in normalize_image_paths(image_args) if img not in images]
    images.extend(added)
    p["hasSheet"] = True
    save_manifest(data)

    print("~ Attached to {}".format(slug))
    for img in added:
        print("  + {}".format(img))
    if not added:
        print("  (those images were already attached)")


def cmd_list():
    data = load_manifest()
    if not data["posts"]:
        print("(no posts yet)")
        return
    print("{:<28} {:<20} {:>4}  {:<12} {}".format("SLUG", "SERIES", "No.", "CREATED", "TITLE"))
    print("-" * 92)
    for p in sorted(data["posts"], key=lambda x: x.get("created", ""), reverse=True):
        print("{:<28} {:<20} {:>4}  {:<12} {}".format(
            p.get("slug", "")[:28],
            (p.get("series") or "-")[:20],
            p.get("seriesNumber", "-"),
            (p.get("created", "")[:10]),
            p.get("title", ""),
        ))


# --------------------------------------------------------------------------- #
def main():
    ap = argparse.ArgumentParser(description="Scaffold a blog post and keep the record.")
    ap.add_argument("title", nargs="?", help="Post title (in quotes).")
    ap.add_argument("--series", default="robotics-one-page",
                    help="Series key (default: robotics-one-page). Free-form for other posts, e.g. 'notes'.")
    ap.add_argument("--number", type=int, help="Series number (default: auto-increment).")
    ap.add_argument("--tags", default="", help="Comma-separated tags.")
    ap.add_argument("--standfirst", default="", help="One-line hook shown under the title.")
    ap.add_argument("--reading-time", dest="reading_time", default="", help='e.g. "6 min".')
    ap.add_argument("--slug", default="", help="Override the auto-generated slug.")
    ap.add_argument("--sheet-image", dest="sheet_image", action="append", default=[], metavar="PATH",
                    help="Sheet JPEG shown below the prose (repeat for multiple pages).")
    ap.add_argument("--no-sheet", action="store_true", help="Plain article, no sheet.")
    ap.add_argument("--live-sheet", action="store_true",
                    help="Legacy: write the sheet in Markdown between <!-- sheet --> markers.")
    ap.add_argument("--force", action="store_true", help="Overwrite an existing post.")
    ap.add_argument("--attach", metavar="SLUG", help="Add --sheet-image(s) to an existing post.")
    ap.add_argument("--touch", metavar="SLUG", help="Refresh a post's updated time + reading time.")
    ap.add_argument("--list", action="store_true", help="Print the post record.")
    args = ap.parse_args()

    if args.list:
        cmd_list(); return
    if args.attach:
        cmd_attach(args.attach, args.sheet_image); return
    if args.touch:
        cmd_touch(args.touch); return
    if not args.title:
        ap.error("a title is required (or use --touch SLUG / --list)")
    cmd_create(args)


if __name__ == "__main__":
    main()
