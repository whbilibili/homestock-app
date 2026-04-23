"use client";

import { useMemo, useCallback } from "react";
import type { ReactElement } from "react";
import {
  useInventoryList,
  useAdjustQuantity,
  computeInventoryStats,
} from "@/hooks/useInventory";
import type { Id } from "@/convex/_generated/dataModel";
import InventoryHeader from "@/components/inventory/InventoryHeader";
import InventoryList from "@/components/inventory/InventoryList";

/**
 * 库存总览页 — /inventory
 *
 * INV-002: 物品卡片列表 + 快速增减按钮 + 状态排序 + 库存状态颜色编码
 * 数据层调用通过 useInventory Hook，组件层不直接 import api。
 */
export default function InventoryPage(): ReactElement {
  const items = useInventoryList();
  const adjustQuantity = useAdjustQuantity();

  // 计算统计摘要
  const stats = useMemo(
    () => computeInventoryStats(items ?? []),
    [items],
  );

  // 数量调整回调
  const handleAdjust = useCallback(
    (itemId: string, change: number) => {
      adjustQuantity({
        itemId: itemId as Id<"items">,
        change,
      });
    },
    [adjustQuantity],
  );

  // 加载态
  if (items === undefined) {
    return (
      <div className="py-6">
        <div className="pb-4 mb-4 border-b border-[var(--hs-border)]">
          <div className="h-8 w-32 bg-[var(--hs-border)] rounded-[var(--hs-radius-element)] animate-pulse" />
          <div className="flex gap-3 mt-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-10 w-24 bg-[var(--hs-border)] rounded-[var(--hs-radius-control)] animate-pulse"
              />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-24 bg-[var(--hs-border)] rounded-[var(--hs-radius-component)] animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-6">
      <InventoryHeader stats={stats} />
      <InventoryList items={items} onAdjust={handleAdjust} />
    </div>
  );
}
