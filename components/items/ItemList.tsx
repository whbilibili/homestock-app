"use client";

import type { ReactElement } from "react";
import type { ItemDoc } from "@/hooks/useItems";
import ItemCard from "./ItemCard";

/**
 * ItemList — 物品卡片网格
 *
 * 响应式布局：
 * - 默认 1 列
 * - md (≥768px) 2 列
 * - lg (≥1024px) 3 列
 */

interface ItemListProps {
  items: ItemDoc[];
  onItemClick: (itemId: string) => void;
}

export default function ItemList({ items, onItemClick }: ItemListProps): ReactElement {
  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <span className="text-5xl" aria-hidden="true">📦</span>
        <p
          className="text-lg font-bold"
          style={{ fontFamily: "var(--font-noto-serif-jp), serif" }}
        >
          还没有物品
        </p>
        <p className="text-sm text-[var(--hs-text-muted)]">
          点击右上角「添加物品」开始管理你的家庭库存
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <ItemCard
          key={item._id}
          item={item}
          onClick={() => onItemClick(item._id)}
        />
      ))}
    </div>
  );
}
