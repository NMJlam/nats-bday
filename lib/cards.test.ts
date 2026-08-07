import { describe, expect, it } from "vitest";

import { parseCards, shuffleCards, type Card } from "./cards";

const shuffleCandidates: Card[] = [
  {
    id: "one",
    media: { type: "image", src: "/content-imgs/one.svg" },
    category: "bananas",
    message: "First card",
    alt: "One",
  },
  {
    id: "two",
    media: { type: "image", src: "/content-imgs/two.svg" },
    category: "acne",
    message: "Second card",
    alt: "Two",
  },
  {
    id: "three",
    media: { type: "image", src: "/content-imgs/three.svg" },
    category: "stitch-stitch-stitch",
    message: "Third card",
    alt: "Three",
  },
];

describe("parseCards", () => {
  it("keeps markdown horizontal rules inside a card message", () => {
    const cards = parseCards(`<!-- Card metadata blocks are the only --- fences followed by key: value lines. -->

---
image: imgs/coast.svg
category: stitch-stitch-stitch
---
# Coastal Morning

Before the rule.

---

After the rule.

---
image: imgs/supper.svg
category: acne
---
Supper notes.
`);

    expect(cards).toHaveLength(2);
    expect(cards[0]).toMatchObject({
      id: "coastal-morning",
      media: { type: "image", src: "/content-imgs/coast.svg" },
      category: "stitch-stitch-stitch",
      alt: "Coastal Morning",
    });
    expect(cards[0].message).toContain("Before the rule.\n\n---\n\nAfter the rule.");
    expect(cards[1]).toMatchObject({
      id: "card-2",
      media: { type: "image", src: "/content-imgs/supper.svg" },
      category: "acne",
      alt: "supper",
    });
  });

  it("fails loudly when a card uses an unknown category", () => {
    expect(() =>
      parseCards(`---
image: imgs/mystery.svg
category: unknown
---
# Mystery
`),
    ).toThrow('Card 1 has unknown category "unknown"');
  });

  it("uses the filename for alt text when an H1 does not begin the message", () => {
    const [card] = parseCards(`---
image: imgs/quiet-garden.svg
category: bananas
---
An opening paragraph.

# A Later Heading
`);

    expect(card.alt).toBe("quiet garden");
    expect(card.id).toBe("a-later-heading");
  });

  it("parses a video card with an optional poster", () => {
    const [card] = parseCards(`---
video: imgs/coastal-walk.mp4
poster: imgs/coastal-walk.jpg
category: bananas
---
# Coastal Walk
`);

    expect(card).toMatchObject({
      id: "coastal-walk",
      media: {
        type: "video",
        src: "/content-imgs/coastal-walk.mp4",
        poster: "/content-imgs/coastal-walk.jpg",
      },
      alt: "Coastal Walk",
    });
  });

  it("requires exactly one primary media field", () => {
    expect(() =>
      parseCards(`---
image: imgs/coast.jpg
video: imgs/coast.mp4
category: acne
---
# Coast
`),
    ).toThrow("Card 1 must define exactly one of image or video");

    expect(() =>
      parseCards(`---
category: acne
---
# Missing media
`),
    ).toThrow("Card 1 must define exactly one of image or video");
  });
});

describe("shuffleCards", () => {
  it("returns a shuffled copy without changing the source order", () => {
    const randomValues = [0, 0];

    const shuffled = shuffleCards(
      shuffleCandidates,
      () => randomValues.shift() ?? 0,
    );

    expect(shuffled.map((card) => card.id)).toEqual(["two", "three", "one"]);
    expect(shuffleCandidates.map((card) => card.id)).toEqual([
      "one",
      "two",
      "three",
    ]);
    expect(shuffled).not.toBe(shuffleCandidates);
  });
});
