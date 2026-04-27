"use client";

import { forwardRef } from "react";
import type { SelectHTMLAttributes, ReactElement } from "react";

/**
 * Select — HomeStock 基础下拉选择组件
 *
 * 设计系统对齐：
 * - radius: --hs-radius-control (8px)
 * - focus ring: accent border
 */

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { label, error, options, placeholder, className = "", id, ...rest },
  ref,
): ReactElement {
  const selectId = id ?? (label ? label.replace(/\s+/g, "-").toLowerCase() : undefined);

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={selectId}
          className="text-xs font-medium text-[var(--hs-text-secondary)]"
        >
          {label}
        </label>
      )}
      <select
        ref={ref}
        id={selectId}
        className={[
          "w-full",
          "bg-[var(--hs-bg-surface)]",
          "border",
          error ? "border-[var(--hs-error)]" : "border-[var(--hs-border)]",
          "rounded-[var(--hs-radius-control)]",
          "px-3.5 py-2.5",
          "text-sm text-[var(--hs-text)]",
          "focus:outline-none focus:border-[var(--hs-accent)]",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "cursor-pointer",
          className,
        ].join(" ")}
        style={{
          transitionProperty: "border-color, box-shadow",
          transitionDuration: "var(--hs-duration-micro)",
          transitionTimingFunction: "var(--hs-ease)",
        }}
        {...rest}
      >
        {placeholder && (
          <option value="">{placeholder}</option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-xs text-[var(--hs-error)]">{error}</p>
      )}
    </div>
  );
});

export default Select;
