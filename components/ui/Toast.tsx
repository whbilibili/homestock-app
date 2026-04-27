"use client";

import { useCallback, useEffect, useState } from "react";

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

type ToastVariant = "error" | "success" | "info";

interface ToastMessage {
  id: number;
  text: string;
  variant: ToastVariant;
}

/* ------------------------------------------------------------------ */
/*  Hook — useToast                                                    */
/* ------------------------------------------------------------------ */

let _nextId = 0;

export function useToast() {
  const [messages, setMessages] = useState<ToastMessage[]>([]);

  const toast = useCallback((text: string, variant: ToastVariant = "info") => {
    const id = _nextId++;
    setMessages((prev) => [...prev, { id, text, variant }]);
  }, []);

  const dismiss = useCallback((id: number) => {
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }, []);

  return { messages, toast, dismiss } as const;
}

/* ------------------------------------------------------------------ */
/*  Variant styles                                                     */
/* ------------------------------------------------------------------ */

const variantStyles: Record<ToastVariant, string> = {
  error:
    "border-[var(--hs-error)] bg-[var(--hs-error-bg)] text-[var(--hs-error)]",
  success:
    "border-[var(--hs-ok)] bg-[var(--hs-ok-bg)] text-[var(--hs-ok)]",
  info:
    "border-[var(--hs-accent)] bg-[var(--hs-accent-subtle)] text-[var(--hs-accent-dark)]",
};

const variantEmoji: Record<ToastVariant, string> = {
  error: "⚠️",
  success: "✅",
  info: "ℹ️",
};

/* ------------------------------------------------------------------ */
/*  Single Toast Item                                                  */
/* ------------------------------------------------------------------ */

function ToastItem({
  message,
  onDismiss,
}: {
  message: ToastMessage;
  onDismiss: (id: number) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(message.id);
    }, 4000);
    return () => clearTimeout(timer);
  }, [message.id, onDismiss]);

  return (
    <div
      role="alert"
      className={`flex items-center gap-2 border px-4 py-3 text-sm font-medium ${variantStyles[message.variant]}`}
      style={{
        borderRadius: "var(--hs-radius-control)",
        boxShadow: "var(--hs-shadow-2)",
        animation: "slideDown var(--hs-duration-standard) var(--hs-ease)",
      }}
    >
      <span aria-hidden="true">{variantEmoji[message.variant]}</span>
      <span className="flex-1">{message.text}</span>
      <button
        type="button"
        onClick={() => onDismiss(message.id)}
        className="ml-2 opacity-60 hover:opacity-100 cursor-pointer"
        style={{
          transitionProperty: "opacity",
          transitionDuration: "var(--hs-duration-micro)",
        }}
        aria-label="关闭提示"
      >
        ✕
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Toast Container — top center (design system spec)                  */
/* ------------------------------------------------------------------ */

export function ToastContainer({
  messages,
  onDismiss,
}: {
  messages: ToastMessage[];
  onDismiss: (id: number) => void;
}) {
  if (messages.length === 0) return null;

  return (
    <div
      className="fixed left-1/2 -translate-x-1/2 flex flex-col gap-2 w-[90vw] max-w-sm"
      style={{
        top: "24px",
        zIndex: "var(--hs-z-modal)",
      }}
    >
      {messages.map((msg) => (
        <ToastItem key={msg.id} message={msg} onDismiss={onDismiss} />
      ))}
    </div>
  );
}
