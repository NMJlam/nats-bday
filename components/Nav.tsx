import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/categories", label: "Categories" },
] as const;

export function Nav() {
  return (
    <header className="sticky top-0 z-40 flex h-[var(--nav-height)] items-center justify-between border-b border-white/35 bg-[rgba(243,241,233,0.82)] px-[4vw] backdrop-blur-lg">
      <Link
        className="grid size-10 place-items-center rounded-full border border-[#17251f] font-serif text-xs font-bold tracking-[0.08em] text-[#17251f] no-underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a]"
        href="/"
        aria-label="Field Notes home"
      >
        FN
      </Link>
      <nav aria-label="Main navigation">
        <ul className="m-0 flex list-none gap-4 p-0 sm:gap-[clamp(1rem,3vw,2.5rem)]">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                className="text-[0.65rem] font-bold tracking-[0.07em] text-[#17251f] uppercase no-underline decoration-1 underline-offset-8 hover:underline focus-visible:outline-3 focus-visible:outline-offset-4 focus-visible:outline-[#f2a65a] sm:text-[0.82rem] sm:tracking-[0.1em]"
                href={link.href}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
