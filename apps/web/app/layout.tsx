import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "ZenFit AI",
  description: "AI fitness platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz">
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" defer />
      </head>
      <body>{<Providers>{children}</Providers>}</body>
    </html>
  );
}
