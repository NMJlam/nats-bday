import { describe, expect, it } from "vitest";

import { shuffleCards, type Card } from "./cards";

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
