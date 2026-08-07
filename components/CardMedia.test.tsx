// @vitest-environment jsdom

import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, waitFor } from "@testing-library/react";

import { CardMedia } from "./CardMedia";

const motionPreference = vi.hoisted(() => ({ reduceMotion: true }));

vi.mock("framer-motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("framer-motion")>();

  return {
    ...actual,
    useReducedMotion: () => motionPreference.reduceMotion,
  };
});

const play = vi.fn(() => Promise.resolve());
const pause = vi.fn();

beforeAll(() => {
  Object.defineProperties(HTMLMediaElement.prototype, {
    play: { configurable: true, value: play },
    pause: { configurable: true, value: pause },
  });
});

beforeEach(() => {
  motionPreference.reduceMotion = true;
  vi.clearAllMocks();
});

afterEach(() => {
  cleanup();
});

describe("CardMedia", () => {
  const media = {
    type: "video" as const,
    src: "/content-imgs/walk.mp4",
    poster: "/content-imgs/walk.jpg",
  };

  it("keeps previews paused when reduced motion is preferred", () => {
    render(<CardMedia media={media} alt="Walk" sizes="30vw" />);

    expect(pause).toHaveBeenCalledOnce();
    expect(play).not.toHaveBeenCalled();
  });

  it("starts previews after motion is explicitly allowed", async () => {
    motionPreference.reduceMotion = false;

    render(<CardMedia media={media} alt="Walk" sizes="30vw" />);

    await waitFor(() => expect(play).toHaveBeenCalledOnce());
    expect(pause).not.toHaveBeenCalled();
  });
});
