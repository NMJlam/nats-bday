// @vitest-environment jsdom

import { afterEach, beforeAll, describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import type { Card } from "@/lib/cards";

import { CardGrid } from "./CardGrid";
import { CategoriesGallery } from "./CategoriesGallery";

const cards: Card[] = [
  {
    id: "coast",
    image: "/content-imgs/coastal-morning.svg",
    category: "travel",
    message:
      "# Coast\n\nA travel note.\n\n![Cliffs](imgs/coastal-morning.svg)\n\n```js\nconst answer = 42;\n```",
    alt: "Coast",
  },
  {
    id: "table",
    image: "/content-imgs/citrus-table.svg",
    category: "food",
    message: "# Table\n\nA food note.",
    alt: "Table",
  },
];

beforeAll(() => {
  Object.defineProperty(window, "matchMedia", {
    configurable: true,
    value: (query: string) => ({
      matches: query.includes("prefers-reduced-motion"),
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => false,
    }),
  });
});

afterEach(() => {
  cleanup();
});

describe("gallery interactions", () => {
  it("opens a card without navigation and returns focus after Escape", async () => {
    const user = userEvent.setup();
    const initialUrl = window.location.href;
    render(<CardGrid cards={cards} />);

    expect(screen.queryByRole("heading", { name: "Coast" })).toBeNull();

    const opener = screen.getByRole("button", { name: "Open Coast" });
    await user.click(opener);

    expect(screen.getByRole("dialog", { name: "Coast" })).toBeTruthy();
    expect(screen.getByRole("heading", { name: "Coast" })).toBeTruthy();
    expect(screen.getByAltText("Cliffs").getAttribute("src")).toContain(
      "/content-imgs/coastal-morning.svg",
    );
    expect(document.querySelector("code.hljs")).toBeTruthy();
    expect(window.location.href).toBe(initialUrl);

    await user.keyboard("{Escape}");

    await waitFor(() => {
      expect(screen.queryByRole("dialog", { name: "Coast" })).toBeNull();
      expect(document.activeElement).toBe(opener);
    });
    expect(window.location.href).toBe(initialUrl);
  });

  it("filters cards by category without changing the URL", async () => {
    const user = userEvent.setup();
    const initialUrl = window.location.href;
    render(<CategoriesGallery cards={cards} />);

    expect(screen.getAllByRole("button", { name: /^Open / })).toHaveLength(2);

    await user.click(screen.getByRole("button", { name: "Travel" }));

    expect(screen.getAllByRole("button", { name: /^Open / })).toHaveLength(1);
    expect(screen.getByRole("button", { name: "Open Coast" })).toBeTruthy();
    expect(screen.queryByRole("button", { name: "Open Table" })).toBeNull();
    expect(window.location.href).toBe(initialUrl);
  });
});
