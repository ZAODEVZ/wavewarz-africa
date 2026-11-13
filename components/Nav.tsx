"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  ["/", "Now"],
  ["/battles", "Battles"],
  ["/artists", "Artists"],
  ["/stats", "Numbers"],
] as const;

export default function Nav({ name = "WaveWarZ Africa" }: { name?: string }) {
  const path = usePathname();
  const [first, ...rest] = name.split(" ");
  return (
    <nav className="nav" aria-label="Main">
      <Link href="/" className="brand">
        <span aria-hidden>🔊</span>
        <span>{first} <b>{rest.join(" ")}</b></span>
      </Link>
      <div className="links">
        {links.map(([href, label]) => (
          <Link key={href} href={href} aria-current={path === href || (href !== "/" && path.startsWith(href)) ? "page" : undefined}>
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
