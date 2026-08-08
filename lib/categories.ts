export const CATEGORIES = [
  { id: "stitch-stitch-stitch", label: "Stitch stitch stitch" },
  { id: "acne", label: "Acne" },
  { id: "hospo-kms", label: "Hospo kms" },
  { id: "em", label: "Em" },
  { id: "angelica", label: "Angelica" },
  { id: "bananas", label: "Bananas" },
  { id: "nathan", label: "Nathan" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS: readonly CategoryId[] = CATEGORIES.map(
  (category) => category.id,
);

export function categoryLabel(id: CategoryId): string {
  return CATEGORIES.find((category) => category.id === id)?.label ?? id;
}
