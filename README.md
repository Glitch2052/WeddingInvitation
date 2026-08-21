# Girl & Boy — Wedding Invitation

A single-page wedding invitation with a tap-to-open wax-seal envelope
intro, scroll-reveal animations (GSAP), a live countdown, and an RSVP
form — built as static HTML/CSS/JS so it hosts for free on GitHub
Pages.

## File structure

```
index.html          the whole site (one page)
css/style.css        all styling — palette, type, envelope, sections
js/envelope.js        the tap-to-open envelope animation
js/main.js            scroll reveals, countdown, music toggle, RSVP
audio/                 put your background song here (song.mp3)
images/                 put your photos here
```

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
