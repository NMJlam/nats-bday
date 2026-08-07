import { describe, expect, it } from "vitest";

import { CARD_DIALOG_CLOSED, CARD_DIALOG_TWEEN } from "./animation";

describe("card dialog animation", () => {
  it("matches the short fade-and-zoom motion used by the reference dialog", () => {
    expect(CARD_DIALOG_TWEEN).toEqual({
      type: "tween",
      duration: 0.1,
      ease: "easeOut",
    });
    expect(CARD_DIALOG_CLOSED).toEqual({ opacity: 0, scale: 0.95 });
  });
});
