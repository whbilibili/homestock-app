"use client";

import type { ReactElement } from "react";
import type { InventoryStats } from "@/hooks/useInventory";

/**
 * InventoryHeader — 库存总览统计栏
 *
 * 展示：总物品数、正常数、预警数、缺货数
 * 设计系统：
 * - 标题使用 serif 字体（Noto Serif JP）
 * - 统计数字使用 tabular-nums
 * - 三个状态指标使用对应的语义色 token
 * - 容器无阴影，使用 border-bottom 分隔
 */

interface InventoryHeaderProps {
  stats: InventoryStats;
}

/** 统计指标配置 */
const indicators = [
  {
    key: "ok" as const,
    label: "充足",
    emoji: "✅",
    colorClass: "text-[var(--hs-ok)]",
    bgClass: "bg-[var(--hs-ok-bg)]",
  },
  {
    key: "warn" as const,
    label: "不足",
    emoji: "⚠️",
    colorClass: "text-[var(--hs-warn)]",
    bgClass: "bg-[var(--hs-warn-bg)]",
  },
  {
    key: "outOfStock" as const,
    label: "缺货",
    emoji: "🚨",
    colorClass: "text-[var(--hs-error)]",
    bgClass: "bg-[var(--hs-error-bg)]",
  },
] as const;

/** 从 stats 中获取对应 key 的数值 */
function getCount(
  stats: InventoryStats,
  key: "ok" | "warn" | "outOfStock",
): number {
  const map = {
    ok: stats.okCount,
    warn: stats.warnCount,
    outOfStock: stats.outOfStockCount,
  };
  return map[key];
}

export default function InventoryHeader({
  stats,
}: InventoryHeaderProps): ReactElement {
  return (
    <div className="pb-4 mb-4 border-b border-[var(--hs-border)]">
      {/* 标题行 */}
      <div className="flex items-baseline gap-3 mb-4">
        <h1 className="text-2xl font-bold text-[var(--hs-text)]">
          库存总览
        </h1>
        <span className="text-sm text-[var(--hs-text-muted)]">
          共 {stats.total} 件物品
        </span>
      </div>

      {/* 统计指标行 */}
      <div className="flex gap-3 flex-wrap">
        {indicators.map((ind) => {
          const count = getCount(stats, ind.key);
          return (
            <div
              key={ind.key}
              className={[
                "flex items-center gap-2",
                "px-3 py-2",
                "rounded-[var(--hs-radius-control)]",
                ind.bgClass,
              ].join(" ")}
            >
              <span className="text-sm" aria-hidden="true">
                {ind.emoji}
              </span>
              <span className={["text-sm font-semibold", ind.colorClass].join(" ")}>
                {count}
              </span>
              <span className="text-xs text-[var(--hs-text-muted)]">
                {ind.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
