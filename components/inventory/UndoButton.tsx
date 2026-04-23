"use client";

import { useState, useCallback, useEffect } from "react";
import type { ReactElement } from "react";
import Button from "@/components/ui/Button";
import type { InventoryLogDoc } from "@/hooks/useInventory";

/**
 * UndoButton — 撤销最近库存操作按钮
 *
 * INV-003: 仅在最近 5 分钟内有操作时可用
 * - disabled 时需 aria-disabled + 提示文字说明原因
 * - 使用 useSyncedCanUndo hook：
 *   初始 false（SSR 安全），mount 后 setTimeout(0) 首次计算，
 *   然后 setInterval 每秒更新。全部在异步 callback 中 setState，
 *   避免 effect body 直接 setState 和渲染中调用 Date.now()
 */

/** 5 分钟，单位毫秒 */
const UNDO_WINDOW_MS = 5 * 60 * 1000;

/** 判断是否可撤销（仅在事件/callback 中调用） */
function isWithinUndoWindow(logCreationTime: number): boolean {
  return Date.now() - logCreationTime <= UNDO_WINDOW_MS;
}

/**
 * 自定义 hook：追踪 canUndo 状态
 * 初始 false，通过 setTimeout(0) + setInterval(1s) 在 callback 中更新
 */
function useSyncedCanUndo(lastLog: InventoryLogDoc | null): boolean {
  const [canUndo, setCanUndo] = useState(false);

  useEffect(() => {
    if (lastLog === null) {
      // lastLog 为 null 时在 setTimeout callback 中更新，不在 body 直接调用
      const tid = setTimeout(() => setCanUndo(false), 0);
      return () => clearTimeout(tid);
    }

    const creationTime = lastLog._creationTime;

    const check = (): void => {
      const result = isWithinUndoWindow(creationTime);
      setCanUndo(result);
      if (!result) {
        clearInterval(intervalId);
      }
    };

    // 首次检查延迟到 microtask，不在 effect body 直接 setState
    const timeoutId = setTimeout(check, 0);
    const intervalId = setInterval(check, 1000);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
    };
  }, [lastLog]);

  return canUndo;
}

interface UndoButtonProps {
  /** 最近一条 log（用于判断是否可撤销） */
  lastLog: InventoryLogDoc | null;
  /** 撤销 mutation */
  onUndo: () => Promise<{ success: boolean }>;
  /** 撤销成功回调 */
  onUndoSuccess?: () => void;
  /** 撤销失败回调 */
  onUndoError?: (message: string) => void;
}

export default function UndoButton({
  lastLog,
  onUndo,
  onUndoSuccess,
  onUndoError,
}: UndoButtonProps): ReactElement {
  const [undoing, setUndoing] = useState(false);
  const canUndo = useSyncedCanUndo(lastLog);

  // 不可撤销的原因
  const disabledReason = lastLog === null
    ? "暂无操作记录"
    : "最近操作已超过 5 分钟，无法撤销";

  const handleUndo = useCallback(async () => {
    setUndoing(true);
    try {
      const result = await onUndo();
      if (result.success) {
        onUndoSuccess?.();
      } else {
        onUndoError?.("撤销失败：操作可能已超时");
      }
    } catch (err) {
      onUndoError?.(err instanceof Error ? err.message : "撤销失败，请重试");
    } finally {
      setUndoing(false);
    }
  }, [onUndo, onUndoSuccess, onUndoError]);

  return (
    <div className="flex items-center gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={handleUndo}
        disabled={!canUndo || undoing}
        aria-disabled={!canUndo || undoing}
      >
        {undoing ? "撤销中..." : "↩️ 撤销最近操作"}
      </Button>
      {!canUndo && !undoing && (
        <span className="text-xs text-[var(--hs-text-muted)]">
          {disabledReason}
        </span>
      )}
    </div>
  );
}
