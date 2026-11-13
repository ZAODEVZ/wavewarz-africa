import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import { site } from "@/lib/api";

export const metadata: Metadata = {
  title: { default: site.name, template: `%s, ${site.name}` },
  description: `${site.region}'s music battles: who is on, who won, what moved. Read live from WaveWarZ.`,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Nav />
        {children}
        <footer>
          {site.name}. Battles and numbers come from the WaveWarZ API; artists are paid on chain, automatically, from the trading around their battle.
        </footer>
      </body>
    </html>
  );
}
