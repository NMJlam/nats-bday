import { describe, expect, it } from "vitest";

import { CATEGORIES, categoryLabel } from "./categories";

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

  it("returns the display label for a category", () => {
    expect(categoryLabel("hospo-kms")).toBe("Hospo kms");
  });
});
