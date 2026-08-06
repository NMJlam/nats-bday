import type { Metadata } from "next";
import type { ReactNode } from "react";

import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/github.css";
import "./globals.css";

import { Nav } from "@/components/Nav";

export const metadata: Metadata = {
  title: {
    default: "Field Notes",
    template: "%s · Field Notes",
  },
  description: "A gallery of images, observations, and small stories.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
      </body>
    </html>
  );
}
