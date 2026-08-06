# Card Gallery Site — Design & Implementation Plan

This document is the complete, self-contained specification for building the site.
It is written so another agent can execute it end-to-end without further clarification.
Follow the decisions exactly; where something is unspecified, prefer the simplest
option consistent with the stated goals.

---

## 1. Overview

A statically generated website that displays a collection of **cards**. Each card is a
picture at rest; clicking it expands the card in place to reveal a **message** rendered
as GitHub-README-style markdown. Cards can be browsed as one big wall (view-all) or
filtered by category. The single source of truth for all cards is one markdown file.

### Core product behaviors
- Cards show **image only** at rest.
- Clicking a card **expands it in place** (over a dimmed/blurred grid) to show its message.
- Clicking outside collapses it and returns the user to exactly where they were
  (same scroll position, same active category filter). **No URL change on expand.**
- Cards are laid out as a **uniform-size grid** with a **masonry-style staggered
  entrance animation** (even tiles, lively motion — not variable-height masonry).
- A **by-category** page uses an accordion gallery selector that filters the grid.
- A **landing page** with an animated gradient-waves background.

---

## 2. Tech Stack (fixed)

| Concern            | Choice                                             |
|--------------------|----------------------------------------------------|
| Framework          | **Next.js (App Router)**, **SSG** (statically generated) |
| Language           | **TypeScript**                                     |
| Styling            | **Tailwind CSS**                                   |
| Animation          | **Framer Motion** (shared-layout expand, staggered entrance) |
| Markdown parsing   | `gray-matter` (per-card metadata) + `react-markdown` + `remark-gfm` |
| README styling     | `github-markdown-css` (GitHub README look)         |
| Hosting            | **Vercel** (git push → deploy)                     |
| Package manager    | npm                                                |

The referenced UI components (reactbits Masonry, reactbits Accordion Gallery,
Aceternity layout-grid, reactbits gradient-waves background) are copy-paste
React + Tailwind + Framer Motion components. Reimplement their behavior directly;
do not expect an installable package.

Reference components (for behavior/visual intent only):
- Masonry: https://reactbits.dev/components/masonry
- Expand animation: https://ui.aceternity.com/components/layout-grid
- Accordion gallery: https://reactbits.dev/components/accordion-gallery
- Gradient waves background: https://reactbits.dev/backgrounds/gradient-waves

---

## 3. Content Model (source of truth)

### 3.1 Directory layout
```
content/
  card.md      # ALL cards live in this one file
  imgs/        # every image referenced by card.md
```
`content/` is NOT under `public/`, so a build step must make the images servable
(see §6.2). The markdown file is the single source of truth.

### 3.2 Card format inside `card.md`
Each card is a **metadata block** (delimited like frontmatter) followed by the
**message body**. Cards are separated by the standard `---` frontmatter fences.
The metadata block is stripped before rendering; the message body renders as GFM.

Format:
```markdown
---
image: imgs/foo.jpg
category: travel
---
# My First Card

This is the message. It renders **exactly** like a GitHub README —
tables, task lists, code blocks, links, etc. all supported.

---
image: imgs/bar.jpg
category: food
---
Another card's message here.
```

Rules:
- Metadata keys per card: **`image`** (path relative to `content/`, e.g. `imgs/foo.jpg`)
  and **`category`** (must match an id in `categories.ts`).
- There is **no `title` field**. If a message begins with a `#` heading, use its text
  as the image `alt`; otherwise derive `alt` from the image filename.
- The message body is everything between one card's metadata block and the next
  card's metadata block.
- The message renders as **GitHub-Flavored Markdown styled like a rendered README**
  (GFM: tables, task lists `- [ ]`, strikethrough, fenced code w/ highlighting,
  autolinks, blockquotes, images, headings).

### 3.3 Parsing approach
Because `gray-matter` parses a single leading frontmatter block, split the file into
per-card chunks first, then parse each chunk:
1. Read `content/card.md`.
2. Split into card chunks on the `---` fences. A robust approach: split the whole
   file on lines that are exactly `---`, then reassemble into
   `[metadataBlock, messageBlock]` pairs (fence, meta, fence, message, fence, meta, ...).
   Alternatively, prepend/normalize so each chunk is `---\n<meta>\n---\n<message>` and
   run `gray-matter` per chunk. Implement whichever is cleaner; unit-test the splitter.
3. For each chunk produce a typed `Card` object (see §3.4).
4. **Validate** `category` against `categories.ts` (see §4). Fail the build (throw)
   or emit a loud console warning per offending card — prefer failing the build.
