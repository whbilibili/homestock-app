"use client";

import { useCallback, useEffect, useRef } from "react";
import type { ReactElement, ReactNode } from "react";

/**
 * Dialog — HomeStock 模态弹窗组件
 *
 * 遵循设计系统：
 * - radius: --hs-radius-component (16px)
 * - shadow: --hs-shadow-modal
 * - z-index: --hs-z-modal (200)
 * - 动画: slideUp 300ms
 * - ESC 关闭 + 遮罩关闭
 * - 焦点陷阱（基础实现）
 */

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  /** 弹窗最大宽度，默认 max-w-lg */
  maxWidth?: string;
}

export default function Dialog({
  open,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
}: DialogProps): ReactElement | null {
  const dialogRef = useRef<HTMLDivElement>(null);

  // ESC 关闭
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  useEffect(() => {
    if (open) {
      document.addEventListener("keydown", handleKeyDown);
      // 阻止背景滚动
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "";
      };
    }
  }, [open, handleKeyDown]);

  // 打开时聚焦弹窗
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus();
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ zIndex: "var(--hs-z-modal)" }}
    >
      {/* 遮罩 */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 弹窗内容 */}
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        className={[
          "relative w-full",
          maxWidth,
          "bg-[var(--hs-bg-surface)]",
          "border border-[var(--hs-border)]",
          "rounded-[var(--hs-radius-component)]",
          "shadow-[var(--hs-shadow-modal)]",
          "animate-[slideUp_var(--hs-duration-emphasis)_var(--hs-ease)]",
          "max-h-[85vh] overflow-y-auto",
          "focus:outline-none",
        ].join(" ")}
      >
        {/* 标题栏 */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--hs-border)]">
          <h2 className="text-lg font-bold text-[var(--hs-text)]">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-[var(--hs-text-muted)] hover:text-[var(--hs-text)] transition-colors duration-[var(--hs-duration-micro)] cursor-pointer p-1"
            aria-label="关闭弹窗"
          >
            ✕
          </button>
        </div>

        {/* 内容区 */}
        <div className="px-6 py-4">
          {children}
        </div>
      </div>
    </div>
  );
}
