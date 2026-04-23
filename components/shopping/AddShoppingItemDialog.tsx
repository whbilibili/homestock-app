"use client";

import { useState, useCallback } from "react";
import type { ReactElement, FormEvent } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import { useItemList } from "@/hooks/useItems";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * AddShoppingItemDialog — 手动添加购物清单项弹窗
 *
 * 两种模式：
 * 1. 从物品库选择（关联 itemId）
 * 2. 输入临时物品名（tempItemName）
 *
 * 设计系统：
 * - 复用 Dialog 组件
 * - Tab 切换风格与 CreateItemDialog 一致
 * - 输入框使用 --hs-* token
 */

type TabMode = "existing" | "temp";

interface AddShoppingItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (args: {
    itemId?: Id<"items">;
    tempItemName?: string;
    plannedQuantity: number;
  }) => Promise<void>;
}

export default function AddShoppingItemDialog({
  open,
  onClose,
  onSubmit,
}: AddShoppingItemDialogProps): ReactElement {
  const [tab, setTab] = useState<TabMode>("existing");
  const [selectedItemId, setSelectedItemId] = useState<string>("");
  const [tempName, setTempName] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 获取物品库（排除已归档）
  const items = useItemList({ includeArchived: false });

  const resetForm = useCallback(() => {
    setTab("existing");
    setSelectedItemId("");
    setTempName("");
    setQuantity(1);
    setError("");
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      if (quantity <= 0) {
        setError("数量必须大于 0");
        return;
      }

      if (tab === "existing" && !selectedItemId) {
        setError("请选择一个物品");
        return;
      }

      if (tab === "temp" && !tempName.trim()) {
        setError("请输入物品名称");
        return;
      }

      setSubmitting(true);
      try {
        await onSubmit({
          itemId: tab === "existing" ? (selectedItemId as Id<"items">) : undefined,
          tempItemName: tab === "temp" ? tempName.trim() : undefined,
          plannedQuantity: quantity,
        });
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "添加失败，请重试");
      } finally {
        setSubmitting(false);
      }
    },
    [tab, selectedItemId, tempName, quantity, onSubmit, handleClose],
  );

  const inputClass = [
    "w-full",
    "bg-[var(--hs-bg-surface)]",
    "border border-[var(--hs-border)]",
    "rounded-[var(--hs-radius-element)]",
    "px-3.5 py-2.5",
    "text-sm text-[var(--hs-text)]",
    "placeholder:text-[var(--hs-text-muted)]",
    "transition-[border-color,box-shadow] duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
    "focus:outline-none focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
  ].join(" ");

  const selectClass = [
    "w-full",
    "bg-[var(--hs-bg-surface)]",
    "border border-[var(--hs-border)]",
    "rounded-[var(--hs-radius-element)]",
    "px-3.5 py-2.5",
    "text-sm text-[var(--hs-text)]",
    "transition-[border-color,box-shadow] duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
    "focus:outline-none focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
    "cursor-pointer",
  ].join(" ");

  return (
    <Dialog open={open} onClose={handleClose} title="添加到购物清单">
      {/* Tab 切换 */}
      <div className="flex gap-1 mb-4 p-1 bg-[var(--hs-bg-canvas)] rounded-[var(--hs-radius-control)]">
        <button
          type="button"
          onClick={() => setTab("existing")}
          className={[
            "flex-1 py-2 text-sm font-semibold rounded-[var(--hs-radius-element)]",
            "transition-all duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
            "cursor-pointer",
            tab === "existing"
              ? "bg-[var(--hs-bg-surface)] text-[var(--hs-accent)] shadow-sm"
              : "text-[var(--hs-text-muted)] hover:text-[var(--hs-text)]",
          ].join(" ")}
        >
          🏷️ 物品库
        </button>
        <button
          type="button"
          onClick={() => setTab("temp")}
          className={[
            "flex-1 py-2 text-sm font-semibold rounded-[var(--hs-radius-element)]",
            "transition-all duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
            "cursor-pointer",
            tab === "temp"
              ? "bg-[var(--hs-bg-surface)] text-[var(--hs-accent)] shadow-sm"
              : "text-[var(--hs-text-muted)] hover:text-[var(--hs-text)]",
          ].join(" ")}
        >
          ✏️ 临时物品
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {tab === "existing" && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="shopping-item-select"
              className="text-xs font-semibold tracking-wide text-[var(--hs-text)]"
            >
              选择物品 *
            </label>
            {items === undefined ? (
              <div className="h-10 rounded-[var(--hs-radius-element)] bg-[var(--hs-border)] animate-pulse" />
            ) : (
              <select
                id="shopping-item-select"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className={selectClass}
              >
                <option value="">请选择物品</option>
                {items.map((item) => (
                  <option key={item._id} value={item._id}>
                    {item.name}（{item.unit}）
                  </option>
                ))}
              </select>
            )}
          </div>
        )}

        {tab === "temp" && (
          <div className="flex flex-col gap-1.5">
            <label
              htmlFor="shopping-temp-name"
              className="text-xs font-semibold tracking-wide text-[var(--hs-text)]"
            >
              物品名称 *
            </label>
            <input
              id="shopping-temp-name"
              type="text"
              value={tempName}
              onChange={(e) => setTempName(e.target.value)}
              placeholder="例如：垃圾袋"
              required={tab === "temp"}
              className={inputClass}
            />
          </div>
        )}

        {/* 计划购买数量 */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="shopping-quantity"
            className="text-xs font-semibold tracking-wide text-[var(--hs-text)]"
          >
            计划购买数量 *
          </label>
          <input
            id="shopping-quantity"
            type="number"
            min={1}
            value={quantity}
            onChange={(e) => setQuantity(Number(e.target.value))}
            className={inputClass}
          />
        </div>

        {/* 错误提示 */}
        {error && (
          <p className="text-sm text-[var(--hs-error)] bg-[var(--hs-error-bg)] px-3 py-2 rounded-[var(--hs-radius-element)]">
            ⚠️ {error}
          </p>
        )}

        {/* 提交按钮 */}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="secondary" size="md" type="button" onClick={handleClose}>
            取消
          </Button>
          <Button variant="primary" size="md" type="submit" disabled={submitting}>
            {submitting ? "添加中..." : "🛒 添加到清单"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
