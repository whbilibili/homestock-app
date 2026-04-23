"use client";

import { useState, useCallback } from "react";
import type { ReactElement, FormEvent } from "react";
import Dialog from "@/components/ui/Dialog";
import Button from "@/components/ui/Button";
import CommonItemPicker from "./CommonItemPicker";
import type { CommonItem } from "@/convex/seed/commonItems";
import type { Category, CreateItemArgs } from "@/hooks/useItems";

/**
 * CreateItemDialog — 创建物品弹窗
 *
 * 两种模式：
 * 1. 手动填写表单
 * 2. 从常用物品库快选（自动填充名称/分类/单位，用户可修改）
 */

type TabMode = "manual" | "common";

const categoryOptions: { value: Category; label: string }[] = [
  { value: "food", label: "🍽️ 食品" },
  { value: "daily", label: "🧴 日用品" },
  { value: "medicine", label: "💊 药品" },
  { value: "appliance", label: "💡 家电" },
  { value: "other", label: "📦 其他" },
];

interface CreateItemDialogProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (args: CreateItemArgs) => Promise<void>;
}

const initialForm: CreateItemArgs = {
  name: "",
  category: "food",
  unit: "个",
  quantity: 0,
  alertThreshold: 1,
  trackExpiry: false,
};

export default function CreateItemDialog({
  open,
  onClose,
  onSubmit,
}: CreateItemDialogProps): ReactElement {
  const [tab, setTab] = useState<TabMode>("common");
  const [form, setForm] = useState<CreateItemArgs>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const resetForm = useCallback(() => {
    setForm(initialForm);
    setTab("common");
    setError("");
  }, []);

  const handleClose = useCallback(() => {
    resetForm();
    onClose();
  }, [onClose, resetForm]);

  const handleCommonSelect = useCallback((item: CommonItem) => {
    setForm({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: 0,
      alertThreshold: item.alertThreshold,
      trackExpiry: item.trackExpiry,
    });
    setTab("manual"); // 切换到手动模式让用户确认/修改
  }, []);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError("");

      // 基础验证
      if (!form.name.trim()) {
        setError("请输入物品名称");
        return;
      }
      if (form.quantity < 0) {
        setError("数量不能为负数");
        return;
      }
      if (form.alertThreshold < 0) {
        setError("警戒线不能为负数");
        return;
      }

      setSubmitting(true);
      try {
        await onSubmit({
          ...form,
          name: form.name.trim(),
        });
        handleClose();
      } catch (err) {
        setError(err instanceof Error ? err.message : "创建失败，请重试");
      } finally {
        setSubmitting(false);
      }
    },
    [form, onSubmit, handleClose],
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
    <Dialog open={open} onClose={handleClose} title="添加物品" maxWidth="max-w-xl">
      {/* Tab 切换 */}
      <div className="flex gap-1 mb-4 p-1 bg-[var(--hs-bg-canvas)] rounded-[var(--hs-radius-control)]">
        <button
          type="button"
          onClick={() => setTab("common")}
          className={[
            "flex-1 py-2 text-sm font-semibold rounded-[var(--hs-radius-element)]",
            "transition-all duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
            "cursor-pointer",
            tab === "common"
              ? "bg-[var(--hs-bg-surface)] text-[var(--hs-accent)] shadow-sm"
              : "text-[var(--hs-text-muted)] hover:text-[var(--hs-text)]",
          ].join(" ")}
        >
          📋 常用物品
        </button>
        <button
          type="button"
          onClick={() => setTab("manual")}
          className={[
            "flex-1 py-2 text-sm font-semibold rounded-[var(--hs-radius-element)]",
            "transition-all duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
            "cursor-pointer",
            tab === "manual"
              ? "bg-[var(--hs-bg-surface)] text-[var(--hs-accent)] shadow-sm"
              : "text-[var(--hs-text-muted)] hover:text-[var(--hs-text)]",
          ].join(" ")}
        >
          ✏️ 手动填写
        </button>
      </div>

      {/* 常用物品库 Tab */}
      {tab === "common" && (
        <CommonItemPicker onSelect={handleCommonSelect} />
      )}

      {/* 手动填写 Tab */}
      {tab === "manual" && (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 物品名称 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="item-name" className="text-xs font-semibold tracking-wide text-[var(--hs-text)]">
              物品名称 *
            </label>
            <input
              id="item-name"
              type="text"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              placeholder="例如：大米"
              required
              className={inputClass}
            />
          </div>

          {/* 分类 + 单位 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-category" className="text-xs font-semibold tracking-wide text-[var(--hs-text)]">
                分类
              </label>
              <select
                id="item-category"
                value={form.category}
                onChange={(e) => setForm((prev) => ({ ...prev, category: e.target.value as Category }))}
                className={selectClass}
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-unit" className="text-xs font-semibold tracking-wide text-[var(--hs-text)]">
                单位
              </label>
              <input
                id="item-unit"
                type="text"
                value={form.unit}
                onChange={(e) => setForm((prev) => ({ ...prev, unit: e.target.value }))}
                placeholder="个/瓶/kg"
                className={inputClass}
              />
            </div>
          </div>

          {/* 初始数量 + 警戒线 */}
          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-quantity" className="text-xs font-semibold tracking-wide text-[var(--hs-text)]">
                初始数量
              </label>
              <input
                id="item-quantity"
                type="number"
                min={0}
                value={form.quantity}
                onChange={(e) => setForm((prev) => ({ ...prev, quantity: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="item-threshold" className="text-xs font-semibold tracking-wide text-[var(--hs-text)]">
                低库存警戒线
              </label>
              <input
                id="item-threshold"
                type="number"
                min={0}
                value={form.alertThreshold}
                onChange={(e) => setForm((prev) => ({ ...prev, alertThreshold: Number(e.target.value) }))}
                className={inputClass}
              />
            </div>
          </div>

          {/* 追踪保质期 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.trackExpiry}
              onChange={(e) => setForm((prev) => ({ ...prev, trackExpiry: e.target.checked }))}
              className="w-4 h-4 rounded-[var(--hs-radius-element)] border-[var(--hs-border)] text-[var(--hs-accent)] focus:ring-[var(--hs-accent)] cursor-pointer accent-[var(--hs-accent)]"
            />
            <span className="text-sm text-[var(--hs-text)]">追踪保质期</span>
          </label>

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
              {submitting ? "创建中..." : "✅ 创建物品"}
            </Button>
          </div>
        </form>
      )}
    </Dialog>
  );
}
