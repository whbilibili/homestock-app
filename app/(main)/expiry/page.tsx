"use client";

import type { ReactElement } from "react";
import { useExpiringBatches } from "@/hooks/useBatches";
import ExpiryOverview from "@/components/expiry/ExpiryOverview";

/**
 * 保质期管理页 — /expiry
 *
 * EXPIRY-002: 展示所有临期和过期批次，按紧急程度排序
 * 排序优先级：过期 → 3天内 → 7天内
 * 状态颜色：正常(绿) → 7天(黄) → 3天(橙) → 已过期(红)
 */

export default function ExpiryPage(): ReactElement {
  const batches = useExpiringBatches();

  return (
    <div className="py-6 max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--hs-text)" }}
        >
          ⏰ 保质期
        </h1>
        <p
          className="text-sm mt-1"
          style={{ color: "var(--hs-text-muted)" }}
        >
          关注临期和过期的物品，避免浪费
        </p>
      </div>

      {/* 内容区 */}
      {batches === undefined ? (
        /* 加载态：spinner */
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-[var(--hs-border)] border-t-[var(--hs-accent)] rounded-full" style={{ animation: "spin 0.8s linear infinite" }} /></div>
      ) : (
        <ExpiryOverview batches={batches} />
      )}
    </div>
  );
}