5. Assign each card a stable `id` (e.g. slugified first heading, else `card-<index>`).

### 3.4 Card type
```ts
export type Card = {
  id: string;           // stable key, e.g. slug of first heading or card-<index>
  image: string;        // resolved public path, e.g. /content-imgs/foo.jpg
  category: string;     // validated category id
  message: string;      // raw markdown body (rendered client-side as GFM)
  alt: string;          // from first # heading, else filename
};
```

---

## 4. Categories

Fixed list in a config module. Placeholder values now; the owner will rename later.

```ts
// lib/categories.ts
export const CATEGORIES = [
  { id: 'travel', label: 'Travel' },
  { id: 'food',   label: 'Food' },
  { id: 'art',    label: 'Art' },
  { id: 'music',  label: 'Music' },
  { id: 'life',   label: 'Life' },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]['id'];
export const CATEGORY_IDS = CATEGORIES.map((c) => c.id);
```

- Build-time **validation**: every card's `category` must be in `CATEGORY_IDS`.
  Unknown category → throw during build (preferred) with a clear message naming the
  card index and offending value.

---

## 5. Routes & Navigation

| Route         | Purpose                                                                 |
|---------------|-------------------------------------------------------------------------|
| `/`           | **Landing (stub)**: full animated gradient-waves + site title + "Enter" button → `/gallery`. |
| `/gallery`    | **View-all**: uniform-size tile grid with masonry staggered entrance.   |
| `/categories` | Sticky **Accordion Gallery** selector on top; same card grid below, filtered to the selected category. |

Global nav (in root layout): **Home · Gallery · Categories**.

---

## 6. Implementation Steps

Execute in order. Each step should leave the app in a runnable state where possible.

### 6.1 Scaffold
1. Create a Next.js App-Router TypeScript app in the repo root (non-interactive):
   `npx create-next-app@latest . --ts --app --tailwind --eslint --no-src-dir --use-npm --yes`
   (If the directory is non-empty, scaffold in a temp dir and merge, or answer the
   overwrite prompt appropriately.)
2. Install deps: `npm i framer-motion gray-matter react-markdown remark-gfm github-markdown-css`.
3. Confirm `npm run dev` boots.

### 6.2 Content pipeline
1. Create `content/card.md` with **3–5 placeholder cards** spanning at least 2 categories.
2. Add placeholder images in `content/imgs/` (simple solid-color or sample images).
3. Make images servable. **Chosen approach: build-time copy** so frontmatter paths stay
   clean and `content/` remains the source of truth:
   - Add a script `scripts/copy-content-images.mjs` that copies `content/imgs/*` to
     `public/content-imgs/*`.
   - Wire it into `predev` and `prebuild` npm scripts so it runs automatically.
   - In the parser, rewrite each card's `image` (`imgs/foo.jpg`) to the public path
     (`/content-imgs/foo.jpg`).
4. Implement `lib/cards.ts`:
   - `getAllCards(): Card[]` — reads `content/card.md`, splits, parses, validates,
     resolves image paths, returns typed cards. Runs at build (server component / SSG).
   - Unit-test the chunk splitter against the format in §3.2 (including messages that
     themselves contain `---` horizontal rules — ensure the splitter is not fooled;
     if needed, require metadata blocks to be the only place `---` fences appear, or
     use a more explicit delimiter and document it in `content/card.md` as a comment).

   > NOTE ON DELIMITER ROBUSTNESS: markdown messages can legitimately contain `---`
   > (horizontal rule). To avoid ambiguity, treat a card boundary as a `---` fence that
   > is immediately followed by lines matching `key: value` metadata and a closing
   > `---`. Document the rule at the top of `card.md`. Cover this with a unit test.

### 6.3 Shared components
1. `components/CardGrid.tsx`
   - Props: `cards: Card[]`.
   - Uniform-size responsive grid (e.g. `grid` with responsive column counts).
   - Each tile: **bare image only** (`next/image`, object-cover, fixed aspect ratio,
     rounded corners). `alt` from card.
   - **Masonry staggered entrance**: Framer Motion container with `staggerChildren`;
     each tile fades/scales in. Respect `prefers-reduced-motion` (disable/reduce).
   - Clicking a tile sets the active card (lifts state up or uses context) to trigger
     the expand overlay.
