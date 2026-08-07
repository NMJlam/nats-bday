# Field Notes

A statically generated Next.js card gallery. Cards appear as a media wall and
expand in place to reveal GitHub-style Markdown messages.

## Content

All cards live in [`content/card.md`](content/card.md). Add each media asset
under `content/imgs/`, then reference it from the card metadata. Image cards
use `image`:

```md
---
image: imgs/example.jpg
category: stitch-stitch-stitch
---
# Card heading

Card message in GitHub-Flavored Markdown.
```

Video cards use `video` and can include a `poster` image:

```md
---
video: imgs/example.mp4
poster: imgs/example-poster.jpg
category: bananas
---
# Card heading

Card message in GitHub-Flavored Markdown.
```

Define exactly one of `image` or `video` per card. Video previews are muted,
looping, and inline; reduced-motion visitors see a still frame or poster. The
expanded card uses the browser's standard playback controls.

A card boundary is a `---` line followed immediately by `key: value` metadata
lines and another `---`. Ordinary Markdown horizontal rules inside messages are
preserved. Valid category IDs are defined in `lib/categories.ts`.

The `predev` and `prebuild` scripts copy source media to the generated public
asset directory automatically.

## Development

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm test
npm run lint
npm run typecheck
npm run build
```

The build command uses Next.js's supported Webpack compiler path and emits the
landing, gallery, and category routes as static pages ready for Vercel.
