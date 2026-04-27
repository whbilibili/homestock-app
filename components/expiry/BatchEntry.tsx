"use client";

import type { ReactElement } from "react";
import type { BatchDoc } from "@/hooks/useBatches";
import {
  getUrgency,
  formatDaysRemaining,
  formatExpiryDate,
} from "@/hooks/useBatches";

/**
 * BatchEntry — 单条批次记录（物品详情页使用）
 *
 * 设计系统：
 * - 水平 flex 布局，border-b 分隔
 * - 状态使用颜色 token：expired→hs-error, 3d→orange, 7d→hs-warn, normal→hs-ok
 * - consumed 批次灰显
 */

interface BatchEntryProps {
  batch: BatchDoc;
  unit: string;
}

export default function BatchEntry({ batch, unit }: BatchEntryProps): ReactElement {
  const isConsumed = batch.status === "consumed";
  const isDisposed = batch.status === "disposed";
  const isInactive = isConsumed || isDisposed;
  const urgency = getUrgency(batch);
  const dateText = formatExpiryDate(batch.expiryDate);

  // 已消耗/废弃的批次：特殊显示
  const statusLabel = isConsumed ? "已消耗" : isDisposed ? "已废弃" : urgency.label;
  const statusEmoji = isConsumed ? "📭" : isDisposed ? "🗑️" : urgency.emoji;
  const statusColorClass = isInactive ? "text-[var(--hs-text-muted)]" : urgency.colorClass;
  const statusBgClass = isInactive ? "bg-[var(--hs-bg-canvas)]" : urgency.bgClass;

  return (
    <div
      className={[
        "flex items-center gap-3 px-4 py-3",
        "border-b border-[var(--hs-border)] last:border-b-0",
        "transition-colors duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
        isInactive ? "opacity-50" : "",
      ].join(" ")}
    >
      {/* 状态图标 */}
      <span className="text-lg flex-shrink-0" aria-hidden="true">
        {statusEmoji}
      </span>

      {/* 中间：数量 + 到期日期 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-[var(--hs-text)]">
            {batch.quantity} {unit}
          </span>
          <span
            className={[
              "text-[10px] font-bold tracking-wide",
              "px-2 py-0.5",
              "rounded-[var(--hs-radius-pill)]",
              statusColorClass,
              statusBgClass,
            ].join(" ")}
          >
            {statusLabel}
          </span>
        </div>
        <p className="text-xs text-[var(--hs-text-muted)] mt-0.5">
          保质期至 {dateText}
          {!isInactive && (
            <span className={`ml-2 font-medium ${statusColorClass}`}>
              {formatDaysRemaining(batch.expiryDate)}
            </span>
          )}
        </p>
      </div>
    </div>
  );
}
