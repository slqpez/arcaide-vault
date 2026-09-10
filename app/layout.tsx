import type { Metadata } from "next";
import { Press_Start_2P, JetBrains_Mono, Courier_Prime } from "next/font/google";
import Nav from "@/components/nav";
import "./globals.css";

const pixelFont = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-pixel",
});

const monoFont = JetBrains_Mono({
  weight: ["400", "500", "700"],
  subsets: ["latin"],
  variable: "--font-mono",
});

const courierPrime = Courier_Prime({
  weight: ["400", "700"],
  subsets: ["latin"],
  variable: "--font-courier-prime",
});

export const metadata: Metadata = {
  title: "Arcade Vault · Portal Retro",
  description:
    "Arcade Vault — juega en línea y compite por el puntaje más alto.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${pixelFont.variable} ${monoFont.variable} ${courierPrime.variable} h-full antialiased`}
    >
      <body className="min-h-full">
        <div className="av-bg" />
        <div className="av-noise" />
        <div className="av-root">
          <Nav />
          <main className="av-main">{children}</main>
          <footer className="mono border-t border-[var(--line)] px-8 py-5 text-center text-[11px] tracking-[0.16em] text-[var(--ink-faint)]">
            © 2026 ARCADE VAULT · HECHO CON PIXELES Y NEÓN · v2.6.0
          </footer>
        </div>
      </body>
    </html>
  );
}
