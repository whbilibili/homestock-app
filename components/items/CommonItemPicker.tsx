"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import {
  getCommonItemsByCategory,
  categoryLabels,
} from "@/convex/seed/commonItems";
import type { CommonItem, Category } from "@/convex/seed/commonItems";

/**
 * CommonItemPicker — 常用物品库快选网格
 *
 * 按分类分组展示 50 个预设物品，点击后回调选中的物品信息。
 * 支持搜索过滤。
 */

interface CommonItemPickerProps {
  onSelect: (item: CommonItem) => void;
}

const allCategories: Category[] = ["food", "daily", "medicine", "appliance", "other"];

export default function CommonItemPicker({
  onSelect,
}: CommonItemPickerProps): ReactElement {
  const [search, setSearch] = useState("");
  const grouped = getCommonItemsByCategory();

  return (
    <div className="flex flex-col gap-4">
      {/* 搜索框 */}
      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="🔍 搜索常用物品..."
        aria-label="搜索常用物品"
        className={[
          "w-full",
          "bg-[var(--hs-bg-surface)]",
          "border border-[var(--hs-border)]",
          "rounded-[var(--hs-radius-control)]",
          "px-3.5 py-2",
          "text-sm text-[var(--hs-text)]",
          "placeholder:text-[var(--hs-text-muted)]",
          "transition-[border-color,box-shadow] duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
          "focus:outline-none focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_var(--hs-accent-subtle)]",
        ].join(" ")}
      />

      {/* 分组展示 */}
      {allCategories.map((cat) => {
        const items = grouped[cat].filter((item) =>
          item.name.includes(search.trim()),
        );
        if (items.length === 0) return null;

        return (
          <div key={cat}>
            <h4 className="text-xs font-medium text-[var(--hs-text-muted)] tracking-wide mb-2">
              {categoryLabels[cat]}
            </h4>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {items.map((item) => (
                <button
                  key={item.name}
                  type="button"
                  onClick={() => onSelect(item)}
                  className={[
                    "flex flex-col items-center gap-1",
                    "p-2.5",
                    "bg-[var(--hs-bg-surface)]",
                    "border border-[var(--hs-border)]",
                    "rounded-[var(--hs-radius-control)]",
                    "transition-all duration-[var(--hs-duration-micro)] ease-[var(--hs-ease)]",
                    "hover:border-[var(--hs-accent)] hover:bg-[var(--hs-accent-subtle)]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--hs-accent)] focus-visible:ring-offset-1",
                    "cursor-pointer",
                  ].join(" ")}
                >
                  <span className="text-xl" aria-hidden="true">
                    {item.emoji}
                  </span>
                  <span className="text-xs text-[var(--hs-text)] text-center leading-tight">
                    {item.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
