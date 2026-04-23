"use client";

import type { ReactElement } from "react";
import type { AlertDoc } from "@/hooks/useAlerts";
import type { Id } from "@/convex/_generated/dataModel";
import AlertCard from "./AlertCard";

/**
 * AlertList — 提醒列表容器
 *
 * 接收提醒数组，渲染 AlertCard 列表或空状态。
 * 设计系统：
 * - 列表间距 gap-3（12px）
 * - 空状态：居中展示 emoji(48px) + Noto Serif JP 标题 + 辅助文字
 */

interface AlertListProps {
  alerts: AlertDoc[];
  onDismiss: (alertId: Id<"alerts">) => void;
  onAddToShoppingList: (alertId: Id<"alerts">) => void;
}

export default function AlertList({
  alerts,
  onDismiss,
  onAddToShoppingList,
}: AlertListProps): ReactElement {
  if (alerts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <span className="text-5xl mb-4" aria-hidden="true">
          ✅
        </span>
        <h2
          className="text-xl font-bold mb-2"
          style={{
            fontFamily: "'Noto Serif JP', serif",
            color: "var(--hs-text)",
            letterSpacing: "-0.01em",
          }}
        >
          暂无提醒
        </h2>
        <p className="text-sm text-[var(--hs-text-muted)]">
          库存一切正常，继续保持 ✓
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3" role="feed" aria-label="提醒列表">
      {alerts.map((alert) => (
        <AlertCard
          key={alert._id}
          alert={alert}
          onDismiss={onDismiss}
          onAddToShoppingList={onAddToShoppingList}
        />
      ))}
    </div>
  );
}
