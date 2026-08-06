import Link from "next/link";

import { GradientWaves } from "@/components/GradientWaves";

export default function Home() {
  return (
    <main className="landing">
      <GradientWaves variant="full" />
      <div className="landing__content">
        <p className="eyebrow">Images, messages, moments</p>
        <h1 className="display-title">Field Notes</h1>
        <p className="landing__intro">
          A wall of small windows. Open one to find the story it has been
          keeping.
        </p>
        <Link className="enter-link" href="/gallery">
          Enter the gallery <span aria-hidden="true">→</span>
        </Link>
      </div>
    </main>
  );
}
