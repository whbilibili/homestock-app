"use client";

import { forwardRef } from "react";
import type { InputHTMLAttributes, ReactElement } from "react";

/**
 * Input — HomeStock 基础输入框组件
 *
 * 设计系统对齐：
 * - radius: --hs-radius-control (8px)
 * - focus ring: accent-subtle
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
          className="text-xs font-medium text-[var(--hs-text-secondary)]"
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
          "rounded-[var(--hs-radius-control)]",
          "px-3.5 py-2.5",
          "text-sm text-[var(--hs-text)]",
          "placeholder:text-[var(--hs-text-disabled)]",
          "focus:outline-none focus:border-[var(--hs-accent)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          className,
        ].join(" ")}
        style={{
          transitionProperty: "border-color, box-shadow",
          transitionDuration: "var(--hs-duration-micro)",
          transitionTimingFunction: "var(--hs-ease)",
        }}
        {...rest}
      />
      {error && (
        <p className="text-xs text-[var(--hs-error)]">{error}</p>
      )}
    </div>
  );
});

export default Input;
