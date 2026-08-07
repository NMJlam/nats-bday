import type { Metadata } from "next";
import type { ReactNode } from "react";

import "github-markdown-css/github-markdown.css";
import "highlight.js/styles/github.css";
import "./globals.css";

import { Nav } from "@/components/Nav";
import { SITE_TITLE } from "@/lib/site";

export const metadata: Metadata = {
  title: {
    default: SITE_TITLE,
    template: `%s · ${SITE_TITLE}`,
  },
  description: "Birthday photos and messages from people who love having you in their lives.",
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
