"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/**
 * 导航项定义
 * emoji 替代图标库（homestock-design 原则 #3）
 */
interface NavItem {
  href: string;
  label: string;
  emoji: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/inventory", label: "库存总览", emoji: "📦" },
  { href: "/items", label: "物品管理", emoji: "🏷️" },
  { href: "/shopping", label: "购物清单", emoji: "🛒" },
  { href: "/expiry", label: "保质期", emoji: "⏰" },
  { href: "/notifications", label: "通知中心", emoji: "🔔" },
];

/**
 * Sidebar — 桌面端左侧固定导航栏
 *
 * 仅在 md (≥768px) 以上显示。
 * 设计规范：flat card（无 shadow）、mint-green accent active 态
 * 宽度 220px（design system spec）
 */
export default function Sidebar(): React.ReactElement {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex fixed top-0 left-0 bottom-0 flex-col border-r z-[100]"
      style={{
        width: "220px",
        background: "var(--hs-bg-surface)",
        borderColor: "var(--hs-border)",
      }}
    >
      {/* Logo */}
      <div
        className="flex items-center px-5"
        style={{ height: "56px", borderBottom: "1px solid var(--hs-border)" }}
      >
        <h1
          className="text-lg font-bold tracking-tight"
          style={{
            color: "var(--hs-text)",
            letterSpacing: "-0.01em",
          }}
        >
          <span role="img" aria-hidden="true" className="mr-2">🏠</span>
          HomeStock
        </h1>
      </div>

      {/* 导航列表 */}
      <nav className="flex-1 px-3 py-4" aria-label="主导航">
        <ul className="flex flex-col gap-1">
          {NAV_ITEMS.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== "/" && pathname.startsWith(item.href + "/"));

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={isActive ? "page" : undefined}
                  className="flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-all"
                  style={{
                    borderRadius: "var(--hs-radius-control)",
                    transitionDuration: "var(--hs-duration-micro)",
                    transitionTimingFunction: "var(--hs-ease)",
                    color: isActive
                      ? "var(--hs-accent-dark)"
                      : "var(--hs-text-muted)",
                    background: isActive
                      ? "var(--hs-accent-subtle)"
                      : "transparent",
                  }}
                >
                  <span
                    className="text-xl leading-none"
                    role="img"
                    aria-hidden="true"
                  >
                    {item.emoji}
                  </span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
