import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SAKANA — Thủy tộc chí",
  description: "Một đại dương. Vạn điều kỳ diệu. Khám phá thế giới các loài cá qua những trang thủy tộc chí.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=JetBrains+Mono:ital,wght@0,200;0,300;0,400;0,500;0,600;1,300;1,400&family=Space+Mono:ital,wght@0,400;0,700;1,400&family=Yuji+Boku&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">{children}</body>
    </html>
  );
}
