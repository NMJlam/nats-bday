// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import FoldText from "./FoldText";

const { fromTo, killTweensOf, registerPlugin, set, timeline } = vi.hoisted(
  () => {
    const fromTo = vi.fn();
    const kill = vi.fn();

    return {
      fromTo,
      kill,
      killTweensOf: vi.fn(),
      registerPlugin: vi.fn(),
      set: vi.fn(),
      timeline: vi.fn(() => ({ fromTo, kill })),
    };
  },
);

vi.mock("gsap", () => ({
  gsap: { killTweensOf, registerPlugin, set, timeline },
}));

vi.mock("gsap/ScrollTrigger", () => ({
  ScrollTrigger: { create: vi.fn() },
}));

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  Reflect.deleteProperty(window, "matchMedia");
});

describe("FoldText", () => {
  it("keeps one accessible label while animating each character", () => {
    const { container } = render(
      <FoldText text="Happy Birthday" splitBy="char" hinge="bottom" />,
    );

    expect(screen.getByText("Happy Birthday")).toBeTruthy();
    expect(container.querySelectorAll("[data-fold-piece]")).toHaveLength(14);
    expect(timeline).toHaveBeenCalledOnce();
    expect(fromTo).toHaveBeenCalledOnce();
  });

  it("shows the complete text immediately when reduced motion is preferred", () => {
    Object.defineProperty(window, "matchMedia", {
      configurable: true,
      value: vi.fn(() => ({ matches: true })),
    });

    render(<FoldText text="Happy Birthday" />);

    expect(set).toHaveBeenCalledOnce();
    expect(timeline).not.toHaveBeenCalled();
    expect(fromTo).not.toHaveBeenCalled();
  });
});
