import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { ConvexAuthNextjsServerProvider } from "@convex-dev/auth/nextjs/server";
import ConvexClientProvider from "@/components/ConvexClientProvider";

/**
 * Noto Sans SC — 主 UI 字体（homestock-design tokens.md §Typography）
 * 用于所有功能性 UI 文本：标签、按钮、正文、导航、标题
 * 使用本地字体文件，避免依赖 fonts.gstatic.com（国内网络不稳定）
 */
const notoSansSC = localFont({
  src: [
    { path: "../public/fonts/NotoSansSC-Light.woff2", weight: "300", style: "normal" },
    { path: "../public/fonts/NotoSansSC-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/NotoSansSC-Medium.woff2", weight: "500", style: "normal" },
    { path: "../public/fonts/NotoSansSC-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-noto-sans-sc",
  display: "swap",
});

/**
 * JetBrains Mono — 等宽字体（homestock-design tokens.md §Typography）
 * 用于数字、计量、代码等需要等宽显示的内容
 * 使用本地字体文件，避免依赖 fonts.gstatic.com（国内网络不稳定）
 */
const jetBrainsMono = localFont({
  src: [
    { path: "../public/fonts/JetBrainsMono-Regular.woff2", weight: "400", style: "normal" },
    { path: "../public/fonts/JetBrainsMono-Medium.woff2", weight: "500", style: "normal" },
  ],
  variable: "--font-jetbrains-mono",
  display: "swap",
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
          className={`${notoSansSC.variable} ${jetBrainsMono.variable} antialiased`}
        >
          <ConvexClientProvider>{children}</ConvexClientProvider>
        </body>
      </html>
    </ConvexAuthNextjsServerProvider>
  );
}
