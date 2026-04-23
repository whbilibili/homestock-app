"use client";

import type { ReactElement } from "react";
import type { ItemDoc } from "@/hooks/useItems";
import { categoryLabels } from "@/convex/seed/commonItems";
import type { Category } from "@/convex/seed/commonItems";

/**
 * ItemCard — 单个物品卡片
 *
 * 展示：名称、分类、库存数量、状态色块
 * 设计系统：
 * - radius: --hs-radius-component (16px)
 * - 无阴影（flat at rest）
 * - hover: translateY(-2px)
 * - 状态色块：quantity > alertThreshold → ok, ≤ alertThreshold && > 0 → warn, === 0 → error
 */

/** 分类 emoji 映射 */
const categoryEmoji: Record<Category, string> = {
  food: "🍽️",
  daily: "🧴",
  medicine: "💊",
  appliance: "💡",
  other: "📦",
};

/** 库存状态计算 */
function getStockStatus(quantity: number, alertThreshold: number): {
  label: string;
  colorClass: string;
  bgClass: string;
} {
  if (quantity === 0) {
    return {
      label: "缺货",
      colorClass: "text-[var(--hs-error)]",
      bgClass: "bg-[var(--hs-error-bg)]",
    };
  }
  if (quantity <= alertThreshold) {
    return {
      label: "库存不足",
      colorClass: "text-[var(--hs-warn)]",
      bgClass: "bg-[var(--hs-warn-bg)]",
    };
  }
  return {
    label: "充足",
    colorClass: "text-[var(--hs-ok)]",
    bgClass: "bg-[var(--hs-ok-bg)]",
  };
}

interface ItemCardProps {
  item: ItemDoc;
  onClick?: () => void;
}

export default function ItemCard({ item, onClick }: ItemCardProps): ReactElement {
  const status = getStockStatus(item.quantity, item.alertThreshold);
  const emoji = categoryEmoji[item.category as Category] ?? "📦";
  const categoryLabel = categoryLabels[item.category as Category] ?? item.category;

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full text-left",
        "bg-[var(--hs-bg-surface)]",
        "border border-[var(--hs-border)]",
        "rounded-[var(--hs-radius-component)]",
        "p-4",
        "transition-transform duration-[var(--hs-duration-standard)] ease-[var(--hs-ease)]",
        "hover:-translate-y-0.5",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hs-accent)] focus-visible:ring-offset-2",
        "cursor-pointer",
      ].join(" ")}
    >
      {/* 顶部：emoji + 名称 + 状态 badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xl flex-shrink-0" aria-hidden="true">
            {emoji}
          </span>
          <h3 className="text-base font-medium text-[var(--hs-text)] truncate">
            {item.name}
          </h3>
        </div>
        <span
          className={[
            "flex-shrink-0",
            "text-[10px] font-extrabold tracking-widest uppercase",
            "px-2.5 py-1",
            "rounded-[var(--hs-radius-pill)]",
            status.colorClass,
            status.bgClass,
          ].join(" ")}
        >
          {status.label}
        </span>
      </div>

      {/* 中部：库存数量 */}
      <div className="mt-3 flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[var(--hs-text)]">
          {item.quantity}
        </span>
        <span className="text-sm text-[var(--hs-text-muted)]">
          {item.unit}
        </span>
      </div>

      {/* 底部：分类标签 */}
      <div className="mt-2">
        <span className="text-xs text-[var(--hs-text-muted)]">
          {categoryLabel}
        </span>
      </div>
    </button>
  );
}
