import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * 物品管理 Convex Functions
 * ITEM-001: create / update / archive / list / getById
 */

// ── category 枚举值验证器 ─────────────────────────────────
const categoryValidator = v.union(
  v.literal("food"),
  v.literal("daily"),
  v.literal("medicine"),
  v.literal("appliance"),
  v.literal("other"),
);

// ── items.list ────────────────────────────────────────────
// 按 isArchived 索引查询，支持 category 过滤
export const list = query({
  args: {
    category: v.optional(categoryValidator),
    includeArchived: v.optional(v.boolean()),
  },
  returns: v.array(
    v.object({
      _id: v.id("items"),
      _creationTime: v.number(),
      name: v.string(),
      category: v.string(),
      unit: v.string(),
      quantity: v.number(),
      alertThreshold: v.number(),
      trackExpiry: v.boolean(),
      isArchived: v.boolean(),
      householdId: v.optional(v.string()),
      createdBy: v.id("users"),
      updatedBy: v.id("users"),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    const includeArchived = args.includeArchived ?? false;

    if (args.category !== undefined) {
      // 按 category 索引查询，然后在内存中按 isArchived 筛选
      const items = await ctx.db
        .query("items")
        .withIndex("by_category", (q) => q.eq("category", args.category!))
        .take(200);

      if (includeArchived) {
        return items;
      }
      return items.filter((item) => !item.isArchived);
    }

    // 按 isArchived 索引查询
    if (includeArchived) {
      // 返回所有物品
      const active = await ctx.db
        .query("items")
        .withIndex("by_archived", (q) => q.eq("isArchived", false))
        .take(200);
      const archived = await ctx.db
        .query("items")
        .withIndex("by_archived", (q) => q.eq("isArchived", true))
        .take(200);
      return [...active, ...archived];
    }

    return await ctx.db
      .query("items")
      .withIndex("by_archived", (q) => q.eq("isArchived", false))
      .take(200);
  },
});

// ── items.getById ─────────────────────────────────────────
export const getById = query({
  args: {
    itemId: v.id("items"),
  },
  returns: v.union(
    v.object({
      _id: v.id("items"),
      _creationTime: v.number(),
      name: v.string(),
      category: v.string(),
      unit: v.string(),
      quantity: v.number(),
      alertThreshold: v.number(),
      trackExpiry: v.boolean(),
      isArchived: v.boolean(),
      householdId: v.optional(v.string()),
      createdBy: v.id("users"),
      updatedBy: v.id("users"),
    }),
    v.null(),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    return await ctx.db.get(args.itemId);
  },
});

// ── items.create ──────────────────────────────────────────
// 创建物品并写入初始 inventoryLog
export const create = mutation({
  args: {
    name: v.string(),
    category: categoryValidator,
    unit: v.string(),
    quantity: v.number(),
    alertThreshold: v.number(),
    trackExpiry: v.boolean(),
    group: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    note: v.optional(v.string()),
  },
  returns: v.id("items"),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    // 插入物品
    const itemId = await ctx.db.insert("items", {
      name: args.name,
      category: args.category,
      unit: args.unit,
      quantity: args.quantity,
      alertThreshold: args.alertThreshold,
      trackExpiry: args.trackExpiry,
      isArchived: false,
      createdBy: userId,
      updatedBy: userId,
    });

    // 写入初始 inventoryLog
    await ctx.db.insert("inventoryLogs", {
      itemId,
      previousQuantity: 0,
      newQuantity: args.quantity,
      changeAmount: args.quantity,
      operatorId: userId,
    });

    return itemId;
  },
});

// ── items.update ──────────────────────────────────────────
// 更新物品指定字段
export const update = mutation({
  args: {
    itemId: v.id("items"),
    fields: v.object({
      name: v.optional(v.string()),
      category: v.optional(categoryValidator),
      unit: v.optional(v.string()),
      alertThreshold: v.optional(v.number()),
      trackExpiry: v.optional(v.boolean()),
    }),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    const existing = await ctx.db.get(args.itemId);
    if (existing === null) {
      throw new Error("物品不存在");
    }

    await ctx.db.patch(args.itemId, {
      ...args.fields,
      updatedBy: userId,
    });
    return null;
  },
});

// ── items.archive ─────────────────────────────────────────
// 归档物品（软删除）
export const archive = mutation({
  args: {
    itemId: v.id("items"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    const existing = await ctx.db.get(args.itemId);
    if (existing === null) {
      throw new Error("物品不存在");
    }

    await ctx.db.patch(args.itemId, {
      isArchived: true,
      updatedBy: userId,
    });
    return null;
  },
});
