"use client";

import NotificationBadge from "./NotificationBadge";
import UserMenu from "./UserMenu";

/**
 * Header — 顶部导航栏
 *
 * 毛玻璃效果固定顶栏，包含 Logo（仅移动端）、通知角标、用户菜单。
 * 设计规范：frosted-glass nav（homestock-design §3.6）
 * 桌面端左偏移 220px 匹配 Sidebar 宽度
 */
export default function Header(): React.ReactElement {
  return (
    <header
      className="fixed top-0 right-0 left-0 md:left-[220px] flex items-center justify-between px-5 z-[100] h-14"
      style={{
        background: "rgba(255, 255, 255, 0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderBottom: "1px solid var(--hs-border)",
        boxShadow: "var(--hs-shadow-1)",
      }}
    >

      {/* Logo — 仅移动端显示（桌面端 Logo 在 Sidebar 中） */}
      <h1
        className="md:hidden text-lg font-bold tracking-tight"
        style={{
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
