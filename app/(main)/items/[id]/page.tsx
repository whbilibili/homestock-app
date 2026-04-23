"use client";

import { useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import { useItemById, useUpdateItem, useArchiveItem } from "@/hooks/useItems";
import { categoryLabels } from "@/convex/seed/commonItems";
import type { Category } from "@/convex/seed/commonItems";
import type { Id } from "@/convex/_generated/dataModel";
import type { UpdateItemFields } from "@/hooks/useItems";

/**
 * 物品详情/编辑页 — /items/[id]
 *
 * ITEM-002: 查看物品详情 + 编辑所有字段 + 归档
 */

const categoryOptions: { value: Category; label: string }[] = [
  { value: "food", label: "🍽️ 食品" },
  { value: "daily", label: "🧴 日用品" },
  { value: "medicine", label: "💊 药品" },
  { value: "appliance", label: "💡 家电" },
  { value: "other", label: "📦 其他" },
];

const categoryEmoji: Record<Category, string> = {
  food: "🍽️",
  daily: "🧴",
  medicine: "💊",
  appliance: "💡",
  other: "📦",
};

export default function ItemDetailPage(): React.ReactElement {
  const params = useParams();
  const router = useRouter();
  const itemId = params.id as Id<"items">;

  const item = useItemById(itemId);
  const updateItem = useUpdateItem();
  const archiveItem = useArchiveItem();

  // ── 编辑状态 ──
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<UpdateItemFields>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [archiving, setArchiving] = useState(false);

  // 进入编辑模式时，从 item 快照初始化表单
  const startEditing = useCallback(() => {
    if (item) {
      setEditForm({
        name: item.name,
        category: item.category as Category,
        unit: item.unit,
        alertThreshold: item.alertThreshold,
        trackExpiry: item.trackExpiry,
      });
    }
    setIsEditing(true);
  }, [item]);

  const handleSave = useCallback(async () => {
    setError("");
    if (editForm.name !== undefined && !editForm.name.trim()) {
      setError("物品名称不能为空");
      return;
    }
    if (editForm.alertThreshold !== undefined && editForm.alertThreshold < 0) {
      setError("警戒线不能为负数");
      return;
    }

    setSaving(true);
    try {
      await updateItem(itemId, editForm);
      setIsEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "保存失败，请重试");
    } finally {
      setSaving(false);
    }
  }, [itemId, editForm, updateItem]);

  const handleArchive = useCallback(async () => {
    setArchiving(true);
    try {
      await archiveItem(itemId);
      router.push("/items");
    } catch (err) {
      setError(err instanceof Error ? err.message : "归档失败，请重试");
      setArchiving(false);
    }
  }, [itemId, archiveItem, router]);

  const inputClass = [
    "w-full",
    "bg-[var(--hs-bg-surface)]",
    "border border-[var(--hs-border)]",
    "rounded-[var(--hs-radius-element)]",
    "px-3.5 py-2.5",
    "text-sm text-[var(--hs-text)]",
    "transition-[border-color,box-shadow] duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
    "focus:outline-none focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--hs-bg-canvas)]",
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
    "disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-[var(--hs-bg-canvas)]",
    "cursor-pointer",
  ].join(" ");

  // ── 加载态 ──
  if (item === undefined) {
    return (
      <div className="py-6 max-w-2xl mx-auto">
        <div className="h-8 w-48 bg-[var(--hs-bg-surface)] border border-[var(--hs-border)] rounded-[var(--hs-radius-element)] animate-pulse mb-6" />
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={`skeleton-${i}`}
              className="h-12 bg-[var(--hs-bg-surface)] border border-[var(--hs-border)] rounded-[var(--hs-radius-element)] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  // ── 物品不存在 ──
  if (item === null) {
    return (
      <div className="py-6 max-w-2xl mx-auto text-center">
        <span className="text-5xl" aria-hidden="true">🔍</span>
        <p className="text-lg font-bold text-[var(--hs-text)] mt-3">物品不存在</p>
        <p className="text-sm text-[var(--hs-text-muted)] mt-1">该物品可能已被删除</p>
        <Button variant="secondary" size="md" onClick={() => router.push("/items")} className="mt-4">
          ← 返回物品列表
        </Button>
      </div>
    );
  }

  const emoji = categoryEmoji[item.category as Category] ?? "📦";
  const catLabel = categoryLabels[item.category as Category] ?? item.category;

  // ── 库存状态 ──
  const stockStatus = item.quantity === 0
    ? { label: "缺货", colorClass: "text-[var(--hs-error)]", bgClass: "bg-[var(--hs-error-bg)]" }
    : item.quantity <= item.alertThreshold
      ? { label: "库存不足", colorClass: "text-[var(--hs-warn)]", bgClass: "bg-[var(--hs-warn-bg)]" }
      : { label: "充足", colorClass: "text-[var(--hs-ok)]", bgClass: "bg-[var(--hs-ok-bg)]" };

  return (
    <div className="py-6 max-w-2xl mx-auto">
      {/* 顶部导航 */}
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() => router.push("/items")}
          className="text-sm text-[var(--hs-text-muted)] hover:text-[var(--hs-accent)] transition-colors duration-[var(--hs-duration-micro)] cursor-pointer"
        >
          ← 返回物品列表
        </button>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  setIsEditing(false);
                  setError("");
                  // 重置表单
                  setEditForm({
                    name: item.name,
                    category: item.category as Category,
                    unit: item.unit,
                    alertThreshold: item.alertThreshold,
                    trackExpiry: item.trackExpiry,
                  });
                }}
              >
                取消
              </Button>
              <Button variant="primary" size="sm" onClick={handleSave} disabled={saving}>
                {saving ? "保存中..." : "✅ 保存"}
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" size="sm" onClick={startEditing}>
                ✏️ 编辑
              </Button>
              <Button variant="danger" size="sm" onClick={handleArchive} disabled={archiving}>
                {archiving ? "归档中..." : "🗑️ 归档"}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* 物品信息卡片 */}
      <div className="bg-[var(--hs-bg-surface)] border border-[var(--hs-border)] rounded-[var(--hs-radius-component)] p-6">
        {/* 标题区 */}
        <div className="flex items-center gap-3 mb-6">
          <span className="text-3xl" aria-hidden="true">{emoji}</span>
          <div className="flex-1">
            {isEditing ? (
              <input
                type="text"
                value={editForm.name ?? ""}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className={`${inputClass} text-xl font-bold`}
              />
            ) : (
              <h1 className="text-xl font-bold text-[var(--hs-text)]">{item.name}</h1>
            )}
            <p className="text-xs text-[var(--hs-text-muted)] mt-0.5">{catLabel}</p>
          </div>
          <span
            className={[
              "text-[10px] font-extrabold tracking-widest uppercase",
              "px-2.5 py-1",
              "rounded-[var(--hs-radius-pill)]",
              stockStatus.colorClass,
              stockStatus.bgClass,
            ].join(" ")}
          >
            {stockStatus.label}
          </span>
        </div>

        {/* 库存数量（只读，数量调整在 INV-002 实现） */}
        <div className="mb-6 p-4 bg-[var(--hs-bg-canvas)] rounded-[var(--hs-radius-control)]">
          <p className="text-xs font-semibold text-[var(--hs-text-muted)] mb-1">当前库存</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[var(--hs-text)]">{item.quantity}</span>
            <span className="text-sm text-[var(--hs-text-muted)]">{item.unit}</span>
          </div>
        </div>

        {/* 编辑表单 */}
        <div className="space-y-4">
          {/* 分类 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-category" className="text-xs font-semibold tracking-wide text-[var(--hs-text)]">
              分类
            </label>
            <select
              id="edit-category"
              value={isEditing ? (editForm.category ?? item.category) : item.category}
              onChange={(e) => setEditForm((prev) => ({ ...prev, category: e.target.value as Category }))}
              disabled={!isEditing}
              className={selectClass}
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* 单位 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-unit" className="text-xs font-semibold tracking-wide text-[var(--hs-text)]">
              单位
            </label>
            <input
              id="edit-unit"
              type="text"
              value={isEditing ? (editForm.unit ?? item.unit) : item.unit}
              onChange={(e) => setEditForm((prev) => ({ ...prev, unit: e.target.value }))}
              disabled={!isEditing}
              className={inputClass}
            />
          </div>

          {/* 低库存警戒线 */}
          <div className="flex flex-col gap-1.5">
            <label htmlFor="edit-threshold" className="text-xs font-semibold tracking-wide text-[var(--hs-text)]">
              低库存警戒线
            </label>
            <input
              id="edit-threshold"
              type="number"
              min={0}
              value={isEditing ? (editForm.alertThreshold ?? item.alertThreshold) : item.alertThreshold}
              onChange={(e) => setEditForm((prev) => ({ ...prev, alertThreshold: Number(e.target.value) }))}
              disabled={!isEditing}
              className={inputClass}
            />
          </div>

          {/* 追踪保质期 */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isEditing ? (editForm.trackExpiry ?? item.trackExpiry) : item.trackExpiry}
              onChange={(e) => setEditForm((prev) => ({ ...prev, trackExpiry: e.target.checked }))}
              disabled={!isEditing}
              className="w-4 h-4 rounded-[var(--hs-radius-element)] border-[var(--hs-border)] text-[var(--hs-accent)] focus:ring-[var(--hs-accent)] cursor-pointer accent-[var(--hs-accent)]"
            />
            <span className="text-sm text-[var(--hs-text)]">追踪保质期</span>
          </label>
        </div>

        {/* 错误提示 */}
        {error && (
          <p className="mt-4 text-sm text-[var(--hs-error)] bg-[var(--hs-error-bg)] px-3 py-2 rounded-[var(--hs-radius-element)]">
            ⚠️ {error}
          </p>
        )}

        {/* 元信息 */}
        <div className="mt-6 pt-4 border-t border-[var(--hs-border)]">
          <p className="text-xs text-[var(--hs-text-muted)]">
            创建时间：{new Date(item._creationTime).toLocaleString("zh-CN")}
          </p>
        </div>
      </div>
    </div>
  );
}
