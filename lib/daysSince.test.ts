import { describe, expect, it } from "vitest";

import { getDaysSinceFieldNotesStart } from "@/lib/daysSince";

describe("getDaysSinceFieldNotesStart", () => {
  it("returns zero on 15 September 2003", () => {
    expect(getDaysSinceFieldNotesStart(new Date(2003, 8, 15, 23, 59))).toBe(0);
  });

  it("counts calendar days without being affected by the time of day", () => {
    expect(getDaysSinceFieldNotesStart(new Date(2003, 8, 16, 0, 1))).toBe(1);
    expect(getDaysSinceFieldNotesStart(new Date(2004, 8, 15, 12))).toBe(366);
  });
});
