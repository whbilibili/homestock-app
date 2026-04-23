"use client";

import { useState, useCallback } from "react";
import type { ReactElement, FormEvent } from "react";
import type { ShoppingListItemDoc } from "@/hooks/useShoppingList";
import type { Id } from "@/convex/_generated/dataModel";
import Button from "@/components/ui/Button";

/**
 * PurchaseSheet — 入库面板
 *
 * 勾选购物清单项后展开，填写实际购买数量、价格、保质期日期。
 * trackExpiry 物品入库时强制填写保质期日期。
 * 支持单项入库和批量入库。
 *
 * 设计系统：
 * - radius: --hs-radius-component
 * - 背景: --hs-bg-canvas（轻微区分于卡片）
 * - border: --hs-accent（进入编辑态强调）
 * - 动画: slideUp
 */

interface PurchaseSheetProps {
  selectedItems: ShoppingListItemDoc[];
  /** 已关联物品中哪些需要 trackExpiry（需要父组件传入或从 item 信息推断） */
  trackExpiryItemIds: Set<string>;
  onCompletePurchase: (args: {
    id: Id<"shoppingListItems">;
    actualQuantity: number;
    price?: number;
    expiryDate?: number;
  }) => Promise<void>;
  onCancel: () => void;
  /** 全部入库成功后回调 */
  onSuccess?: () => void;
}

interface PurchaseFormRow {
  id: Id<"shoppingListItems">;
  itemName: string;
  unit: string;
  plannedQuantity: number;
  actualQuantity: number;
  price: string;
  expiryDate: string;
  needsExpiry: boolean;
}

export default function PurchaseSheet({
  selectedItems,
  trackExpiryItemIds,
  onCompletePurchase,
  onCancel,
  onSuccess,
}: PurchaseSheetProps): ReactElement {
  const [rows, setRows] = useState<PurchaseFormRow[]>(() =>
    selectedItems.map((item) => ({
      id: item._id,
      itemName: item.itemName,
      unit: item.unit ?? "个",
      plannedQuantity: item.plannedQuantity,
      actualQuantity: item.plannedQuantity,
      price: "",
      expiryDate: "",
      needsExpiry: item.itemId !== undefined && trackExpiryItemIds.has(item.itemId as string),
    })),
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const updateRow = useCallback((index: number, field: keyof PurchaseFormRow, value: string | number) => {
    setRows((prev) =>
      prev.map((row, i) =>
        i === index ? { ...row, [field]: value } : row,
      ),
    );
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      // 验证
      for (const row of rows) {
        if (row.actualQuantity <= 0) {
          setError(`${row.itemName} 的实际数量必须大于 0`);
          return;
        }
        if (row.needsExpiry && !row.expiryDate) {
          setError(`${row.itemName} 需要追踪保质期，请填写过期日期`);
          return;
        }
      }

      setSubmitting(true);
      try {
        for (const row of rows) {
          await onCompletePurchase({
            id: row.id,
            actualQuantity: row.actualQuantity,
            price: row.price ? Number(row.price) : undefined,
            expiryDate: row.expiryDate
              ? new Date(row.expiryDate).getTime()
              : undefined,
          });
        }
        onSuccess?.();
      } catch (err) {
        setError(err instanceof Error ? err.message : "入库失败，请重试");
      } finally {
        setSubmitting(false);
      }
    },
    [rows, onCompletePurchase, onSuccess],
  );

  const inputClass = [
    "w-full",
    "bg-[var(--hs-bg-surface)]",
    "border border-[var(--hs-border)]",
    "rounded-[var(--hs-radius-element)]",
    "px-3 py-2",
    "text-sm text-[var(--hs-text)]",
    "placeholder:text-[var(--hs-text-muted)]",
    "transition-[border-color,box-shadow] duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
    "focus:outline-none focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
  ].join(" ");

  return (
    <div
      className={[
        "bg-[var(--hs-bg-canvas)]",
        "border border-[var(--hs-accent)]",
        "rounded-[var(--hs-radius-component)]",
        "p-4",
        "animate-[slideUp_var(--hs-duration-emphasis)_var(--hs-ease)]",
      ].join(" ")}
    >
      <h3 className="text-base font-bold text-[var(--hs-text)] mb-3">
        📥 确认入库（{rows.length} 项）
      </h3>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {rows.map((row, index) => (
          <div
            key={row.id}
            className="flex flex-col gap-2 p-3 bg-[var(--hs-bg-surface)] rounded-[var(--hs-radius-element)] border border-[var(--hs-border)]"
          >
            <p className="text-sm font-medium text-[var(--hs-text)]">
              {row.itemName}
              <span className="ml-1 text-xs text-[var(--hs-text-muted)]">
                （计划 {row.plannedQuantity} {row.unit}）
              </span>
            </p>

            <div className="grid grid-cols-2 gap-2">
              {/* 实际数量 */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`actual-${row.id}`}
                  className="text-xs font-semibold tracking-wide text-[var(--hs-text)]"
                >
                  实际数量 *
                </label>
                <input
                  id={`actual-${row.id}`}
                  type="number"
                  min={1}
                  value={row.actualQuantity}
                  onChange={(e) => updateRow(index, "actualQuantity", Number(e.target.value))}
                  className={inputClass}
                />
              </div>

              {/* 价格 */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`price-${row.id}`}
                  className="text-xs font-semibold tracking-wide text-[var(--hs-text)]"
                >
                  价格（元）
                </label>
                <input
                  id={`price-${row.id}`}
                  type="number"
                  min={0}
                  step={0.01}
                  value={row.price}
                  onChange={(e) => updateRow(index, "price", e.target.value)}
                  placeholder="可选"
                  className={inputClass}
                />
              </div>
            </div>

            {/* 保质期日期（trackExpiry 时必填） */}
            {row.needsExpiry && (
              <div className="flex flex-col gap-1">
                <label
                  htmlFor={`expiry-${row.id}`}
                  className="text-xs font-semibold tracking-wide text-[var(--hs-text)]"
                >
                  过期日期 *
                </label>
                <input
                  id={`expiry-${row.id}`}
                  type="date"
                  value={row.expiryDate}
                  onChange={(e) => updateRow(index, "expiryDate", e.target.value)}
                  required
                  className={inputClass}
                />
              </div>
            )}
          </div>
        ))}

        {/* 错误提示 */}
        {error && (
          <p className="text-sm text-[var(--hs-error)] bg-[var(--hs-error-bg)] px-3 py-2 rounded-[var(--hs-radius-element)]">
            ⚠️ {error}
          </p>
        )}

        {/* 操作按钮 */}
        <div className="flex justify-end gap-2">
          <Button variant="secondary" size="md" type="button" onClick={onCancel}>
            取消
          </Button>
          <Button variant="primary" size="md" type="submit" disabled={submitting}>
            {submitting ? "入库中..." : `✅ 确认入库（${rows.length} 项）`}
          </Button>
        </div>
      </form>
    </div>
  );
}
