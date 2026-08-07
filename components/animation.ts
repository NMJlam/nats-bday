export const CARD_LAYOUT_SPRING = {
  type: "spring" as const,
  stiffness: 260,
  damping: 28,
};

export const CARD_CLOSE_TWEEN = {
  type: "tween" as const,
  duration: 0.18,
  ease: "easeOut" as const,
};