2. `components/CardExpand.tsx` (the layout-grid style expansion)
   - Framer Motion **shared layout** (`layoutId` shared between the tile and the
     expanded card) so the tile animates into the focused card.
   - Backdrop: dim + blur the grid behind (`backdrop-blur`, semi-opaque overlay).
   - Focused card is a **split layout**: image left, message right.
     - Left: the image.
     - Right: the message rendered via `react-markdown` + `remark-gfm`, wrapped in a
       container using `github-markdown-css` (`.markdown-body`) so it looks like a
       rendered GitHub README. Right pane scrolls if long.
     - **Mobile**: stack image on top, message below.
   - Close on: click backdrop, press `Escape`, or a close button.
   - Closing **does not navigate** and preserves scroll + active filter (state only).
3. `components/GradientWaves.tsx`
   - Animated gradient-waves background (canvas/WebGL or animated CSS gradients).
   - Prop `variant: 'full' | 'subtle'`:
     - `full` — animated (landing).
     - `subtle` — calm/static gradient (gallery & categories) for readability + perf.
   - Respect `prefers-reduced-motion` (freeze animation).
4. `components/Nav.tsx` — Home · Gallery · Categories, in the root layout.
5. `components/AccordionGallery.tsx`
   - Sticky selector row of ~5 panels (one per category, each with a representative
     image/label). Selecting a panel sets the active category.
   - Emits the selected `CategoryId` (or `null`/"all") to the parent.

### 6.4 Pages
1. `app/layout.tsx` — root layout: `Nav`, global styles, import `github-markdown-css`.
2. `app/page.tsx` (`/`) — landing stub: `<GradientWaves variant="full" />`, site title,
   an **Enter** button/link to `/gallery`.
3. `app/gallery/page.tsx` — server component: `getAllCards()` → render `CardGrid`
   inside a client wrapper that manages the active-card expand state.
   Background: `<GradientWaves variant="subtle" />`.
4. `app/categories/page.tsx` — server component loads cards; a client component holds
   the selected category state, renders sticky `AccordionGallery` on top and a
   **filtered** `CardGrid` below (filter cards by active category; show all when none
   selected). Same expand behavior. Background: `<GradientWaves variant="subtle" />`.

### 6.5 Interaction details
- Active-card and active-category state live in client components (React state / context).
- The expand overlay is portal/fixed-positioned above the grid; the grid stays mounted
  so closing restores scroll and filter without re-render churn.
- Ensure keyboard accessibility: tiles are focusable buttons; `Enter`/`Space` expands;
  `Escape` closes; focus returns to the originating tile on close.

### 6.6 Accessibility & performance
- Honor `prefers-reduced-motion` across all animations.
- `next/image` for all images; set sizes/aspect ratios to avoid layout shift.
- Subtle background on grid pages to protect scroll performance.
- Alt text on every image (per §3.3).

### 6.7 Deploy
- Deploy to **Vercel** (framework preset: Next.js, zero config).
- Verify `prebuild` image-copy runs in the Vercel build.
- Confirm the three routes render and cards expand correctly on the preview URL.

---

## 7. Proposed File Structure
```
app/
  layout.tsx
  page.tsx                # / landing stub
  gallery/page.tsx        # /gallery
  categories/page.tsx     # /categories
components/
  Nav.tsx
  CardGrid.tsx
  CardExpand.tsx
  AccordionGallery.tsx
  GradientWaves.tsx
lib/
  categories.ts
  cards.ts                # read/split/parse/validate card.md
content/
  card.md                 # ALL cards (source of truth)
  imgs/                   # source images
scripts/
  copy-content-images.mjs # content/imgs -> public/content-imgs
public/
  content-imgs/           # generated (gitignore or commit; your call)
```

---

## 8. Acceptance Criteria
- [ ] `content/card.md` is the sole source of cards; adding a card = editing that file
      + dropping an image in `content/imgs/`.
- [ ] Cards render **image-only** at rest in a **uniform grid** with a staggered
      entrance animation.
- [ ] Clicking a card **expands it in place** over a dimmed/blurred grid; layout is
      **image left / message right** (stacked on mobile).
- [ ] The message renders as **GitHub-README-style GFM** (tables, code, task lists, etc.).
- [ ] Clicking out / Escape collapses the card with **no URL change** and preserves
      scroll position and active category filter.
- [ ] `/categories` shows a sticky **accordion selector** that filters the grid.
- [ ] `/` shows the **full animated gradient-waves** landing stub with an Enter button;
      grid pages use the **subtle** background.
- [ ] Build **fails/warns** on any card whose `category` is not in `categories.ts`.
- [ ] `prefers-reduced-motion` is respected.
- [ ] Deploys cleanly to Vercel.

---

## 9. Open Items (owner to fill in later)
- Real category ids/labels in `lib/categories.ts` (currently placeholders).
- Real landing page design (currently a stub).
- Real card content and images in `content/`.
- Site title / branding.
