"use client";

import type { ReactElement } from "react";
import type { ShoppingListItemDoc } from "@/hooks/useShoppingList";
import { sourceMeta } from "@/hooks/useShoppingList";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * ShoppingListItem — 购物清单单项
 *
 * 设计系统：
 * - flat card（无 shadow at rest）
 * - radius: --hs-radius-component (16px)
 * - 勾选框：accent 色，切换选中展开 PurchaseSheet
 * - 来源标签：--hs-* token（auto_alert: accent-subtle, manual: bg-canvas）
 * - hover: translateY(-1px)
 */

interface ShoppingListItemProps {
  item: ShoppingListItemDoc;
  isSelected: boolean;
  onToggleSelect: (id: Id<"shoppingListItems">) => void;
  onRemove: (id: Id<"shoppingListItems">) => void;
}

export default function ShoppingListItem({
  item,
  isSelected,
  onToggleSelect,
  onRemove,
}: ShoppingListItemProps): ReactElement {
  const meta = sourceMeta[item.source];

  return (
    <div
      className={[
        "flex items-center gap-3 px-4 py-3",
        "bg-[var(--hs-bg-surface)]",
        "border",
        isSelected ? "border-[var(--hs-accent)]" : "border-[var(--hs-border)]",
        "rounded-[var(--hs-radius-component)]",
        "transition-[shadow,border-color] duration-[var(--hs-duration-standard)] ease-[var(--hs-ease)]",
        "hover:shadow-[var(--hs-shadow-1)]",
      ].join(" ")}
    >
      {/* 勾选框 */}
      <input
        type="checkbox"
        checked={isSelected}
        onChange={() => onToggleSelect(item._id)}
        className="w-5 h-5 flex-shrink-0 rounded-[var(--hs-radius-element)] border-[var(--hs-border)] text-[var(--hs-accent)] focus:ring-[var(--hs-accent)] cursor-pointer accent-[var(--hs-accent)]"
        aria-label={`选择 ${item.itemName}`}
      />

      {/* 物品信息 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-base font-medium text-[var(--hs-text)] truncate">
            {item.itemName}
          </span>
          <span
            className={[
              "flex-shrink-0",
              "text-[10px] font-bold tracking-wide",
              "px-2 py-0.5",
              "rounded-[var(--hs-radius-pill)]",
              meta.colorClass,
              meta.bgClass,
            ].join(" ")}
          >
            {meta.label}
          </span>
        </div>
        <p className="mt-0.5 text-sm text-[var(--hs-text-muted)]">
          计划购买 {item.plannedQuantity} {item.unit ?? "个"}
        </p>
      </div>

      {/* 删除按钮 */}
      <button
        type="button"
        onClick={() => onRemove(item._id)}
        className="flex-shrink-0 p-1.5 text-[var(--hs-text-muted)] hover:text-[var(--hs-error)] transition-colors duration-[var(--hs-duration-micro)] cursor-pointer"
        aria-label={`删除 ${item.itemName}`}
      >
        🗑️
      </button>
    </div>
  );
}
