"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileTabBar from "./MobileTabBar";

/**
 * AppShell — 全局布局容器
 *
 * 负责响应式切换逻辑：
 * - md (≥768px)：左侧 Sidebar(w-64) + 右侧内容区
 * - < md：顶部 Header + 全屏内容区 + 底部 MobileTabBar
 *
 * Header 在两种模式下都显示（桌面端偏移 left-64）。
 */
export default function AppShell({
  children,
}: Readonly<{
  children: React.ReactNode;
}>): React.ReactElement {
  return (
    <div className="min-h-screen" style={{ background: "var(--hs-bg-canvas)" }}>
      {/* 桌面端侧边栏 */}
      <Sidebar />

      {/* 顶部导航栏 */}
      <Header />

      {/* 主内容区 */}
      <main
        className="md:ml-64 pt-16 pb-20 md:pb-6 px-4 md:px-6"
        style={{ minHeight: "calc(100vh - 64px)" }}
      >
        {children}
      </main>

      {/* 移动端底部 Tab */}
      <MobileTabBar />
    </div>
  );
}
