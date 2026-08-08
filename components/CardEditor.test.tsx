// @vitest-environment jsdom

import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CardEditor } from "./CardEditor";

vi.mock("next/dynamic", () => ({
  default: () =>
    function MockEmojiPicker() {
      return <div data-testid="mock-emoji-picker" />;
    },
}));

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("CardEditor", () => {
  it("opens the emoji picker as an anchored popover", async () => {
    const user = userEvent.setup();
    render(
      <CardEditor
        mode="create"
        onClose={vi.fn()}
        onSaved={vi.fn()}
      />,
    );

    const toggle = screen.getByRole("button", { name: "Add emoji" });
    await user.click(toggle);

    const picker = screen.getByTestId("mock-emoji-picker");
    const popover = picker.parentElement;
    const messageField = toggle.closest("label");

    expect(messageField?.contains(popover)).toBe(true);
    expect(popover?.className).toContain("absolute");
    expect(popover?.className).toContain("bottom-10");
  });
});
