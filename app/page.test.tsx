// @vitest-environment jsdom

import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Home from "./page";

afterEach(cleanup);

describe("Home", () => {
  it("shows the landing content immediately without a loading intro", () => {
    render(<Home />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Field Notes" }),
    ).toBeTruthy();
    expect(screen.queryByRole("status")).toBeNull();
    expect(screen.queryByText("Days since")).toBeNull();
  });
});
