// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { SITE_TITLE } from "@/lib/site";

import Home from "./page";

vi.mock("@/components/FoldText", () => ({
  default: ({ text }: { text: string }) => <>{text}</>,
}));

afterEach(cleanup);

describe("Home", () => {
  it("shows the landing content immediately without a loading intro", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: SITE_TITLE }),
    ).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText("Days since")).toBeNull();
  });
});
