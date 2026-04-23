import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

/**
 * 预警管理 Convex Functions
 * ALERT-001: listUnread / countUnread / dismiss / addToShoppingList
 *
 * alerts 的写入逻辑已在 INV-001 的 adjustQuantity mutation 中实现。
 * 本模块实现读取和操作函数。
 */

// ── alerts.listUnread ──────────────────────────────────────
// 返回当前用户的未读且未忽略的提醒列表，含关联物品名称
// 使用 by_user_unread 索引（userId, isRead），按 _creationTime 倒序
export const listUnread = query({
  args: {},
  returns: v.array(
    v.object({
      _id: v.id("alerts"),
      _creationTime: v.number(),
      itemId: v.id("items"),
      type: v.union(
        v.literal("low_stock"),
        v.literal("out_of_stock"),
        v.literal("expiry_soon"),
        v.literal("expired"),
      ),
      isRead: v.boolean(),
      isDismissed: v.boolean(),
      userId: v.id("users"),
      itemName: v.string(),
    }),
  ),
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    // 使用索引查询 userId + isRead=false
    const unreadAlerts = await ctx.db
      .query("alerts")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("isRead", false))
      .order("desc")
      .take(200);

    // 过滤掉已忽略的
    const activeAlerts = unreadAlerts.filter((alert) => !alert.isDismissed);

    // 逐个 join items 表获取 itemName
    const result: {
      _id: typeof activeAlerts[number]["_id"];
      _creationTime: number;
      itemId: typeof activeAlerts[number]["itemId"];
      type: typeof activeAlerts[number]["type"];
      isRead: boolean;
      isDismissed: boolean;
      userId: typeof activeAlerts[number]["userId"];
      itemName: string;
    }[] = [];

    for (const alert of activeAlerts) {
      const item = await ctx.db.get(alert.itemId);
      result.push({
        _id: alert._id,
        _creationTime: alert._creationTime,
        itemId: alert.itemId,
        type: alert.type,
        isRead: alert.isRead,
        isDismissed: alert.isDismissed,
        userId: alert.userId,
        itemName: item !== null ? item.name : "（已删除的物品）",
      });
    }

    return result;
  },
});

// ── alerts.countUnread ─────────────────────────────────────
// 返回当前用户未读且未忽略的提醒数量（用于 Header 角标）
export const countUnread = query({
  args: {},
  returns: v.number(),
  handler: async (ctx): Promise<number> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    const unreadAlerts = await ctx.db
      .query("alerts")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("isRead", false))
      .take(200);

    // 过滤掉已忽略的，只返回计数
    return unreadAlerts.filter((alert) => !alert.isDismissed).length;
  },
});

// ── alerts.dismiss ─────────────────────────────────────────
// 忽略一条提醒：patch isDismissed=true
export const dismiss = mutation({
  args: {
    alertId: v.id("alerts"),
  },
  returns: v.null(),
  handler: async (ctx, args): Promise<null> => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    const alert = await ctx.db.get(args.alertId);
    if (alert === null) {
      throw new Error("提醒不存在");
    }
    if (alert.userId !== userId) {
      throw new Error("无权操作此提醒");
    }

    await ctx.db.patch(args.alertId, { isDismissed: true });

    return null;
  },
});

// ── alerts.addToShoppingList ───────────────────────────────
// 从提醒一键加入购物清单：
// 1. 读取关联 item
// 2. 计算补购数量 = max(1, alertThreshold - quantity)
// 3. insert shoppingListItems(source: 'auto_alert')
// 4. patch alert isRead=true
export const addToShoppingList = mutation({
  args: {
    alertId: v.id("alerts"),
  },
  returns: v.object({
    shoppingListItemId: v.id("shoppingListItems"),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (userId === null) {
      throw new Error("未登录，请先登录");
    }

    // 1. 读取 alert
    const alert = await ctx.db.get(args.alertId);
    if (alert === null) {
      throw new Error("提醒不存在");
    }
    if (alert.userId !== userId) {
      throw new Error("无权操作此提醒");
    }

    // 2. 读取关联 item
    const item = await ctx.db.get(alert.itemId);
    if (item === null) {
      throw new Error("关联物品不存在");
    }

    // 3. 计算补购数量：alertThreshold - 当前库存，至少为 1
    const plannedQuantity = Math.max(1, item.alertThreshold - item.quantity);

    // 4. 创建购物清单项
    const shoppingListItemId = await ctx.db.insert("shoppingListItems", {
      itemId: alert.itemId,
      plannedQuantity,
      source: "auto_alert",
      status: "pending",
      addedBy: userId,
    });

    // 5. 标记 alert 为已读
    await ctx.db.patch(args.alertId, { isRead: true });

    return { shoppingListItemId };
  },
});
