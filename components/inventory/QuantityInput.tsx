"use client";

import { useCallback, useState } from "react";
import type { ReactElement } from "react";

/**
 * QuantityInput — 内联数量调整控件
 *
 * 设计系统：
 * - ±按钮 ≥ 44×44px（移动端触摸友好）
 * - radius: --hs-radius-control (10px)
 * - 按钮使用 ghost 风格，hover 显示 accent 色
 * - 数字居中展示，最小宽度 3ch
 * - disabled 状态 opacity 0.5
 */

interface QuantityInputProps {
  /** 当前数量 */
  quantity: number;
  /** 单位文字 */
  unit: string;
  /** 数量变化回调，参数为变化量（+1 / -1） */
  onAdjust: (change: number) => void;
  /** 是否禁用 */
  disabled?: boolean;
}

export default function QuantityInput({
  quantity,
  unit,
  onAdjust,
  disabled = false,
}: QuantityInputProps): ReactElement {
  const [isPending, setIsPending] = useState(false);

  const handleAdjust = useCallback(
    (change: number) => {
      if (isPending || disabled) return;
      setIsPending(true);
      try {
        onAdjust(change);
      } finally {
        // 短暂延迟防止连击
        setTimeout(() => setIsPending(false), 300);
      }
    },
    [onAdjust, isPending, disabled],
  );

  const isDecrementDisabled = disabled || isPending || quantity === 0;
  const isIncrementDisabled = disabled || isPending;

  return (
    <div className="flex items-center gap-1">
      {/* 减按钮 */}
      <button
        type="button"
        onClick={() => handleAdjust(-1)}
        disabled={isDecrementDisabled}
        aria-label={`减少 1 ${unit}`}
        className={[
          "flex items-center justify-center",
          "w-11 h-11 min-w-[44px] min-h-[44px]",
          "rounded-[var(--hs-radius-control)]",
          "text-lg font-bold",
          "text-[var(--hs-text-muted)]",
          "bg-transparent",
          "border border-[var(--hs-border)]",
          "transition-all duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
          "hover:border-[var(--hs-accent)] hover:text-[var(--hs-accent)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hs-accent)] focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-[var(--hs-border)] disabled:hover:text-[var(--hs-text-muted)]",
          "cursor-pointer",
        ].join(" ")}
      >
        −
      </button>

      {/* 数量显示 */}
      <div className="flex items-baseline justify-center min-w-[3ch] px-2">
        <span className="text-lg font-bold text-[var(--hs-text)] tabular-nums">
          {quantity}
        </span>
        <span className="text-xs text-[var(--hs-text-muted)] ml-0.5">
          {unit}
        </span>
      </div>

      {/* 加按钮 */}
      <button
        type="button"
        onClick={() => handleAdjust(1)}
        disabled={isIncrementDisabled}
        aria-label={`增加 1 ${unit}`}
        className={[
          "flex items-center justify-center",
          "w-11 h-11 min-w-[44px] min-h-[44px]",
          "rounded-[var(--hs-radius-control)]",
          "text-lg font-bold",
          "text-[var(--hs-text-inverse)]",
          "bg-[var(--hs-accent)]",
          "transition-all duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
          "hover:bg-[var(--hs-accent-dark)]",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hs-accent)] focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "cursor-pointer",
        ].join(" ")}
      >
        +
      </button>
    </div>
  );
}
