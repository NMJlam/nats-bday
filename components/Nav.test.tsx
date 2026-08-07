// @vitest-environment jsdom

import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { SITE_TITLE } from "@/lib/site";

import { Nav } from "./Nav";

afterEach(cleanup);

describe("Nav", () => {
  it("uses the elephant artwork for the home link", () => {
    render(<Nav />);

    const homeLink = screen.getByRole("link", { name: `${SITE_TITLE} home` });
    const logo = homeLink.querySelector("img");

    expect(logo).toBeTruthy();
    expect(logo?.getAttribute("src")).toContain("icon.png");
    expect(homeLink.textContent).not.toContain("HB");
    expect(homeLink.classList.contains("rounded-full")).toBe(false);
    expect(homeLink.classList.contains("border")).toBe(false);
    expect(
      within(screen.getByRole("navigation")).queryByRole("link", {
        name: "Home",
      }),
    ).toBeNull();
  });
});
