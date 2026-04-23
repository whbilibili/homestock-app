"use client";

import NotificationBadge from "./NotificationBadge";
import UserMenu from "./UserMenu";

/**
 * Header — 顶部导航栏
 *
 * 毛玻璃效果固定顶栏，包含 Logo、通知角标、用户菜单。
 * 设计规范：frosted-glass nav（homestock-design §3.6）
 * Logo 使用 Noto Serif JP 700 20px（display moment）
 */
export default function Header(): React.ReactElement {
  return (
    <header
      className="fixed top-0 right-0 left-0 md:left-64 flex items-center justify-between px-6 z-[100]"
      style={{
        height: "64px",
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--hs-border)",
        boxShadow: "var(--hs-shadow-nav)",
      }}
    >
      {/* Logo — 仅移动端显示（桌面端 Logo 在 Sidebar 中） */}
      <h1
        className="md:hidden text-xl font-bold tracking-tight"
        style={{
          fontFamily: "'Noto Serif JP', serif",
          color: "var(--hs-text)",
          letterSpacing: "-0.01em",
        }}
      >
        HomeStock
      </h1>

      {/* 桌面端左侧留空（Logo 在 Sidebar） */}
      <div className="hidden md:block" />

      {/* 右侧操作区 */}
      <div className="flex items-center gap-1">
        <NotificationBadge />
        <UserMenu />
      </div>
    </header>
  );
}
