# Field Notes

A statically generated Next.js card gallery. Cards appear as an image wall and
expand in place to reveal GitHub-style Markdown messages.

## Content

All cards live in [`content/card.md`](content/card.md). Add each image under
`content/imgs/`, then reference it from the card metadata:

```md
---
image: imgs/example.jpg
category: stitch-stitch-stitch
---
# Card heading

Card message in GitHub-Flavored Markdown.
```

A card boundary is a `---` line followed immediately by `key: value` metadata
lines and another `---`. Ordinary Markdown horizontal rules inside messages are
preserved. Valid category IDs are defined in `lib/categories.ts`.

The `predev` and `prebuild` scripts copy source images to the generated public
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
