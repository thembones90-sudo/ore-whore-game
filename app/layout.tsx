import type { Metadata } from "next";
import "./globals.css";
import "./v02.css";
import "./v03.css";

export const metadata: Metadata = { title: "ORE WHORE — Compulsive Geology", description: "Dig. Clank. Crack. Collect every ore and mineral combination." };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="en"><body>{children}</body></html>; }
