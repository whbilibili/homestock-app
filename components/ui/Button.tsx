"use client";

import type { ButtonHTMLAttributes, ReactElement } from "react";

/**
 * Button — HomeStock 基础按钮组件
 *
 * 变体：
 * - primary: mint-green 主色按钮（CTA）
 * - secondary: 白底描边按钮
 * - ghost: 无边框透明按钮
 * - danger: 红色危险操作按钮
 *
 * 尺寸：
 * - sm: 紧凑（padding 6px 12px）
 * - md: 默认（padding 10px 20px）
 * - lg: 大号（padding 12px 24px）
 *
 * 设计系统对齐：
 * - 无 translate/glow hover（anti-pattern）
 * - radius: --hs-radius-control (8px)
 * - focus: 2px ring + offset
 */

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: [
    "text-[var(--hs-text-inverse)]",
    "bg-[var(--hs-accent)]",
    "hover:bg-[var(--hs-accent-hover)]",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--hs-accent)]",
    "focus-visible:ring-offset-2",
  ].join(" "),
  secondary: [
    "text-[var(--hs-text)]",
    "bg-[var(--hs-bg-surface)]",
    "border",
    "border-[var(--hs-border)]",
    "hover:border-[var(--hs-accent)]",
    "hover:text-[var(--hs-accent)]",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--hs-accent)]",
    "focus-visible:ring-offset-2",
  ].join(" "),
  ghost: [
    "text-[var(--hs-text-muted)]",
    "bg-transparent",
    "hover:bg-[var(--hs-bg-inset)]",
    "hover:text-[var(--hs-text)]",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--hs-accent)]",
    "focus-visible:ring-offset-2",
  ].join(" "),
  danger: [
    "text-[var(--hs-text-inverse)]",
    "bg-[var(--hs-error)]",
    "hover:bg-[var(--hs-error-dark)]",
    "focus-visible:outline-none",
    "focus-visible:ring-2",
    "focus-visible:ring-[var(--hs-error)]",
    "focus-visible:ring-offset-2",
  ].join(" "),
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

export default function Button({
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  children,
  ...rest
}: ButtonProps): ReactElement {
  return (
    <button
      className={[
        "inline-flex items-center justify-center gap-2",
        "font-medium",
        "rounded-[var(--hs-radius-control)]",
        "transition-colors",
        "cursor-pointer",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
      style={{
        transitionDuration: "var(--hs-duration-micro)",
        transitionTimingFunction: "var(--hs-ease)",
      }}
      disabled={disabled}
      {...rest}
    >
      {children}
    </button>
  );
}
