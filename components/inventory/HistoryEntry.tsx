"use client";

import type { ReactElement } from "react";
import type { InventoryLogDoc } from "@/hooks/useInventory";

/**
 * HistoryEntry — 单条库存变更记录
 *
 * INV-003: 展示一条 inventoryLog 的详情
 * - 变更量（+/- 颜色编码）
 * - 前后数量
 * - 时间戳
 *
 * 设计系统：
 * - 水平 flex 布局
 * - 正值使用 --hs-ok (绿)，负值使用 --hs-error (红)
 * - 时间戳使用 --hs-text-muted + text-xs
 */

interface HistoryEntryProps {
  log: InventoryLogDoc;
  /** 物品单位（如 "瓶"、"包"） */
  unit: string;
}

export default function HistoryEntry({
  log,
  unit,
}: HistoryEntryProps): ReactElement {
  const isPositive = log.changeAmount > 0;
  const changeText = isPositive
    ? `+${log.changeAmount}`
    : `${log.changeAmount}`;

  const changeColorClass = isPositive
    ? "text-[var(--hs-ok)]"
    : "text-[var(--hs-error)]";

  const changeLabel = isPositive ? "入库" : "消耗";
  const changeEmoji = isPositive ? "📥" : "📤";

  const timeStr = new Date(log._creationTime).toLocaleString("zh-CN", {
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div
      className={[
        "flex items-center gap-3 px-4 py-3",
        "border-b border-[var(--hs-border)] last:border-b-0",
        "transition-colors duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
      ].join(" ")}
    >
      {/* 操作图标 */}
      <span className="text-lg flex-shrink-0" aria-hidden="true">
        {changeEmoji}
      </span>

      {/* 中间：操作描述 + 数量变化 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--hs-text)]">
            {changeLabel}
          </span>
          <span className={`text-sm font-bold ${changeColorClass}`}>
            {changeText} {unit}
          </span>
        </div>
        <p className="text-xs text-[var(--hs-text-muted)] mt-0.5">
          {log.previousQuantity} → {log.newQuantity} {unit}
        </p>
      </div>

      {/* 右侧：时间 */}
      <span className="text-xs text-[var(--hs-text-muted)] flex-shrink-0">
        {timeStr}
      </span>
    </div>
  );
}
