import { v } from "convex/values";
import {
  query,
  mutation,
  internalMutation,
  MutationCtx,
} from "./_generated/server";
import { internal } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * 批次管理 Convex Functions
 * EXPIRY-001: listByItem / consume / checkExpiry(internal)
 *
 * batches 的创建逻辑在 SHOP-001 的 completePurchase 中实现。
 * 本模块实现读取、消耗和定时过期检查。
 */

// ── batches.listByItem ──────────────────────────────────────
// 按 itemId 查询批次列表，按 expiryDate 升序排列（最近过期的排前面）
export const listByItem = query({
  args: {
    itemId: v.id("items"),
  },
  returns: v.array(
    v.object({
      _id: v.id("batches"),
      _creationTime: v.number(),
      itemId: v.id("items"),
      quantity: v.number(),
      expiryDate: v.number(),
      status: v.union(
        v.literal("active"),
        v.literal("consumed"),
        v.literal("expired"),
        v.literal("disposed"),
      ),
    }),
  ),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    // 使用 by_item 索引查询
    // Convex 索引 by_item 仅包含 itemId，无法同时按 expiryDate 排序
    // 因此先取所有批次，再在内存中按 expiryDate 升序排列
    const batches = await ctx.db
      .query("batches")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .take(500);

    // 按 expiryDate 升序排列（FEFO：最近过期的排前面）
    return batches.sort((a, b) => a.expiryDate - b.expiryDate);
  },
});

// ── batches.consume ─────────────────────────────────────────
// 按 FEFO 原则从最近过期的 active 批次开始扣减数量
// 逐个批次扣减，直到满足消耗数量
export const consume = mutation({
  args: {
    itemId: v.id("items"),
    quantity: v.number(),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    if (args.quantity <= 0) {
      throw new Error("消耗数量必须大于 0");
    }

    // 查询该物品所有批次（使用 by_item 索引）
    const allBatches = await ctx.db
      .query("batches")
      .withIndex("by_item", (q) => q.eq("itemId", args.itemId))
      .take(500);

    // 过滤 active 批次并按 expiryDate 升序（FEFO）
    const sortedActive = allBatches
      .filter((b) => b.status === "active")
      .sort((a, b) => a.expiryDate - b.expiryDate);

    let remaining = args.quantity;

    for (const batch of sortedActive) {
      if (remaining <= 0) break;

      if (batch.quantity <= remaining) {
        // 整个批次耗尽
        remaining -= batch.quantity;
        await ctx.db.patch(batch._id, {
          quantity: 0,
          status: "consumed",
        });
      } else {
        // 部分扣减
        await ctx.db.patch(batch._id, {
          quantity: batch.quantity - remaining,
        });
        remaining = 0;
      }
    }

    return null;
  },
});

// ── batches.listExpiring ────────────────────────────────────
// /expiry 页面使用：查询所有需要关注的批次（已过期 + 7 天内临期）
// join items 获取 itemName，按紧急程度排序（过期 → 3天内 → 7天内）
export const listExpiring = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("batches"),
      _creationTime: v.number(),
      itemId: v.id("items"),
      quantity: v.number(),
      expiryDate: v.number(),
      status: v.union(
        v.literal("active"),
        v.literal("consumed"),
        v.literal("expired"),
        v.literal("disposed"),
      ),
      itemName: v.string(),
      itemUnit: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    // 1. 查询所有 expired 状态批次（数量 > 0 的，即未被清理的）
    const expiredBatches = await ctx.db
      .query("batches")
      .withIndex("by_status", (q) => q.eq("status", "expired"))
      .take(200);

    // 2. 查询所有 active 批次，在内存中过滤 7 天内到期的
    const activeBatches = await ctx.db
      .query("batches")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(500);

    const expiringSoonBatches = activeBatches.filter(
      (b) => b.expiryDate <= now + sevenDaysMs,
    );

    // 3. 合并两组
    const allBatches = [...expiredBatches, ...expiringSoonBatches];

    // 4. join items 获取名称和单位
    const results: {
      _id: Id<"batches">;
      _creationTime: number;
      itemId: Id<"items">;
      quantity: number;
      expiryDate: number;
      status: "active" | "consumed" | "expired" | "disposed";
      itemName: string;
      itemUnit: string;
    }[] = [];

    for (const batch of allBatches) {
      const item = await ctx.db.get(batch.itemId);
      if (item !== null && !item.isArchived) {
        results.push({
          _id: batch._id,
          _creationTime: batch._creationTime,
          itemId: batch.itemId,
          quantity: batch.quantity,
          expiryDate: batch.expiryDate,
          status: batch.status,
          itemName: item.name,
          itemUnit: item.unit,
        });
      }
    }

    // 5. 按紧急程度排序：过期 → expiryDate 最近的优先
    results.sort((a, b) => {
      const aExpired = a.status === "expired" ? 0 : 1;
      const bExpired = b.status === "expired" ? 0 : 1;
      if (aExpired !== bExpired) return aExpired - bExpired;
      return a.expiryDate - b.expiryDate;
    });

    return results;
  },
});

