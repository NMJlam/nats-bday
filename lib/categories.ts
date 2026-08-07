export const CATEGORIES = [
  { id: "stitch-stitch-stitch", label: "Stitch stitch stitch" },
  { id: "acne", label: "Acne" },
  { id: "hospo-kms", label: "Hospo kms" },
  { id: "misc", label: "Misc" },
  { id: "bananas", label: "Bananas" },
  { id: "nathan", label: "Nathan" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS: readonly CategoryId[] = CATEGORIES.map(
  (category) => category.id,
);
