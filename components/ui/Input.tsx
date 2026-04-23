"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactElement } from "react";

/**
 * Input — HomeStock 基础输入框组件
 *
 * 遵循设计系统：
 * - radius: --hs-radius-element (6px)
 * - focus ring: emerald accent
 * - 无暗色模式
 */

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { label, error, className = "", id, ...rest },
  ref,
): ReactElement {
  const inputId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-xs font-semibold tracking-wide text-[var(--hs-text)]"
        >
          {label}
        </label>
      )}
      <input
        ref={ref}
        id={inputId}
        className={[
          "w-full",
          "bg-[var(--hs-bg-surface)]",
          "border",
          error ? "border-[var(--hs-error)]" : "border-[var(--hs-border)]",
          "rounded-[var(--hs-radius-element)]",
          "px-3.5 py-2.5",
          "text-sm text-[var(--hs-text)]",
          "placeholder:text-[var(--hs-text-muted)]",
          "transition-[border-color,box-shadow] duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
          "focus:outline-none focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        ].join(" ")}
        {...rest}
      />
      {error && (
        <p className="text-xs text-[var(--hs-error)]">{error}</p>
      )}
    </div>
  );
});

export default Input;
