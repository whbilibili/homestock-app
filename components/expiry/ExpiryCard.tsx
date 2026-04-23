"use client";

import type { ReactElement } from "react";
import type { ExpiringBatchDoc } from "@/hooks/useBatches";
import {
  getUrgency,
  formatDaysRemaining,
  formatExpiryDate,
} from "@/hooks/useBatches";

/**
 * ExpiryCard — 单条临期/过期批次卡片
 *
 * 设计系统：
 * - radius: --hs-radius-component (16px)
 * - 无阴影（flat at rest）
 * - 左侧紧急程度色条 w-1，rounded-l
 * - hover: translateY(-1px)
 * - 语义元素：<article>
 * - 颜色：expired→hs-error, 3d→orange, 7d→hs-warn, normal→hs-ok
 */

/** 左侧色条颜色映射 */
const urgencyBarColor: Record<string, string> = {
  expired: "bg-[var(--hs-error)]",
  critical: "bg-orange-500",
  warning: "bg-[var(--hs-warn)]",
  normal: "bg-[var(--hs-ok)]",
};

interface ExpiryCardProps {
  batch: ExpiringBatchDoc;
}

export default function ExpiryCard({ batch }: ExpiryCardProps): ReactElement {
  const urgency = getUrgency(batch);
  const daysText = formatDaysRemaining(batch.expiryDate);
  const dateText = formatExpiryDate(batch.expiryDate);

  return (
    <article
      className={[
        "relative flex overflow-hidden",
        "bg-[var(--hs-bg-surface)]",
        "border border-[var(--hs-border)]",
        "rounded-[var(--hs-radius-component)]",
        "transition-transform duration-[var(--hs-duration-standard)] ease-[var(--hs-ease)]",
        "hover:-translate-y-0.5",
      ].join(" ")}
      aria-label={`${batch.itemName} ${urgency.label}`}
    >
      {/* 左侧紧急程度色条 */}
      <div
        className={[
          "w-1 flex-shrink-0 rounded-l-[var(--hs-radius-component)]",
          urgencyBarColor[urgency.level],
        ].join(" ")}
        aria-hidden="true"
      />

      {/* 卡片主体 */}
      <div className="flex-1 p-4 min-w-0">
        {/* 第一行：emoji + 物品名 + 状态 badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl flex-shrink-0" aria-hidden="true">
            {urgency.emoji}
          </span>
          <h3 className="text-base font-medium text-[var(--hs-text)] truncate">
            {batch.itemName}
          </h3>
          <span
            className={[
              "flex-shrink-0",
              "text-[10px] font-extrabold tracking-widest uppercase",
              "px-2 py-0.5",
              "rounded-[var(--hs-radius-pill)]",
              urgency.colorClass,
              urgency.bgClass,
            ].join(" ")}
          >
            {urgency.label}
          </span>
        </div>

        {/* 第二行：数量 + 到期日期 */}
        <div className="mt-2 flex items-center gap-4">
          <p className="text-sm text-[var(--hs-text-muted)]">
            <span className="font-medium text-[var(--hs-text)]">{batch.quantity}</span>
            {" "}{batch.itemUnit}
          </p>
          <p className="text-sm text-[var(--hs-text-muted)]">
            保质期至 {dateText}
          </p>
        </div>

        {/* 第三行：剩余天数（加粗强调） */}
        <p className={`mt-1 text-sm font-bold ${urgency.colorClass}`}>
          {daysText}
        </p>
      </div>
    </article>
  );
}
