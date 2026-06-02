import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "VitaForge AI",
  description: "AI fitness platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <body>{<Providers>{children}</Providers>}</body>
    </html>
  );
}
