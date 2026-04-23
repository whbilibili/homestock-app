"use client";

import type { ReactElement } from "react";
import type { ItemDoc } from "@/hooks/useItems";
import { getStockStatus } from "@/hooks/useInventory";
import type { StockStatus } from "@/hooks/useInventory";
import { categoryLabels } from "@/convex/seed/commonItems";
import type { Category } from "@/convex/seed/commonItems";
import QuantityInput from "./QuantityInput";

/**
 * InventoryCard — 库存物品卡片
 *
 * 设计系统：
 * - radius: --hs-radius-component (16px)
 * - 无阴影（flat at rest）
 * - 左侧状态色条 w-1, rounded-l，颜色映射：ok→green, warn→amber, out_of_stock→red
 * - hover: translateY(-2px)
 * - 卡片内部：emoji + 名称 + 分类标签 | 右侧 QuantityInput
 */

/** 分类 emoji 映射 */
const categoryEmoji: Record<Category, string> = {
  food: "🍽️",
  daily: "🧴",
  medicine: "💊",
  appliance: "💡",
  other: "📦",
};

/** 状态色条颜色映射 */
const statusBarColor: Record<StockStatus, string> = {
  ok: "bg-[var(--hs-ok)]",
  warn: "bg-[var(--hs-warn)]",
  out_of_stock: "bg-[var(--hs-error)]",
};

/** 状态标签 */
const statusLabel: Record<StockStatus, string> = {
  ok: "充足",
  warn: "库存不足",
  out_of_stock: "缺货",
};

/** 状态 badge 样式 */
const statusBadgeStyle: Record<StockStatus, string> = {
  ok: "text-[var(--hs-ok)] bg-[var(--hs-ok-bg)]",
  warn: "text-[var(--hs-warn)] bg-[var(--hs-warn-bg)]",
  out_of_stock: "text-[var(--hs-error)] bg-[var(--hs-error-bg)]",
};

interface InventoryCardProps {
  item: ItemDoc;
  /** 数量变化回调（由父组件调用 adjustQuantity mutation） */
  onAdjust: (itemId: string, change: number) => void;
}

export default function InventoryCard({
  item,
  onAdjust,
}: InventoryCardProps): ReactElement {
  const status = getStockStatus(item.quantity, item.alertThreshold);
  const emoji = categoryEmoji[item.category as Category] ?? "📦";
  const catLabel = categoryLabels[item.category as Category] ?? item.category;

  return (
    <div
      className={[
        "relative flex overflow-hidden",
        "bg-[var(--hs-bg-surface)]",
        "border border-[var(--hs-border)]",
        "rounded-[var(--hs-radius-component)]",
        "transition-transform duration-[var(--hs-duration-standard)] ease-[var(--hs-ease)]",
        "hover:-translate-y-0.5",
      ].join(" ")}
    >
      {/* 左侧状态色条 */}
      <div
        className={[
          "w-1 flex-shrink-0 rounded-l-[var(--hs-radius-component)]",
          statusBarColor[status],
        ].join(" ")}
        aria-hidden="true"
      />

      {/* 卡片主体 */}
      <div className="flex-1 flex items-center justify-between gap-3 p-4 min-w-0">
        {/* 左侧：物品信息 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xl flex-shrink-0" aria-hidden="true">
              {emoji}
            </span>
            <h3 className="text-base font-medium text-[var(--hs-text)] truncate">
              {item.name}
            </h3>
            <span
              className={[
                "flex-shrink-0",
                "text-[10px] font-extrabold tracking-widest uppercase",
                "px-2 py-0.5",
                "rounded-[var(--hs-radius-pill)]",
                statusBadgeStyle[status],
              ].join(" ")}
            >
              {statusLabel[status]}
            </span>
          </div>
          <p className="mt-1 text-xs text-[var(--hs-text-muted)] truncate">
            {catLabel} · 预警线 {item.alertThreshold} {item.unit}
          </p>
        </div>

        {/* 右侧：数量调整 */}
        <div className="flex-shrink-0">
          <QuantityInput
            quantity={item.quantity}
            unit={item.unit}
            onAdjust={(change) => onAdjust(item._id, change)}
          />
        </div>
      </div>
    </div>
  );
}
