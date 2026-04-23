"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import type { ItemDoc } from "@/hooks/useItems";

/**
 * useInventory — 库存管理 Hook
 *
 * 封装 Convex inventory.* 函数调用，是客户端与 Convex 库存交互的唯一入口。
 * 遵循架构约束：Component 层禁止直接 import { api }。
 */

/** 库存日志文档类型 */
export interface InventoryLogDoc {
  _id: Id<"inventoryLogs">;
  _creationTime: number;
  itemId: Id<"items">;
  previousQuantity: number;
  newQuantity: number;
  changeAmount: number;
  operatorId: Id<"users">;
}

/** 库存状态标识 */
export type StockStatus = "ok" | "warn" | "out_of_stock";

/** 计算库存状态 */
export function getStockStatus(
  quantity: number,
  alertThreshold: number,
): StockStatus {
  if (quantity === 0) return "out_of_stock";
  if (quantity <= alertThreshold) return "warn";
  return "ok";
}

/** 库存统计摘要 */
export interface InventoryStats {
  total: number;
  okCount: number;
  warnCount: number;
  outOfStockCount: number;
}

/** 从物品列表计算统计摘要 */
export function computeInventoryStats(items: ItemDoc[]): InventoryStats {
  let okCount = 0;
  let warnCount = 0;
  let outOfStockCount = 0;

  for (const item of items) {
    const status = getStockStatus(item.quantity, item.alertThreshold);
    if (status === "ok") okCount++;
    else if (status === "warn") warnCount++;
    else outOfStockCount++;
  }

  return {
    total: items.length,
    okCount,
    warnCount,
    outOfStockCount,
  };
}

/** 按库存状态排序：out_of_stock → warn → ok */
const statusPriority: Record<StockStatus, number> = {
  out_of_stock: 0,
  warn: 1,
  ok: 2,
};

/** 对物品列表按状态优先级排序（返回新数组） */
export function sortByStockStatus(items: ItemDoc[]): ItemDoc[] {
  return [...items].sort((a, b) => {
    const sa = getStockStatus(a.quantity, a.alertThreshold);
    const sb = getStockStatus(b.quantity, b.alertThreshold);
    return statusPriority[sa] - statusPriority[sb];
  });
}

/** 库存列表 Hook（复用 items.list，前端排序） */
export function useInventoryList(options?: {
  category?: "food" | "daily" | "medicine" | "appliance" | "other";
}): ItemDoc[] | undefined {
  return useQuery(api.items.list, {
    category: options?.category,
    includeArchived: false,
  });
}

/** 库存调整 mutation Hook */
export function useAdjustQuantity(): (args: {
  itemId: Id<"items">;
  change: number;
  reason?: string;
}) => Promise<null> {
  const adjustMutation = useMutation(api.inventory.adjustQuantity);
  return (args) => adjustMutation(args);
}

/** 库存历史 Hook */
export function useInventoryHistory(
  itemId: Id<"items">,
): InventoryLogDoc[] | undefined {
  return useQuery(api.inventory.getHistory, { itemId });
}

/** 撤销最近操作 mutation Hook */
export function useUndoLastChange(): (args: {
  itemId: Id<"items">;
}) => Promise<{ success: boolean }> {
  const undoMutation = useMutation(api.inventory.undoLastChange);
  return (args) => undoMutation(args);
}
