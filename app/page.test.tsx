// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SITE_TITLE } from "@/lib/site";

import Home from "./page";

vi.mock("@/components/FoldText", () => ({
  default: ({ text }: { text: string }) => <>{text}</>,
}));

vi.mock("next/server", () => ({
  connection: vi.fn(async () => undefined),
}));

vi.mock("@/lib/cards", () => ({
  getAllCards: vi.fn(async () => [
    {
      id: "a",
      media: { type: "image", src: "/content-imgs/a.svg" },
      category: "nathan",
      message: "hi",
      alt: "A",
    },
  ]),
  shuffleCards: (cards: unknown[]) => cards,
}));

vi.mock("@/components/GalleryReveal", () => ({
  GalleryReveal: () => (
    <section id="gallery">
      <h2>Your birthday gallery</h2>
    </section>
  ),
}));

afterEach(cleanup);

describe("Home", () => {
  it("shows the landing content immediately without a loading intro", async () => {
    render(await Home());

    expect(
      screen.getByRole("heading", { level: 1, name: SITE_TITLE }),
    ).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText("Days since")).toBeNull();
  });

  it("continues from the landing content into the gallery", async () => {
    render(await Home());

    expect(
      screen.getByRole("link", { name: /scroll to the gallery/i }).getAttribute(
        "href",
      ),
    ).toBe("#gallery");
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Your birthday gallery",
      }),
    ).toBeTruthy();
  });
});
