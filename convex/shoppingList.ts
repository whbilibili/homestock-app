import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * 购物清单 Convex Functions
 * SHOP-001: list / add / remove / updateQuantity / completePurchase / generateFromAlerts
 *
 * Schema 依赖：shoppingListItems / items / inventoryLogs / batches
 */

// ── shoppingList.list ──────────────────────────────────────
// 按 status 查询购物清单项，join items 获取名称/分类/单位
// 默认查询 pending 状态
export const list = query({
  args: {
    status: v.optional(v.string()),
  },
  returns: v.array(
    v.object({
      _id: v.id("shoppingListItems"),
      _creationTime: v.number(),
      itemId: v.optional(v.id("items")),
      tempItemName: v.optional(v.string()),
      plannedQuantity: v.number(),
      actualQuantity: v.optional(v.number()),
      price: v.optional(v.number()),
      source: v.union(v.literal("manual"), v.literal("auto_alert")),
      status: v.union(
        v.literal("pending"),
        v.literal("purchased"),
        v.literal("cancelled"),
      ),
      addedBy: v.id("users"),
      // join fields
      itemName: v.string(),
      category: v.optional(v.string()),
      unit: v.optional(v.string()),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    // 确定查询状态，默认 pending
    const targetStatus = (args.status ?? "pending") as "pending" | "purchased" | "cancelled";

    // 使用 by_status 索引查询
    const listItems = await ctx.db
      .query("shoppingListItems")
      .withIndex("by_status", (q) => q.eq("status", targetStatus))
      .order("desc")
      .take(200);

    // 过滤当前用户的清单项
    const userItems = listItems.filter((item) => item.addedBy === userId);

    // 逐个 join items 表获取名称/分类/单位
    const result: {
      _id: (typeof userItems)[number]["_id"];
      _creationTime: number;
      itemId: (typeof userItems)[number]["itemId"];
      tempItemName: (typeof userItems)[number]["tempItemName"];
      plannedQuantity: number;
      actualQuantity: (typeof userItems)[number]["actualQuantity"];
      price: (typeof userItems)[number]["price"];
      source: (typeof userItems)[number]["source"];
      status: (typeof userItems)[number]["status"];
      addedBy: (typeof userItems)[number]["addedBy"];
      itemName: string;
      category?: string;
      unit?: string;
    }[] = [];

    for (const listItem of userItems) {
      let itemName = listItem.tempItemName ?? "未命名物品";
      let category: string | undefined = undefined;
      let unit: string | undefined = undefined;

      if (listItem.itemId !== undefined) {
        const item = await ctx.db.get(listItem.itemId);
        if (item !== null) {
          itemName = item.name;
          category = item.category;
          unit = item.unit;
        } else {
          itemName = "（已删除的物品）";
        }
      }

      result.push({
        _id: listItem._id,
        _creationTime: listItem._creationTime,
        itemId: listItem.itemId,
        tempItemName: listItem.tempItemName,
        plannedQuantity: listItem.plannedQuantity,
        actualQuantity: listItem.actualQuantity,
        price: listItem.price,
        source: listItem.source,
        status: listItem.status,
        addedBy: listItem.addedBy,
        itemName,
        category,
        unit,
      });
    }

    return result;
  },
});

// ── shoppingList.add ───────────────────────────────────────
// 手动添加购物清单项：关联物品（itemId）或临时物品（tempItemName）
export const add = mutation({
  args: {
    itemId: v.optional(v.id("items")),
    tempItemName: v.optional(v.string()),
    plannedQuantity: v.number(),
  },
  returns: v.object({
    id: v.id("shoppingListItems"),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    // 至少需要 itemId 或 tempItemName 之一
    if (args.itemId === undefined && (args.tempItemName === undefined || args.tempItemName.trim() === "")) {
      throw new Error("请指定关联物品或填写临时物品名称");
    }

    // 数量必须大于 0
    if (args.plannedQuantity <= 0) {
      throw new Error("计划购买数量必须大于 0");
    }

    // 如果指定了 itemId，校验物品存在
    if (args.itemId !== undefined) {
      const item = await ctx.db.get(args.itemId);
      if (item === null) {
        throw new Error("关联物品不存在");
      }
    }

    const id = await ctx.db.insert("shoppingListItems", {
      itemId: args.itemId,
      tempItemName: args.tempItemName,
      plannedQuantity: args.plannedQuantity,
      source: "manual",
      status: "pending",
      addedBy: userId,
    });

    return { id };
  },
});

// ── shoppingList.remove ────────────────────────────────────
// 删除购物清单项（物理删除）
export const remove = mutation({
  args: {
    id: v.id("shoppingListItems"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    const listItem = await ctx.db.get(args.id);
    if (listItem === null) {
      throw new Error("清单项不存在");
    }
    if (listItem.addedBy !== userId) {
      throw new Error("无权操作此清单项");
    }

    await ctx.db.delete(args.id);

    return null;
  },
});

// ── shoppingList.updateQuantity ────────────────────────────
// 修改计划购买数量
export const updateQuantity = mutation({
  args: {
    id: v.id("shoppingListItems"),
    plannedQuantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    if (args.plannedQuantity <= 0) {
      throw new Error("计划购买数量必须大于 0");
    }

    const listItem = await ctx.db.get(args.id);
    if (listItem === null) {
      throw new Error("清单项不存在");
    }
    if (listItem.addedBy !== userId) {
      throw new Error("无权操作此清单项");
    }

    await ctx.db.patch(args.id, {
      plannedQuantity: args.plannedQuantity,
    });

    return null;
  },
});

// ── shoppingList.completePurchase ──────────────────────────
// 核心 mutation：完成购买入库
// 1. patch shoppingListItems status → 'purchased'
// 2. patch items.quantity += actualQuantity（仅关联物品）
// 3. insert inventoryLog（仅关联物品）
// 4. 若 trackExpiry && expiryDate → insert batches(status: 'active')
export const completePurchase = mutation({
  args: {
    id: v.id("shoppingListItems"),
    actualQuantity: v.number(),
    price: v.optional(v.number()),
    expiryDate: v.optional(v.number()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    if (args.actualQuantity <= 0) {
      throw new Error("实际购买数量必须大于 0");
    }

    const listItem = await ctx.db.get(args.id);
    if (listItem === null) {
      throw new Error("清单项不存在");
    }
    if (listItem.addedBy !== userId) {
      throw new Error("无权操作此清单项");
    }
    if (listItem.status !== "pending") {
      throw new Error("该清单项已处理，不可重复操作");
    }

    // 1. 更新清单项状态
    await ctx.db.patch(args.id, {
      status: "purchased",
      actualQuantity: args.actualQuantity,
      price: args.price,
    });

    // 2-4. 仅关联物品才进行入库操作
    if (listItem.itemId !== undefined) {
      const item = await ctx.db.get(listItem.itemId);
      if (item !== null) {
        const previousQuantity = item.quantity;
        const newQuantity = previousQuantity + args.actualQuantity;

        // 2. 更新库存
        await ctx.db.patch(listItem.itemId, {
          quantity: newQuantity,
          updatedBy: userId,
        });

        // 3. 写入库存变动日志
        await ctx.db.insert("inventoryLogs", {
          itemId: listItem.itemId,
          previousQuantity,
          newQuantity,
          changeAmount: args.actualQuantity,
          operatorId: userId,
        });

        // 4. 若物品追踪保质期且提供了 expiryDate，创建批次
        if (item.trackExpiry && args.expiryDate !== undefined) {
          await ctx.db.insert("batches", {
            itemId: listItem.itemId,
            quantity: args.actualQuantity,
            expiryDate: args.expiryDate,
            status: "active",
          });
        }
      }
    }

    return null;
  },
});

// ── shoppingList.generateFromAlerts ────────────────────────
// 批量将所有 warning / out_of_stock 物品加入购物清单
// 排除已在 pending 状态中的物品
export const generateFromAlerts = mutation({
  args: {},
  returns: v.object({
    addedCount: v.number(),
  }),
  handler: async (ctx): Promise<{ addedCount: number }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    // 查询当前用户所有未归档物品，筛选出库存不足的
    const allItems = await ctx.db
      .query("items")
      .withIndex("by_archived", (q) => q.eq("isArchived", false))
      .take(500);

    // 过滤当前用户的且库存 ≤ alertThreshold 的物品
    const lowStockItems = allItems.filter(
      (item) => item.createdBy === userId && item.quantity <= item.alertThreshold,
    );

    if (lowStockItems.length === 0) {
      return { addedCount: 0 };
    }

    // 查询当前 pending 状态的购物清单项，获取已在清单中的 itemId 集合
    const pendingItems = await ctx.db
      .query("shoppingListItems")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .take(500);

    const pendingItemIds = new Set(
      pendingItems
        .filter((p) => p.addedBy === userId && p.itemId !== undefined)
        .map((p) => p.itemId as string),
    );

    let addedCount = 0;

    for (const item of lowStockItems) {
      // 跳过已在 pending 清单中的
      if (pendingItemIds.has(item._id as string)) {
        continue;
      }

      // 计算补购数量：alertThreshold - 当前库存，至少为 1
      const plannedQuantity = Math.max(1, item.alertThreshold - item.quantity);

      await ctx.db.insert("shoppingListItems", {
        itemId: item._id,
        plannedQuantity,
        source: "auto_alert",
        status: "pending",
        addedBy: userId,
      });

      addedCount += 1;
    }

    return { addedCount };
  },
});
