"use client";

import type { ReactElement } from "react";
import { useBatchesByItem } from "@/hooks/useBatches";
import type { Id } from "@/convex/_generated/dataModel";
import BatchEntry from "./BatchEntry";

/**
 * BatchesTab — 物品详情页中的"批次"Tab 内容
 *
 * 展示该物品所有批次（按 expiryDate 升序，最近过期排前面）
 * 仅 trackExpiry=true 的物品显示此 Tab
 *
 * 设计系统：
 * - 列表容器使用 --hs-radius-component
 * - 无阴影（flat at rest）
 * - 空状态使用 emoji + Outfit 正文
 */

interface BatchesTabProps {
  itemId: Id<"items">;
  unit: string;
}

export default function BatchesTab({ itemId, unit }: BatchesTabProps): ReactElement {
  const batches = useBatchesByItem(itemId);

  // ── 加载态 ──
  if (batches === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={`batch-skeleton-${i}`}
            className="h-14 bg-[var(--hs-bg-surface)] border border-[var(--hs-border)] rounded-[var(--hs-radius-element)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  // ── 空状态 ──
  if (batches.length === 0) {
    return (
      <div className="py-12 text-center">
        <span className="text-4xl" aria-hidden="true">📦</span>
        <p className="text-base font-medium text-[var(--hs-text)] mt-3">
          暂无批次记录
        </p>
        <p className="text-sm text-[var(--hs-text-muted)] mt-1">
          通过购物清单入库带保质期的物品后，批次将显示在这里
        </p>
      </div>
    );
  }

  // 统计 active 批次总量
  const activeBatches = batches.filter((b) => b.status === "active");
  const totalActiveQty = activeBatches.reduce((sum, b) => sum + b.quantity, 0);

  return (
    <div className="space-y-4">
      {/* 批次汇总 */}
      <div className="p-4 bg-[var(--hs-bg-canvas)] rounded-[var(--hs-radius-control)]">
        <p className="text-xs font-semibold text-[var(--hs-text-muted)] mb-1">有效批次库存</p>
        <div className="flex items-baseline gap-1">
          <span className="text-2xl font-bold text-[var(--hs-text)]">{totalActiveQty}</span>
          <span className="text-sm text-[var(--hs-text-muted)]">{unit}</span>
          <span className="text-xs text-[var(--hs-text-muted)] ml-2">
            （{activeBatches.length} 个批次）
          </span>
        </div>
      </div>

      {/* 批次列表 */}
      <div
        className={[
          "bg-[var(--hs-bg-surface)]",
          "border border-[var(--hs-border)]",
          "rounded-[var(--hs-radius-component)]",
          "overflow-hidden",
        ].join(" ")}
      >
        {batches.map((batch) => (
          <BatchEntry key={batch._id} batch={batch} unit={unit} />
        ))}
      </div>

      {/* 底部提示 */}
      <p className="text-xs text-[var(--hs-text-muted)] text-center">
        批次按保质期升序排列，最近过期的排在前面（FEFO）
      </p>
    </div>
  );
}
