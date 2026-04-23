import type { Metadata } from "next";
import { Outfit, Noto_Serif_JP } from "next/font/google";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";

/**
 * Outfit — 主 UI 字体（homestock-design §3.1）
 * 用于所有功能性 UI 文本：标签、按钮、正文、导航
 */
const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700", "800"],
  display: "swap",
});

/**
 * Noto Serif JP — 展示字体（homestock-design §3.1）
 * 仅用于 display moments：hero headings、onboarding titles、empty-state
 */
const notoSerifJP = Noto_Serif_JP({
  variable: "--font-noto-serif-jp",
  subsets: ["latin"],
  weight: ["700"],
  display: "swap",
});

/**
 * Geist Sans / Mono — 降级备用字体
 */
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HomeStock — 家庭库存管理",
  description: "简洁实用的家庭库存管理应用",
  icons: {
    icon: "/convex.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ConvexAuthNextjsServerProvider>
      <html lang="zh-CN">
        <body
          className={`${outfit.variable} ${notoSerifJP.variable} ${geistSans.variable} ${geistMono.variable} antialiased`}
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
