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
      <div className="flex items-center justify-center py-16">
        <div className="w-8 h-8 border-2 border-[var(--hs-border)] border-t-[var(--hs-accent)] rounded-full" style={{ animation: "spin 0.8s linear infinite" }} />
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
