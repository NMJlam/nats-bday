// @vitest-environment jsdom

import { act, cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { LandingSlideshow } from "./LandingSlideshow";

const { useReducedMotionMock } = vi.hoisted(() => ({
  useReducedMotionMock: vi.fn(() => false),
}));

vi.mock("motion/react", () => ({
  useReducedMotion: useReducedMotionMock,
}));

vi.mock("next/image", () => ({
  default: ({ alt, src }: { alt: string; src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={alt} src={src} />
  ),
}));

const slides = [
  { src: "/one.jpg" },
  { src: "/two.jpg" },
  { src: "/three.jpg" },
];

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  useReducedMotionMock.mockReturnValue(false);
});

describe("LandingSlideshow", () => {
  it("cycles through every image", () => {
    vi.useFakeTimers();

    const { container } = render(<LandingSlideshow slides={slides} />);
    const layers = container.querySelectorAll("[data-active]");

    expect(layers).toHaveLength(3);
    expect(layers[0]?.getAttribute("data-active")).toBe("true");

    act(() => vi.advanceTimersByTime(5_000));
    expect(layers[1]?.getAttribute("data-active")).toBe("true");

    act(() => vi.advanceTimersByTime(5_000));
    expect(layers[2]?.getAttribute("data-active")).toBe("true");

    act(() => vi.advanceTimersByTime(5_000));
    expect(layers[0]?.getAttribute("data-active")).toBe("true");
  });

  it("keeps the first image still when reduced motion is preferred", () => {
    vi.useFakeTimers();
    useReducedMotionMock.mockReturnValue(true);

    const { container } = render(<LandingSlideshow slides={slides} />);
    const layers = container.querySelectorAll("[data-active]");

    act(() => vi.advanceTimersByTime(15_000));

    expect(layers[0]?.getAttribute("data-active")).toBe("true");
    expect(layers[1]?.getAttribute("data-active")).toBe("false");
  });
});
