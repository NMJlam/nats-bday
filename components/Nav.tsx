import Image from "next/image";
import Link from "next/link";

import elephantIcon from "@/app/icon.png";
import { SITE_TITLE } from "@/lib/site";

export function Nav() {
  return (
    <header className="sticky top-0 z-40 flex h-[var(--nav-height)] items-center justify-between border-b border-white/35 bg-[rgba(243,241,233,0.82)] px-[4vw] backdrop-blur-lg">
      <Link
        className="flex min-w-10 flex-col items-center gap-0.5 text-[0.55rem] leading-none font-bold tracking-[0.12em] text-[#17251f] uppercase no-underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
        href="/"
        aria-label={`${SITE_TITLE} home`}
      >
        <Image
          aria-hidden="true"
          alt=""
          className="size-10 object-contain"
          loading="eager"
          sizes="40px"
          src={elephantIcon}
          width={40}
          height={40}
        />
        <span>Home</span>
      </Link>
      <nav aria-label="Main navigation">
        <ul className="m-0 flex list-none gap-4 p-0 sm:gap-[clamp(1rem,3vw,2.5rem)]">
          <li>
            <Link
              className="text-[0.65rem] font-bold tracking-[0.07em] text-[#17251f] uppercase no-underline decoration-1 underline-offset-8 hover:underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a] sm:text-[0.82rem] sm:tracking-[0.1em]"
              href="/categories"
            >
              Gallery
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
