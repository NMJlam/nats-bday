import { describe, expect, it } from "vitest";

import { CATEGORIES } from "./categories";

describe("categories", () => {
  it("defines the gallery categories in display order", () => {
    expect(CATEGORIES).toEqual([
      { id: "stitch-stitch-stitch", label: "Stitch stitch stitch" },
      { id: "acne", label: "Acne" },
      { id: "hospo-kms", label: "Hospo kms" },
      { id: "em", label: "Em" },
      { id: "angelica", label: "Angelica" },
      { id: "bananas", label: "Bananas" },
      { id: "nathan", label: "Nathan" },
    ]);
  });
});
