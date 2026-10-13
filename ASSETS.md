# Image sources

Nine greeting cards were composed in HTML, with **HBD PAM** and **HBD แม่! :D** added as real text before rendering to 720 × 960 PNG. WebP copies are used by the page. The five supplied photos were retained; phone interface bars and the English Furina video subtitle were cropped out.

## Supplied images

| Card | Original file in the supplied hbd folder |
| --- | --- |
| Hello Kitty birthday | `155370-ml-1184923.jpg` |
| My Melody birthday | `943496ecb4c5031a7c8775dc87a614e3.jpg` |
| Furina cat 1 | `Screenshot_20261014_012256.jpg` |
| Furina cat 2 | `Screenshot_20261014_012311.jpg` |
| Furina cat 3 | `Screenshot_20261014_012313.jpg` |

## Fetched Hello Kitty illustrations

Retrieved from [Wallpapers.com, Hello Kitty birthday collection](https://wallpapers.com/hello-kitty-birthday) on 2026-10-14.

- [Kitty party with balloons](https://wallpapers.com/images/high/hello-kitty-birthday-500-x-500-wallpaper-jm8g2p7qo4kbu6vd.jpg) → `card-kitty-party`.
- [Kitty holding a pink cake](https://wallpapers.com/images/high/hello-kitty-birthday-671-x-971-wallpaper-i79j1btzgagnckz2.jpg) → `card-kitty-pink-cake`.
- [Kitty holding a present](https://wallpapers.com/images/high/hello-kitty-birthday-652-x-1020-wallpaper-o2hglv54s9y24olq.jpg) → `card-kitty-gift`.

Character artwork belongs to its respective rights holders. This repository contains a personal birthday greeting.

## Generated illustrations

Two images were generated using the built-in `image_gen.imagegen` tool. The Furina screenshot was used only as a character reference. All lettering was added separately in HTML.

Exact prompts follow.
# Image asset prompts

Tool: built-in image_gen.imagegen (default mode), 2026-10-14. Both final outputs visually inspected. No CLI fallback used. Re-encoding the second raster to WEBP uses Pillow (quality 91, method 6) without modifying artwork.

## Furina cat and cake

Reference: Screenshot_20261014_012313.jpg, inspected with view_image before generation.

Project file: outputs/hbd/assets/furina-cake-art.png



### Exact final prompt

Use case: illustration-story
Asset type: illustration for a mobile birthday gift card
Primary request: Create a NEW charming clean hand drawn illustration of the Furina-inspired cat in the reference beside a small strawberry pink birthday cake.
Input image: the screenshot is a character-likeness reference ONLY. Do not recreate the screenshot, phone interface, paper cutout, human hands or photographic background.
Subject: a sleepy cute white chibi cat with pale blue swept fringe and flowing Furina-like hair tufts, small triangular cat ears, blue fluffy tail, closed smiling eyes and pink paw beans. Keep the recognizable cute rounded form and pale blue hair of the reference. The cat is seated comfortably beside one small round strawberry cake topped with strawberries and whipped cream, a couple of birthday candles.
Scene/backdrop: warm ivory and very pale pink plain background.
Style/medium: charming polished hand drawn sticker-like greeting illustration with confident soft dark rose-blue outlines, gentle flat pastel shading and very subtle paper texture.
Composition/framing: square canvas, one compact balanced cat-and-cake arrangement, strong clear silhouettes, generous breathing room; all of the cat, cake and candles fully visible.
Color palette: strawberry pink, bright candy pink accents, warm cream, pale blue cat hair.
Lighting/mood: soft and sweet, cute birthday warmth.
Constraints: art only, no text, no letters, no lettering, no numbers, no greeting, no card frame, no watermark. No extra characters, no decorative clutter.

## Finale kitty cake

Project file: outputs/hbd/assets/kitty-cake.webp



### Exact final prompt

Use case: stylized-concept
Asset type: final grand birthday cake reveal image for a bright strawberry-pink mobile gift opening
Primary request: A spectacular Hello Kitty themed strawberry birthday cake, a single large three-tier cake, delicious pink candy confection, fully visible on a pastel blush background.
Subject: cake in graduated three round tiers with pastel and bright strawberry pink frosting, abundant elegant whipped cream piping, juicy strawberries, a big pink ribbon and bow, pretty pink birthday candles with small warm flames. A white Hello Kitty face topper on the top tier: distinctive rounded white cat face, triangular ears, two simple black oval eyes, small yellow oval nose, exactly three fine black whiskers on each cheek, NO mouth, pink bow by one ear. The Hello Kitty face topper is part of the cake decoration.
Style/medium: polished charming cartoon illustration with gentle soft dimensional confection texture, candy-shop sweetness, beautifully detailed cream and strawberries, clean refined outlines, smooth light and shadow.
Composition/framing: square canvas. Single cake is centered, entire cake and candles and plate fully visible with generous margins on every side. Cake fills most of the canvas and is the strong main subject. Clear silhouette suitable for a final animated birthday reward. Modest soft shadow under plate.
Lighting/mood: joyful, luxurious and very cute birthday celebration; softly lit.
Color palette: strawberry pink, bright candy pink, pale blush, ivory cream, strawberry red accents.
Scene/backdrop: simple uniform pastel blush pink background, no props.
Constraints: no text, no letters, no numbers, no lettering, no logo writing, no greeting, no watermark, no card frame; no extra characters, no hands, no people, no furniture, no decorative clutter or scattered confetti.




## Supplied music

`assets/a-sweet-smile.mp3` is the user-supplied “#03 A Sweet Smile｜Genshin Impact.mp3”. It starts on the first tap, loops, and pauses while the page is in the background.
