"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * useItems — 物品管理 Hook
 *
 * 封装 Convex items.* 函数调用，是客户端与 Convex 交互的唯一入口。
 * 遵循架构约束：Component 层禁止直接 import { api }。
 */

/** Category 类型（与 convex/seed/commonItems.ts 保持一致） */
export type Category = "food" | "daily" | "medicine" | "appliance" | "other";

/** 物品文档类型（从 Convex 返回） */
export interface ItemDoc {
  _id: Id<"items">;
  _creationTime: number;
  name: string;
  category: string;
  unit: string;
  quantity: number;
  alertThreshold: number;
  trackExpiry: boolean;
  isArchived: boolean;
  householdId?: string;
  createdBy: Id<"users">;
  updatedBy: Id<"users">;
}

/** 创建物品参数 */
export interface CreateItemArgs {
  name: string;
  category: Category;
  unit: string;
  quantity: number;
  alertThreshold: number;
  trackExpiry: boolean;
}

/** 更新物品参数 */
export interface UpdateItemFields {
  name?: string;
  category?: Category;
  unit?: string;
  alertThreshold?: number;
  trackExpiry?: boolean;
}

/** 物品列表 Hook */
export function useItemList(options?: {
  category?: Category;
  includeArchived?: boolean;
}): ItemDoc[] | undefined {
  return useQuery(api.items.list, {
    category: options?.category,
    includeArchived: options?.includeArchived,
  });
}

/** 单个物品 Hook */
export function useItemById(itemId: Id<"items">): ItemDoc | null | undefined {
  return useQuery(api.items.getById, { itemId });
}

/** 物品创建 mutation */
export function useCreateItem(): (args: CreateItemArgs) => Promise<Id<"items">> {
  const createMutation = useMutation(api.items.create);
  return (args: CreateItemArgs) => createMutation(args);
}

/** 物品更新 mutation */
export function useUpdateItem(): (
  itemId: Id<"items">,
  fields: UpdateItemFields,
) => Promise<null> {
  const updateMutation = useMutation(api.items.update);
  return (itemId: Id<"items">, fields: UpdateItemFields) =>
    updateMutation({ itemId, fields });
}

/** 物品归档 mutation */
export function useArchiveItem(): (itemId: Id<"items">) => Promise<null> {
  const archiveMutation = useMutation(api.items.archive);
  return (itemId: Id<"items">) => archiveMutation({ itemId });
}
