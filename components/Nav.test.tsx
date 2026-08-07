// @vitest-environment jsdom

import type { ReactNode } from "react";
import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SITE_TITLE } from "@/lib/site";

import { Nav } from "./Nav";

vi.mock("next-auth/react", () => ({
  useSession: () => ({ data: null, status: "unauthenticated" }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  SessionProvider: ({ children }: { children: ReactNode }) => children,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}));

afterEach(cleanup);

describe("Nav", () => {
  it("uses the elephant artwork for the home link", () => {
    render(<Nav />);

    const homeLink = screen.getByRole("link", { name: `${SITE_TITLE} home` });
    const logo = homeLink.querySelector("img");

    expect(logo).toBeTruthy();
    expect(logo?.getAttribute("src")).toContain("icon.png");
    expect(homeLink.textContent).toContain("Home");
    expect(homeLink.textContent).not.toContain("HB");
    expect(homeLink.classList.contains("rounded-full")).toBe(false);
    expect(homeLink.classList.contains("border")).toBe(false);
    expect(
      within(screen.getByRole("navigation")).queryByRole("link", {
        name: "Home",
      }),
    ).toBeNull();
  });

  it("links Gallery to the category gallery", () => {
    render(<Nav />);

    const navigation = within(screen.getByRole("navigation"));

    expect(navigation.getAllByRole("link")).toHaveLength(1);
    expect(
      navigation.getByRole("link", { name: "Gallery" }).getAttribute("href"),
    ).toBe("/categories");
    expect(
      navigation.queryByRole("link", { name: "Categories" }),
    ).toBeNull();
  });
});
