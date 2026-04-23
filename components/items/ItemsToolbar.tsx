"use client";

import type { ReactElement } from "react";
import Button from "@/components/ui/Button";
import type { Category } from "@/hooks/useItems";

/**
 * ItemsToolbar — 物品列表工具栏
 *
 * 包含：搜索框 + 分类筛选 + 库存状态筛选 + 添加按钮
 */

export type StockFilter = "all" | "ok" | "low" | "out";

const categoryOptions: { value: string; label: string }[] = [
  { value: "", label: "全部分类" },
  { value: "food", label: "🍽️ 食品" },
  { value: "daily", label: "🧴 日用品" },
  { value: "medicine", label: "💊 药品" },
  { value: "appliance", label: "💡 家电" },
  { value: "other", label: "📦 其他" },
];

const stockOptions: { value: StockFilter; label: string }[] = [
  { value: "all", label: "全部状态" },
  { value: "ok", label: "✅ 充足" },
  { value: "low", label: "⚠️ 不足" },
  { value: "out", label: "🔴 缺货" },
];

interface ItemsToolbarProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categoryFilter: Category | "";
  onCategoryChange: (category: Category | "") => void;
  stockFilter: StockFilter;
  onStockFilterChange: (filter: StockFilter) => void;
  onAddClick: () => void;
  itemCount: number;
}

export default function ItemsToolbar({
  searchQuery,
  onSearchChange,
  categoryFilter,
  onCategoryChange,
  stockFilter,
  onStockFilterChange,
  onAddClick,
  itemCount,
}: ItemsToolbarProps): ReactElement {
  return (
    <div className="flex flex-col gap-3">
      {/* 第一行：标题 + 添加按钮 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[var(--hs-text)]">
            🏷️ 物品管理
          </h1>
          <p className="text-xs text-[var(--hs-text-muted)] mt-0.5">
            共 {itemCount} 件物品
          </p>
        </div>
        <Button variant="primary" size="md" onClick={onAddClick}>
          ➕ 添加物品
        </Button>
      </div>

      {/* 第二行：搜索 + 筛选 */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* 搜索框 */}
        <div className="flex-1">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="🔍 搜索物品名称..."
            aria-label="搜索物品"
            className={[
              "w-full",
              "bg-[var(--hs-bg-surface)]",
              "border border-[var(--hs-border)]",
              "rounded-[var(--hs-radius-control)]",
              "px-3.5 py-2.5",
              "text-sm text-[var(--hs-text)]",
              "placeholder:text-[var(--hs-text-muted)]",
              "transition-[border-color,box-shadow] duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
              "focus:outline-none focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
            ].join(" ")}
          />
        </div>

        {/* 分类筛选 */}
        <select
          value={categoryFilter}
          onChange={(e) => onCategoryChange(e.target.value as Category | "")}
          aria-label="按分类筛选"
          className={[
            "bg-[var(--hs-bg-surface)]",
            "border border-[var(--hs-border)]",
            "rounded-[var(--hs-radius-element)]",
            "px-3 py-2.5",
            "text-sm text-[var(--hs-text)]",
            "transition-[border-color,box-shadow] duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
            "focus:outline-none focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
            "cursor-pointer",
          ].join(" ")}
        >
          {categoryOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* 库存状态筛选 */}
        <select
          value={stockFilter}
          onChange={(e) => onStockFilterChange(e.target.value as StockFilter)}
          aria-label="按库存状态筛选"
          className={[
            "bg-[var(--hs-bg-surface)]",
            "border border-[var(--hs-border)]",
            "rounded-[var(--hs-radius-element)]",
            "px-3 py-2.5",
            "text-sm text-[var(--hs-text)]",
            "transition-[border-color,box-shadow] duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
            "focus:outline-none focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_rgba(16,185,129,0.15)]",
            "cursor-pointer",
          ].join(" ")}
        >
          {stockOptions.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
