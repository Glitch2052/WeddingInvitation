# video/

- `envelope-open.mp4` — the envelope-opening intro video. Tapping
  the seal (an invisible button centered over the video) plays it;
  when it ends, the screen fades and the invitation is revealed.
- `envelope-poster.jpg` — first frame of the video, shown instantly
  while the video itself is still loading, so there's no blank flash.

## Swapping in your own video

Replace `envelope-open.mp4` with your own file of the same name (or
update the `src` in `index.html`'s `<video>` tag if you rename it).

A few things worth matching for best results:
- **Portrait orientation** (roughly 9:16, e.g. 720×1280 or
  1080×1920) — this is a mobile-first site.
- **Keep it short** (5–8 seconds) so it doesn't feel like a wait
  before guests reach the invitation.
- **Compress it** — under 2–3MB keeps load times snappy on mobile
  data. `ffmpeg -i input.mp4 -vcodec h264 -crf 28 envelope-open.mp4`
  is a good starting point.
- If you change the video, regenerate the poster frame:
  `ffmpeg -i envelope-open.mp4 -vframes 1 -update 1 -q:v 2 envelope-poster.jpg`