// ── batches.checkExpiry (internal) ──────────────────────────
// Cron Job 调用的内部函数，无需用户认证
// 1. 扫描所有 active 批次
// 2. 判断是否过期或临期
// 3. 过期：status → expired，扣减 items.quantity，生成 expired alert
// 4. 临期（7天内）：生成 expiry_soon alert（当日去重）
export const checkExpiry = internalMutation({
  args: {},
  returns: v.null(),
  handler: async (ctx): Promise<null> => {
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
    const todayStart = getTodayStartTimestamp();

    // 扫描所有 active 批次（使用 by_status 索引）
    const activeBatches = await ctx.db
      .query("batches")
      .withIndex("by_status", (q) => q.eq("status", "active"))
      .take(1000);

    for (const batch of activeBatches) {
      const isExpired = batch.expiryDate <= now;
      const isExpiringSoon =
        !isExpired && batch.expiryDate <= now + sevenDaysMs;

      if (isExpired) {
        // 1. 标记批次为过期
        await ctx.db.patch(batch._id, { status: "expired" });

        // 2. 扣减 items.quantity
        const item = await ctx.db.get(batch.itemId);
        if (item !== null) {
          const newQuantity = Math.max(0, item.quantity - batch.quantity);
          await ctx.db.patch(batch.itemId, { quantity: newQuantity });

          // 3. 生成 expired alert（当日去重）
          const hasTodayExpired = await hasAlertToday(
            ctx,
            batch.itemId,
            "expired",
            todayStart,
          );

          if (!hasTodayExpired) {
            await ctx.db.insert("alerts", {
              itemId: batch.itemId,
              type: "expired",
              isRead: false,
              isDismissed: false,
              userId: item.createdBy,
            });
          }
        }
      } else if (isExpiringSoon) {
        // 生成 expiry_soon alert（当日去重）
        const item = await ctx.db.get(batch.itemId);
        if (item !== null) {
          const hasTodayExpiringSoon = await hasAlertToday(
            ctx,
            batch.itemId,
            "expiry_soon",
            todayStart,
          );

          if (!hasTodayExpiringSoon) {
            await ctx.db.insert("alerts", {
              itemId: batch.itemId,
              type: "expiry_soon",
              isRead: false,
              isDismissed: false,
              userId: item.createdBy,
            });
          }
        }
      }
    }

    // 如果批次数量达到上限，调度继续执行（事务限制保护）
    if (activeBatches.length >= 1000) {
      await ctx.scheduler.runAfter(0, internal.batches.checkExpiry, {});
    }

    return null;
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

/** 检查某物品今天是否已有指定类型的 alert */
async function hasAlertToday(
  ctx: MutationCtx,
  itemId: Id<"items">,
  alertType: "expired" | "expiry_soon",
  todayStart: number,
): Promise<boolean> {
  const existingAlerts = await ctx.db
    .query("alerts")
    .withIndex("by_item", (q) => q.eq("itemId", itemId))
    .take(50);

  return existingAlerts.some(
    (alert) =>
      alert.type === alertType && alert._creationTime >= todayStart,
  );
}
