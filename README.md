# Girl & Boy — Wedding Invitation

A single-page wedding invitation with a tap-to-open wax-seal envelope
intro, scroll-reveal animations (GSAP), a live countdown, and an RSVP
form — built as static HTML/CSS/JS so it hosts for free on GitHub
Pages.

## Three envelope versions

This project has grown **three** versions of the intro as we tried
different approaches — `index.html` (the one that's live/default)
now uses the video version:

- **`index.html`** — **video-based (current default).** Plays
  `video/envelope-open.mp4` when the seal is tapped; the screen
  simply fades to reveal the invitation once the video ends. No
  animated fold/tilt — the opening motion lives entirely in the
  video itself.
- **`index-css.html`** — the earlier CSS 3D transform version
  (lightweight, no video/library needed). Kept for reference.
- **`index-threejs.html`** — the earlier real lit 3D scene built with
  [Three.js](https://threejs.org). Kept for reference. Pulls in
  Three.js from a CDN (~600KB extra).

All three share the same `css/style.css`, `js/main.js`, and the rest
of the page (countdown, sections, petals) — only the envelope intro
differs: `js/envelope-video.js` (video), `js/envelope.js` (CSS), or
`js/envelope-three.js` (Three.js).

**To switch which version is live:** whichever file you want
GitHub Pages to serve needs to be named `index.html` at the repo
root — rename accordingly before pushing.

## File structure

```
index.html              the video-envelope version (current default)
index-css.html            the CSS-envelope version (archived)
index-threejs.html         the Three.js-envelope version (archived)
css/style.css              all styling — palette, type, sections (shared)
js/envelope-video.js       tap-to-play-video envelope logic
js/envelope.js             the CSS tap-to-open envelope animation
js/envelope-three.js       the Three.js tap-to-open envelope animation
js/main.js                  scroll reveals, countdown, music toggle, petals (shared)
video/                       envelope-open.mp4 + its poster frame (see its README)
audio/                       put your background song here (song.mp3)
images/                       put your photos here
images/envelope/              optional: photoreal envelope + wax seal art (CSS/Three.js versions only)
images/particles/             optional: custom petal/flower art for the drifting effect
```

## Envelope visuals

The default (`index.html`) plays your video on tap and fades to the
invitation when it ends — see `video/README.md` for how to swap in
a different video. The CSS and Three.js versions are kept as
alternatives; see `images/envelope/README.md` if you want to revisit
either of those with photoreal texture art instead.

## Immersive touches already included

- Drifting petals (CSS-drawn by default, upgrades to `images/particles/petal.png` if you add one)
- Parallax on the hero's corner leaves as you scroll
- A subtle pointer-tilt on the closed envelope
- A soft glowing pulse behind the wax seal

## 1. Personalize it

Everything you'll want to change lives in a few spots:

- **Names, date, venue, copy** — all in `index.html`, in plain text
  (search for "Girl" / "Boy" / "24" to find every mention).
- **Wedding date/time for the countdown** — top of `js/main.js`,
  the `WEDDING_DATE` line. It's currently set to
  `2026-11-24T09:00:00+05:30` (24 Nov 2026, 9:00 AM IST) — change
  the year/time if needed.
- **Colors** — all at the top of `css/style.css` under `:root`, so
  you can retint the whole site by editing a handful of hex values.
- **Photos** — drop files into `images/` and add `<img>` tags where
  you'd like them (e.g. inside the `.announce` or `.venue` sections
  in `index.html`).
- **Music** — drop an MP3 named `song.mp3` into `audio/`.

## 2. Preview it locally

Just open `index.html` directly in a browser, or, for the most
accurate preview (some browsers restrict autoplay/audio on `file://`
pages), run a tiny local server from this folder:

```bash
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## 3. Host it on GitHub Pages

1. Create a new GitHub repository (e.g. `our-wedding`).
2. Push this entire folder's contents to the repo's `main` branch,
   keeping `index.html` at the root:
   ```bash
   git init
   git add .
   git commit -m "wedding invitation"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
3. In the repo, go to **Settings → Pages**.
4. Under **Build and deployment → Source**, choose **Deploy from a
   branch**, set branch to **main** and folder to **/(root)**, then
   save.
5. GitHub will give you a live URL, typically:
   `https://<your-username>.github.io/<repo-name>/`
   It can take a minute or two to go live after the first push.

## Notes

- The envelope screen locks page scroll until it's tapped open, so
  the reveal always plays first.
- Animations respect `prefers-reduced-motion` for visitors who have
  that turned on.
- Everything is vanilla JS + GSAP (loaded via CDN) — no build step,
  no `node_modules`, nothing to compile. Just static files.
