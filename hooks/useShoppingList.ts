"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * useShoppingList — 购物清单 Hook
 *
 * 封装 Convex shoppingList.* 函数调用，是客户端与 Convex 购物清单交互的唯一入口。
 * 遵循架构约束：Component 层禁止直接 import { api }。
 */

/** 购物清单项来源 */
export type ShoppingSource = "manual" | "auto_alert";

/** 购物清单项状态 */
export type ShoppingStatus = "pending" | "purchased" | "cancelled";

/** 分类类型（与 items.category 一致） */
export type Category = "food" | "daily" | "medicine" | "appliance" | "other";

/** 购物清单项文档（从 shoppingList.list 返回，已 join items） */
export interface ShoppingListItemDoc {
  _id: Id<"shoppingListItems">;
  _creationTime: number;
  itemId?: Id<"items">;
  tempItemName?: string;
  plannedQuantity: number;
  actualQuantity?: number;
  price?: number;
  source: ShoppingSource;
  status: ShoppingStatus;
  addedBy: Id<"users">;
  /** join 字段 */
  itemName: string;
  category?: string;
  unit?: string;
}

/** 来源元信息（标签 + 颜色 token） */
export interface SourceMeta {
  label: string;
  colorClass: string;
  bgClass: string;
}

/** 来源到元信息映射 —— 使用 --hs-* 语义 token */
export const sourceMeta: Record<ShoppingSource, SourceMeta> = {
  auto_alert: {
    label: "自动生成",
    colorClass: "text-[var(--hs-accent-dark)]",
    bgClass: "bg-[var(--hs-accent-subtle)]",
  },
  manual: {
    label: "手动添加",
    colorClass: "text-[var(--hs-text-muted)]",
    bgClass: "bg-[var(--hs-bg-canvas)]",
  },
};

/** 分类元信息（emoji + 标签） */
export const categoryMeta: Record<Category, { emoji: string; label: string }> = {
  food: { emoji: "🍽️", label: "食品" },
  daily: { emoji: "🧴", label: "日用品" },
  medicine: { emoji: "💊", label: "药品" },
  appliance: { emoji: "💡", label: "家电" },
  other: { emoji: "📦", label: "其他" },
};

/** 分类排序顺序 */
const CATEGORY_ORDER: Category[] = ["food", "daily", "medicine", "appliance", "other"];

/** 购物清单列表 Hook（默认查询 pending 状态） */
export function useShoppingList(status?: ShoppingStatus): ShoppingListItemDoc[] | undefined {
  return useQuery(api.shoppingList.list, { status }) as ShoppingListItemDoc[] | undefined;
}

/** 手动添加购物清单项 */
export function useAddShoppingItem(): (args: {
  itemId?: Id<"items">;
  tempItemName?: string;
  plannedQuantity: number;
}) => Promise<{ id: Id<"shoppingListItems"> }> {
  const addMutation = useMutation(api.shoppingList.add);
  return (args) => addMutation(args);
}

/** 删除购物清单项 */
export function useRemoveShoppingItem(): (id: Id<"shoppingListItems">) => Promise<null> {
  const removeMutation = useMutation(api.shoppingList.remove);
  return (id) => removeMutation({ id });
}

/** 修改计划购买数量 */
export function useUpdateShoppingQuantity(): (
  id: Id<"shoppingListItems">,
  plannedQuantity: number,
) => Promise<null> {
  const updateMutation = useMutation(api.shoppingList.updateQuantity);
  return (id, plannedQuantity) => updateMutation({ id, plannedQuantity });
}

/** 完成购买入库 */
export function useCompletePurchase(): (args: {
  id: Id<"shoppingListItems">;
  actualQuantity: number;
  price?: number;
  expiryDate?: number;
}) => Promise<null> {
  const completeMutation = useMutation(api.shoppingList.completePurchase);
  return (args) => completeMutation(args);
}

/** 一键从预警生成购物清单 */
export function useGenerateFromAlerts(): () => Promise<{ addedCount: number }> {
  const generateMutation = useMutation(api.shoppingList.generateFromAlerts);
  return () => generateMutation({});
}

/**
 * 工具函数：按分类分组购物清单项
 * 返回值按预定义顺序排列，过滤掉空分组
 */
export function groupByCategory(
  items: ShoppingListItemDoc[],
): { category: Category; meta: { emoji: string; label: string }; items: ShoppingListItemDoc[] }[] {
  const map = new Map<string, ShoppingListItemDoc[]>();

  for (const item of items) {
    const cat = item.category ?? "other";
    const existing = map.get(cat);
    if (existing) {
      existing.push(item);
    } else {
      map.set(cat, [item]);
    }
  }

  return CATEGORY_ORDER
    .filter((cat) => map.has(cat))
    .map((cat) => ({
      category: cat,
      meta: categoryMeta[cat],
      items: map.get(cat)!,
    }));
}
