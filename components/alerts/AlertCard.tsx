"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import type { AlertDoc } from "@/hooks/useAlerts";
import { alertTypeMeta, formatAlertTime } from "@/hooks/useAlerts";
import type { Id } from "@/convex/_generated/dataModel";
import Button from "@/components/ui/Button";

/**
 * AlertCard — 单条提醒卡片
 *
 * 设计系统：
 * - radius: --hs-radius-component (16px)
 * - 无阴影（flat at rest）
 * - 左侧类型色条 w-1, rounded-l，颜色映射：low_stock/expiry_soon→warn, out_of_stock/expired→error
 * - hover: translateY(-1px)
 * - 语义元素：<article>（每条提醒独立含义）
 * - 两个操作按钮：'加入购物清单'（primary sm）、'忽略'（ghost sm）
 */

/** 左侧色条颜色映射 */
const typeBarColor: Record<AlertDoc["type"], string> = {
  low_stock: "bg-[var(--hs-warn)]",
  out_of_stock: "bg-[var(--hs-error)]",
  expiry_soon: "bg-[var(--hs-warn)]",
  expired: "bg-[var(--hs-error)]",
};

interface AlertCardProps {
  alert: AlertDoc;
  onDismiss: (alertId: Id<"alerts">) => void;
  onAddToShoppingList: (alertId: Id<"alerts">) => void;
}

export default function AlertCard({
  alert,
  onDismiss,
  onAddToShoppingList,
}: AlertCardProps): ReactElement {
  const meta = alertTypeMeta[alert.type];
  const [isAddingToList, setIsAddingToList] = useState(false);
  const [isDismissing, setIsDismissing] = useState(false);

  const handleAddToShoppingList = async (): Promise<void> => {
    setIsAddingToList(true);
    try {
      onAddToShoppingList(alert._id);
    } finally {
      setIsAddingToList(false);
    }
  };

  const handleDismiss = async (): Promise<void> => {
    setIsDismissing(true);
    try {
      onDismiss(alert._id);
    } finally {
      setIsDismissing(false);
    }
  };

  return (
    <article
      className={[
        "relative flex overflow-hidden",
        "bg-[var(--hs-bg-surface)]",
        "border border-[var(--hs-border)]",
        "rounded-[var(--hs-radius-component)]",
        "transition-shadow duration-[var(--hs-duration-standard)] ease-[var(--hs-ease)]",
        "hover:shadow-[var(--hs-shadow-1)]",
      ].join(" ")}
      aria-label={`${alert.itemName} ${meta.label}`}
    >
      {/* 左侧类型色条 */}
      <div
        className={[
          "w-1 flex-shrink-0 rounded-l-[var(--hs-radius-component)]",
          typeBarColor[alert.type],
        ].join(" ")}
        aria-hidden="true"
      />

      {/* 卡片主体 */}
      <div className="flex-1 p-4 min-w-0">
        {/* 第一行：emoji + 物品名 + 类型 badge */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl flex-shrink-0" aria-hidden="true">
            {meta.emoji}
          </span>
          <h3 className="text-base font-medium text-[var(--hs-text)] truncate">
            {alert.itemName}
          </h3>
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

        {/* 第二行：时间戳 */}
        <p className="mt-1 text-xs text-[var(--hs-text-muted)]">
          {formatAlertTime(alert._creationTime)}
        </p>

        {/* 第三行：操作按钮 */}
        <div className="mt-3 flex items-center gap-2">
          <Button
            variant="primary"
            size="sm"
            disabled={isAddingToList}
            onClick={handleAddToShoppingList}
            aria-label={`将 ${alert.itemName} 加入购物清单`}
          >
            🛒 加入购物清单
          </Button>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDismissing}
            onClick={handleDismiss}
            aria-label={`忽略 ${alert.itemName} 的提醒`}
          >
            忽略
          </Button>
        </div>
      </div>
    </article>
  );
}
