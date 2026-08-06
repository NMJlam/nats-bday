import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/gallery", label: "Gallery" },
  { href: "/categories", label: "Categories" },
] as const;

export function Nav() {
  return (
    <header className="site-nav">
      <Link className="site-mark" href="/" aria-label="Field Notes home">
        FN
      </Link>
      <nav aria-label="Main navigation">
        <ul className="nav-links">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href}>{link.label}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
}
