"use client";

import { useState } from "react";
import type { ReactElement } from "react";
import type { ShoppingListItemDoc } from "@/hooks/useShoppingList";
import { groupByCategory } from "@/hooks/useShoppingList";
import type { Category } from "@/hooks/useShoppingList";
import type { Id } from "@/convex/_generated/dataModel";
import ShoppingListItem from "./ShoppingListItem";

/**
 * ShoppingListByCategory — 按分类分组展示购物清单
 *
 * 设计系统：
 * - 分组间 gap-6
 * - 清单项间 gap-2
 * - 分组标题：emoji + 分类名，Outfit font-semibold
 * - 折叠区域：默认展开，点击分类标题可折叠
 */

interface ShoppingListByCategoryProps {
  items: ShoppingListItemDoc[];
  selectedIds: Set<string>;
  onToggleSelect: (id: Id<"shoppingListItems">) => void;
  onRemove: (id: Id<"shoppingListItems">) => void;
}

export default function ShoppingListByCategory({
  items,
  selectedIds,
  onToggleSelect,
  onRemove,
}: ShoppingListByCategoryProps): ReactElement {
  const groups = groupByCategory(items);
  const [collapsedGroups, setCollapsedGroups] = useState<Set<Category>>(new Set());

  const toggleCollapse = (category: Category) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(category)) {
        next.delete(category);
      } else {
        next.add(category);
      }
      return next;
    });
  };

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <span className="text-5xl mb-4" aria-hidden="true">
          🛒
        </span>
        <h2
          className="text-xl font-bold mb-2"
          style={{
            fontFamily: "'Noto Serif JP', serif",
            color: "var(--hs-text)",
            letterSpacing: "-0.01em",
          }}
        >
          购物清单为空
        </h2>
        <p className="text-sm text-[var(--hs-text-muted)]">
          点击「一键生成」从库存预警自动生成，或手动添加物品
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {groups.map((group) => {
        const isCollapsed = collapsedGroups.has(group.category);
        const groupItemCount = group.items.length;

        return (
          <section key={group.category} aria-label={`${group.meta.label}分类`}>
            {/* 分组标题 */}
            <button
              type="button"
              onClick={() => toggleCollapse(group.category)}
              className="flex items-center gap-2 w-full text-left mb-2 cursor-pointer group"
            >
              <span className="text-lg" aria-hidden="true">
                {group.meta.emoji}
              </span>
              <h3 className="text-sm font-semibold text-[var(--hs-text)] tracking-wide">
                {group.meta.label}
              </h3>
              <span className="text-xs text-[var(--hs-text-muted)]">
                ({groupItemCount})
              </span>
              <span
                className={[
                  "ml-auto text-xs text-[var(--hs-text-muted)]",
                  "transition-transform duration-[var(--hs-duration-micro)]",
                  isCollapsed ? "" : "rotate-90",
                ].join(" ")}
                aria-hidden="true"
              >
                ▶
              </span>
            </button>

            {/* 清单项列表 */}
            {!isCollapsed && (
              <div className="flex flex-col gap-2">
                {group.items.map((item) => (
                  <ShoppingListItem
                    key={item._id}
                    item={item}
                    isSelected={selectedIds.has(item._id)}
                    onToggleSelect={onToggleSelect}
                    onRemove={onRemove}
                  />
                ))}
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
