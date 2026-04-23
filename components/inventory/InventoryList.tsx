"use client";

import { useMemo } from "react";
import type { ReactElement } from "react";
import type { ItemDoc } from "@/hooks/useItems";
import { sortByStockStatus } from "@/hooks/useInventory";
import InventoryCard from "./InventoryCard";

/**
 * InventoryList — 库存物品列表
 *
 * 设计系统：
 * - 响应式网格：grid-cols-1 (mobile) / grid-cols-2 (md) / grid-cols-3 (lg)
 * - gap: 16px
 * - 按库存状态排序：缺货(红) → 不足(黄) → 充足(绿)
 * - 空态提示居中展示
 */

interface InventoryListProps {
  items: ItemDoc[];
  /** 数量变化回调（向上传递到 Page 层） */
  onAdjust: (itemId: string, change: number) => void;
}

export default function InventoryList({
  items,
  onAdjust,
}: InventoryListProps): ReactElement {
  // 按状态优先级排序
  const sortedItems = useMemo(() => sortByStockStatus(items), [items]);

  if (sortedItems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <span className="text-4xl mb-3" aria-hidden="true">
          📦
        </span>
        <p className="text-base text-[var(--hs-text-muted)]">
          暂无库存物品
        </p>
        <p className="text-sm text-[var(--hs-text-muted)] mt-1">
          前往「物品管理」添加物品后即可在此查看
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {sortedItems.map((item) => (
        <InventoryCard key={item._id} item={item} onAdjust={onAdjust} />
      ))}
    </div>
  );
}
