import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";

export const metadata: Metadata = {
  title: "ZenFit — AI Fitness Platform",
  description: "AI fitness platform",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="uz" suppressHydrationWarning>
      <head>
        <script src="https://telegram.org/js/telegram-web-app.js" defer />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#d5ff45" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
      </head>
      <body>{<Providers>{children}</Providers>}</body>
    </html>
  );
}
