// @vitest-environment jsdom

import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { getDaysSinceFieldNotesStart } from "@/lib/daysSince";

import { LandingIntro } from "./LandingIntro";

vi.mock("motion/react", () => ({
  useReducedMotion: () => false,
}));

vi.mock("@/components/CountUp", () => ({
  default: ({ to, onEnd }: { to: number; onEnd?: () => void }) => (
    <button data-testid="count-up" onClick={onEnd}>
      {to}
    </button>
  ),
}));

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  document.documentElement.classList.remove("landing-intro-active");
});

describe("LandingIntro", () => {
  it("counts to today's elapsed calendar days before revealing the page", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 7, 7, 12));

    render(<LandingIntro />);

    expect(screen.getByTestId("count-up").textContent).toBe(
      String(getDaysSinceFieldNotesStart(new Date())),
    );
    expect(
      document.documentElement.classList.contains("landing-intro-active"),
    ).toBe(true);

    fireEvent.click(screen.getByTestId("count-up"));

    expect(screen.getByText("8,362")).toBeTruthy();
    expect(
      document.documentElement.classList.contains("landing-intro-active"),
    ).toBe(true);

    act(() => vi.advanceTimersByTime(300));

    expect(
      document.documentElement.classList.contains("landing-intro-active"),
    ).toBe(false);

    fireEvent.transitionEnd(screen.getByRole("status"), {
      propertyName: "opacity",
    });

    expect(screen.queryByRole("status")).toBeNull();
  });
});
