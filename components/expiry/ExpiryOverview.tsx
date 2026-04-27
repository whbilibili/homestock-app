"use client";

import { useMemo } from "react";
import type { ReactElement } from "react";
import type { ExpiringBatchDoc } from "@/hooks/useBatches";
import { getUrgency } from "@/hooks/useBatches";
import type { UrgencyLevel } from "@/hooks/useBatches";
import ExpiryCard from "./ExpiryCard";

/**
 * ExpiryOverview — 临期/过期批次总览列表
 *
 * 接收临期批次数组，渲染 ExpiryCard 列表或空状态。
 * 设计系统：
 * - 列表间距 gap-3（12px）
 * - 空状态：居中展示 emoji(48px) + Noto Serif JP 标题 + 辅助文字
 */

interface ExpiryOverviewProps {
  batches: ExpiringBatchDoc[];
}

export default function ExpiryOverview({ batches }: ExpiryOverviewProps): ReactElement {
  // 统计数据（在条件分支前调用 useMemo 确保 hooks 调用顺序一致）
  // 使用 getUrgency 做分类，避免直接调 Date.now
  const stats = useMemo(() => {
    const counts: Record<UrgencyLevel, number> = {
      expired: 0,
      critical: 0,
      warning: 0,
      normal: 0,
    };
    for (const batch of batches) {
      const { level } = getUrgency(batch);
      counts[level]++;
    }
    return counts;
  }, [batches]);

  if (batches.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <span className="text-5xl mb-4" aria-hidden="true">
          ✅
        </span>
        <h2
          className="text-xl font-bold mb-2"
          style={{ color: "var(--hs-text)", letterSpacing: "-0.01em" }}
        >
          保质期一切正常
        </h2>
        <p className="text-sm text-[var(--hs-text-muted)]">
          暂无临期或过期的物品，继续保持 ✓
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 统计栏 */}
      <div className="flex gap-3">
        {stats.expired > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hs-radius-pill)] bg-[var(--hs-error-bg)]">
            <span className="text-xs" aria-hidden="true">💀</span>
            <span className="text-xs font-bold text-[var(--hs-error)]">
              {stats.expired} 已过期
            </span>
          </div>
        )}
        {stats.critical > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hs-radius-pill)] bg-orange-50">
            <span className="text-xs" aria-hidden="true">🔥</span>
            <span className="text-xs font-bold text-orange-600">
              {stats.critical} 3天内
            </span>
          </div>
        )}
        {stats.warning > 0 && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--hs-radius-pill)] bg-[var(--hs-warn-bg)]">
            <span className="text-xs" aria-hidden="true">⏰</span>
            <span className="text-xs font-bold text-[var(--hs-warn)]">
              {stats.warning} 7天内
            </span>
          </div>
        )}
      </div>

      {/* 批次卡片列表 */}
      <div className="flex flex-col gap-3" role="feed" aria-label="保质期关注列表">
        {batches.map((batch) => (
          <ExpiryCard key={batch._id} batch={batch} />
        ))}
      </div>
    </div>
  );
}
