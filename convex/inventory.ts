import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * 库存管理 Convex Functions
 * INV-001: adjustQuantity / getHistory / undoLastChange
 */

// ── inventory.adjustQuantity ──────────────────────────────
// 核心 mutation：调整物品库存数量
// 1. 更新 items.quantity（不允许为负数）
// 2. 写入 inventoryLogs
// 3. 当 quantity ≤ alertThreshold 时自动创建 alert（同一物品同一天同一类型去重）
export const adjustQuantity = mutation({
  args: {
    itemId: v.id("items"),
    change: v.number(),
    reason: v.optional(v.string()),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    // 读取当前物品
    const item = await ctx.db.get(args.itemId);
    if (item === null) {
      throw new Error("物品不存在");
    }
    if (item.isArchived) {
      throw new Error("已归档物品不允许调整库存");
    }

    const previousQuantity = item.quantity;
    // quantity 不允许为负数，用 Math.max(0, newQuantity) 兜底
    const newQuantity = Math.max(0, previousQuantity + args.change);

    // 1. 更新 items.quantity
    await ctx.db.patch(args.itemId, {
      quantity: newQuantity,
      updatedBy: userId,
    });

    // 1.5 消耗联动 FEFO：当减少库存且物品追踪保质期时，自动扣减最近过期的批次
    if (args.change < 0 && item.trackExpiry) {
      const consumeQty = Math.abs(args.change);
      const allBatches = await ctx.db
        .query("batches")
        .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
        .take(500);

      // 过滤 active 批次并按 expiryDate 升序（FEFO：最近过期的先消耗）
      const sortedActive = allBatches
        .filter((b) => b.status === "active")
        .sort((a, b) => a.expiryDate - b.expiryDate);

      let remaining = consumeQty;
      for (const batch of sortedActive) {
        if (remaining <= 0) break;
        if (batch.quantity <= remaining) {
          remaining -= batch.quantity;
          await ctx.db.patch(batch._id, { quantity: 0, status: "consumed" as const });
        } else {
          await ctx.db.patch(batch._id, { quantity: batch.quantity - remaining });
          remaining = 0;
        }
      }
    }

    // 2. 写入 inventoryLogs
    await ctx.db.insert("inventoryLogs", {
      itemId: args.itemId,
      previousQuantity,
      newQuantity,
      changeAmount: args.change,
      operatorId: userId,
    });

    // 3. 检查是否需要触发预警
    if (newQuantity <= item.alertThreshold) {
      const alertType = newQuantity === 0 ? "out_of_stock" as const : "low_stock" as const;

      // 同一物品同一类型同一天去重：查询当天已有 alert
      const todayStart = getTodayStartTimestamp();
      const existingAlerts = await ctx.db
        .query("alerts")
        .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
        .take(50);

      const hasTodayAlert = existingAlerts.some(
        (alert) =>
          alert.type === alertType &&
          alert._creationTime >= todayStart,
      );

      if (!hasTodayAlert) {
        await ctx.db.insert("alerts", {
          itemId: args.itemId,
          type: alertType,
          isRead: false,
          isDismissed: false,
          userId,
        });
      }
    }

    return null;
  },
});

// ── inventory.getHistory ──────────────────────────────────
// 按 itemId 查询 inventoryLogs，按 _creationTime 倒序，take(100)
export const getHistory = query({
  args: {
    itemId: v.id("items"),
  },
  returns: v.array(
    v.object({
      _id: v.id("inventoryLogs"),
      _creationTime: v.number(),
      itemId: v.id("items"),
      previousQuantity: v.number(),
      newQuantity: v.number(),
      changeAmount: v.number(),
      operatorId: v.id("users"),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    return await ctx.db
      .query("inventoryLogs")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .order("desc")
      .take(100);
  },
});

// ── inventory.undoLastChange ──────────────────────────────
// 撤销最近一次库存变动（仅限 5 分钟内）
// 1. 查询该物品最近一条 inventoryLog
// 2. 校验是否在 5 分钟内
// 3. 反向 patch items.quantity
// 4. 写入撤销 log（change 取反）
export const undoLastChange = mutation({
  args: {
    itemId: v.id("items"),
  },
  returns: v.object({
    success: v.boolean(),
  }),
  handler: async (ctx, args): Promise<{ success: boolean }> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    const item = await ctx.db.get(args.itemId);
    if (item === null) {
      throw new Error("物品不存在");
    }

    // 查询该物品最近一条 log
    const recentLogs = await ctx.db
      .query("inventoryLogs")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .order("desc")
      .take(1);

    if (recentLogs.length === 0) {
      return { success: false };
    }

    const lastLog = recentLogs[0];
    const now = Date.now();
    const fiveMinutesMs = 5 * 60 * 1000;

    // 校验是否在 5 分钟内
    if (now - lastLog._creationTime > fiveMinutesMs) {
      return { success: false };
    }

    // 反向恢复 quantity，不允许为负数
    const restoredQuantity = Math.max(0, lastLog.previousQuantity);

    // patch items.quantity
    await ctx.db.patch(args.itemId, {
      quantity: restoredQuantity,
      updatedBy: userId,
    });

    // 写入撤销 log（changeAmount 为原操作的反向）
    await ctx.db.insert("inventoryLogs", {
      itemId: args.itemId,
      previousQuantity: item.quantity,
      newQuantity: restoredQuantity,
      changeAmount: -lastLog.changeAmount,
      operatorId: userId,
    });

    return { success: true };
  },
});

// ── 辅助函数 ──────────────────────────────────────────────

/** 获取今天 00:00:00 的 Unix 时间戳（UTC） */
function getTodayStartTimestamp(): number {
  const now = new Date();
  return new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  ).getTime();
}
