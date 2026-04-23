"use client";

import type { ReactElement } from "react";
import { useInventoryHistory, useUndoLastChange } from "@/hooks/useInventory";
import type { Id } from "@/convex/_generated/dataModel";
import HistoryEntry from "./HistoryEntry";
import UndoButton from "./UndoButton";

/**
 * HistoryTab — 库存修改历史列表
 *
 * INV-003: 物品详情页中的"历史"Tab 内容
 * - 展示该物品的所有库存变更记录（倒序）
 * - 顶部撤销按钮（最近 5 分钟内可用）
 * - 空状态引导
 *
 * 设计系统：
 * - 列表容器使用 --hs-radius-component
 * - 无阴影（flat at rest）
 * - 空状态使用 emoji + Outfit 正文
 */

interface HistoryTabProps {
  itemId: Id<"items">;
  /** 物品单位 */
  unit: string;
  /** Toast 回调（成功/失败） */
  onToast?: (message: string, type: "success" | "error") => void;
}

export default function HistoryTab({
  itemId,
  unit,
  onToast,
}: HistoryTabProps): ReactElement {
  const history = useInventoryHistory(itemId);
  const undoLastChange = useUndoLastChange();

  // 最近一条 log（用于 UndoButton 判断是否可撤销）
  const lastLog = history !== undefined && history.length > 0 ? history[0] : null;

  // ── 加载态 ──
  if (history === undefined) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={`history-skeleton-${i}`}
            className="h-14 bg-[var(--hs-bg-surface)] border border-[var(--hs-border)] rounded-[var(--hs-radius-element)] animate-pulse"
          />
        ))}
      </div>
    );
  }

  // ── 空状态 ──
  if (history.length === 0) {
    return (
      <div className="py-12 text-center">
        <span className="text-4xl" aria-hidden="true">📋</span>
        <p className="text-base font-medium text-[var(--hs-text)] mt-3">
          暂无修改记录
        </p>
        <p className="text-sm text-[var(--hs-text-muted)] mt-1">
          在库存页面调整数量后，记录将显示在这里
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 撤销按钮 */}
      <UndoButton
        lastLog={lastLog}
        onUndo={() => undoLastChange({ itemId })}
        onUndoSuccess={() => onToast?.("已撤销最近操作", "success")}
        onUndoError={(msg) => onToast?.(msg, "error")}
      />

      {/* 历史记录列表 */}
      <div
        className={[
          "bg-[var(--hs-bg-surface)]",
          "border border-[var(--hs-border)]",
          "rounded-[var(--hs-radius-component)]",
          "overflow-hidden",
        ].join(" ")}
      >
        {history.map((log) => (
          <HistoryEntry key={log._id} log={log} unit={unit} />
        ))}
      </div>

      {/* 底部提示 */}
      <p className="text-xs text-[var(--hs-text-muted)] text-center">
        最多显示最近 100 条记录
      </p>
    </div>
  );
}
