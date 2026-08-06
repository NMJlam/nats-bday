import { describe, expect, it } from "vitest";

import { parseCards } from "./cards";

describe("parseCards", () => {
  it("keeps markdown horizontal rules inside a card message", () => {
    const cards = parseCards(`<!-- Card metadata blocks are the only --- fences followed by key: value lines. -->

---
image: imgs/coast.svg
category: travel
---
# Coastal Morning

Before the rule.

---

After the rule.

---
image: imgs/supper.svg
category: food
---
Supper notes.
`);

    expect(cards).toHaveLength(2);
    expect(cards[0]).toMatchObject({
      id: "coastal-morning",
      image: "/content-imgs/coast.svg",
      category: "travel",
      alt: "Coastal Morning",
    });
    expect(cards[0].message).toContain("Before the rule.\n\n---\n\nAfter the rule.");
    expect(cards[1]).toMatchObject({
      id: "card-2",
      image: "/content-imgs/supper.svg",
      category: "food",
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
category: life
---
An opening paragraph.

# A Later Heading
`);

    expect(card.alt).toBe("quiet garden");
    expect(card.id).toBe("a-later-heading");
  });
});
