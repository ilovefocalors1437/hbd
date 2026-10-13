# HBD PAM 🍓

A mobile birthday surprise in strawberry pink, cream, and cherry red, with floating kaomoji decorations. The page starts with the gift box. Tap it rapidly to make it shake and glow, then watch nine birthday cards bounce out and appear one at a time. The letter waits for you to read **happy birthday สูง เก่งง ^^** before the grand Hello Kitty cake reveal.

Every birthday card includes **HBD PAM** and **HBD แม่**. After the reveal, view the collection or replay the gift opening. The supplied “A Sweet Smile” MP3 starts on the first gift tap. There are no audio controls.

## Open

The site is plain HTML, CSS, and JavaScript. No install or build is needed. Open `index.html` directly, or serve this folder:

```sh
python -m http.server 8000
```

Then visit `http://localhost:8000`. The existing GitHub Pages workflow publishes the site on pushes to `main`.

## One offline HTML file

To embed the styling, JavaScript, and images into one shareable HTML file:

```sh
python tools/build-standalone.py HBD-PAM.html
```

Mobile browsers can open the hosted link; a file manager's HTML preview may restrict scripts, so open the offline file in a browser that allows local HTML.

## Edit

- `index.html`: gift illustration, supplied music, and scene structure.
- `styles.css`: strawberry palette and responsive layout.
- `app.js`: gift order, timing, letter, music playback, particles, and card physics.
- `assets/card-*.webp`: small, optimized images used by the site.
- `assets/card-*.png`: full-size 720 × 960 birthday card exports.
- `ASSETS.md`: image sources and exact generation prompts.

Cards were composed with HTML text and rasterized in Chromium. The generated Furina cat and cake illustrations contain no generated lettering. The experience respects reduced motion and stops animation while its browser tab is hidden.
