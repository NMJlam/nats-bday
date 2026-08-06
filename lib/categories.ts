export const CATEGORIES = [
  { id: "travel", label: "Travel" },
  { id: "food", label: "Food" },
  { id: "art", label: "Art" },
  { id: "music", label: "Music" },
  { id: "life", label: "Life" },
] as const;

export type CategoryId = (typeof CATEGORIES)[number]["id"];

export const CATEGORY_IDS: readonly CategoryId[] = CATEGORIES.map(
  (category) => category.id,
);
