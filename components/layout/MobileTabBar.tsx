"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 移动端底部 Tab 导航项
 * 与 Sidebar 共享相同的路由定义，但只显示前 5 个核心入口
 * emoji 替代图标库（homestock-design 原则 #3）
 */
interface TabItem {
  href: string;
  label: string;
  emoji: string;
}

const TAB_ITEMS: TabItem[] = [
  { href: "/inventory", label: "库存", emoji: "📦" },
  { href: "/items", label: "物品", emoji: "🏷️" },
  { href: "/shopping", label: "购物", emoji: "🛒" },
  { href: "/expiry", label: "保质期", emoji: "⏰" },
  { href: "/notifications", label: "通知", emoji: "🔔" },
];

/**
 * MobileTabBar — 移动端底部固定 Tab 导航
 *
 * 仅在 < md (< 768px) 显示。
 * 设计规范：flat（无 shadow）、mint-green accent active 态、最小 44x44 触控区
 */
export default function MobileTabBar(): React.ReactElement {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around border-t z-[100]"
      style={{
        height: "56px",
        background: "var(--hs-bg-surface)",
        borderColor: "var(--hs-border)",
      }}
      aria-label="底部导航"
    >
      {TAB_ITEMS.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== "/" && pathname.startsWith(item.href + "/"));

        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className="flex flex-col items-center justify-center gap-0.5 min-w-[44px] min-h-[44px] px-2 py-1 transition-colors"
            style={{
              borderRadius: "var(--hs-radius-element)",
              transitionDuration: "var(--hs-duration-micro)",
              color: isActive
                ? "var(--hs-accent-dark)"
                : "var(--hs-text-muted)",
            }}
          >
            <span
              className="text-xl leading-none"
              role="img"
              aria-hidden="true"
            >
              {item.emoji}
            </span>
            <span
              className="text-[10px] font-bold leading-none"
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
