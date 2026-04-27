import { internalMutation } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

/**
 * 演示数据 Seed 脚本
 * 用法：在 Convex Dashboard → Functions → seed:run 中执行
 * 参数：{ userId: "用户 ID" }
 *
 * 写入约 25 个物品、对应库存日志、批次（含临期/过期）、预警、购物清单
 */
export const run = internalMutation({
  args: {
    userId: v.id("users"),
  },
  returns: v.object({
    items: v.number(),
    inventoryLogs: v.number(),
    batches: v.number(),
    alerts: v.number(),
    shoppingListItems: v.number(),
  }),
  handler: async (ctx, args) => {
    const userId = args.userId;
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;

    // ────────────────────────────────────────────────
    // 1. 物品数据（25 个，覆盖 5 个分类）
    // ────────────────────────────────────────────────
    const itemDefs: {
      name: string;
      category: "food" | "daily" | "medicine" | "appliance" | "other";
      unit: string;
      quantity: number;
      alertThreshold: number;
      trackExpiry: boolean;
    }[] = [
      // food（10）
      { name: "大米", category: "food", unit: "kg", quantity: 5, alertThreshold: 2, trackExpiry: true },
      { name: "食用油", category: "food", unit: "瓶", quantity: 2, alertThreshold: 1, trackExpiry: true },
      { name: "酱油", category: "food", unit: "瓶", quantity: 1, alertThreshold: 1, trackExpiry: true },
      { name: "鸡蛋", category: "food", unit: "个", quantity: 3, alertThreshold: 6, trackExpiry: true },
      { name: "牛奶", category: "food", unit: "盒", quantity: 1, alertThreshold: 2, trackExpiry: true },
      { name: "面包", category: "food", unit: "袋", quantity: 0, alertThreshold: 1, trackExpiry: true },
      { name: "方便面", category: "food", unit: "包", quantity: 8, alertThreshold: 3, trackExpiry: true },
      { name: "咖啡", category: "food", unit: "袋", quantity: 2, alertThreshold: 1, trackExpiry: true },
      { name: "蜂蜜", category: "food", unit: "瓶", quantity: 1, alertThreshold: 1, trackExpiry: true },
      { name: "黄油", category: "food", unit: "块", quantity: 0, alertThreshold: 1, trackExpiry: true },

      // daily（6）
      { name: "洗手液", category: "daily", unit: "瓶", quantity: 2, alertThreshold: 1, trackExpiry: false },
      { name: "卫生纸", category: "daily", unit: "包", quantity: 1, alertThreshold: 2, trackExpiry: false },
      { name: "垃圾袋", category: "daily", unit: "卷", quantity: 3, alertThreshold: 2, trackExpiry: false },
      { name: "洗衣液", category: "daily", unit: "瓶", quantity: 1, alertThreshold: 1, trackExpiry: false },
      { name: "牙膏", category: "daily", unit: "支", quantity: 0, alertThreshold: 1, trackExpiry: false },
      { name: "洗洁精", category: "daily", unit: "瓶", quantity: 2, alertThreshold: 1, trackExpiry: false },

      // medicine（4）
      { name: "感冒药", category: "medicine", unit: "盒", quantity: 2, alertThreshold: 1, trackExpiry: true },
      { name: "创可贴", category: "medicine", unit: "盒", quantity: 1, alertThreshold: 1, trackExpiry: true },
      { name: "维生素C", category: "medicine", unit: "瓶", quantity: 0, alertThreshold: 1, trackExpiry: true },
      { name: "退烧药", category: "medicine", unit: "盒", quantity: 1, alertThreshold: 1, trackExpiry: true },

      // appliance（3）
      { name: "电池", category: "appliance", unit: "节", quantity: 2, alertThreshold: 4, trackExpiry: false },
      { name: "灯泡", category: "appliance", unit: "个", quantity: 3, alertThreshold: 2, trackExpiry: false },
      { name: "数据线", category: "appliance", unit: "根", quantity: 2, alertThreshold: 1, trackExpiry: false },

      // other（2）
      { name: "雨伞", category: "other", unit: "把", quantity: 2, alertThreshold: 1, trackExpiry: false },
      { name: "收纳盒", category: "other", unit: "个", quantity: 4, alertThreshold: 1, trackExpiry: false },
    ];

    const itemIds: Id<"items">[] = [];
    let logCount = 0;

    for (const def of itemDefs) {
      const itemId = await ctx.db.insert("items", {
        name: def.name,
        category: def.category,
        unit: def.unit,
        quantity: def.quantity,
        alertThreshold: def.alertThreshold,
        trackExpiry: def.trackExpiry,
        isArchived: false,
        createdBy: userId,
        updatedBy: userId,
      });
      itemIds.push(itemId);

      // 初始库存日志
      await ctx.db.insert("inventoryLogs", {
        itemId,
        previousQuantity: 0,
        newQuantity: def.quantity,
        changeAmount: def.quantity,
        operatorId: userId,
      });
      logCount++;
    }

    // ────────────────────────────────────────────────
    // 2. 额外库存变动日志（模拟使用痕迹）
    // ────────────────────────────────────────────────
    // 大米：从 10 减到 5（用了 5kg）
    await ctx.db.insert("inventoryLogs", {
      itemId: itemIds[0], previousQuantity: 10, newQuantity: 5, changeAmount: -5, operatorId: userId,
    });
    logCount++;

    // 鸡蛋：从 12 减到 3（用了很多）
    await ctx.db.insert("inventoryLogs", {
      itemId: itemIds[3], previousQuantity: 12, newQuantity: 3, changeAmount: -9, operatorId: userId,
    });
    logCount++;

    // 方便面：从 5 补到 8
    await ctx.db.insert("inventoryLogs", {
      itemId: itemIds[6], previousQuantity: 5, newQuantity: 8, changeAmount: 3, operatorId: userId,
    });
    logCount++;

    // 牛奶：从 4 减到 1
    await ctx.db.insert("inventoryLogs", {
      itemId: itemIds[4], previousQuantity: 4, newQuantity: 1, changeAmount: -3, operatorId: userId,
    });
    logCount++;

    // 卫生纸：从 4 减到 1
    await ctx.db.insert("inventoryLogs", {
      itemId: itemIds[11], previousQuantity: 4, newQuantity: 1, changeAmount: -3, operatorId: userId,
    });
    logCount++;

    // ────────────────────────────────────────────────
    // 3. 批次数据（仅 trackExpiry=true 的物品）
    //    覆盖：正常 / 临期（3天内）/ 临期（7天内）/ 已过期
    // ────────────────────────────────────────────────
    let batchCount = 0;

    // 大米 — 2 个 active 批次（1 个正常，1 个 7 天内临期）
    await ctx.db.insert("batches", {
      itemId: itemIds[0], quantity: 3, expiryDate: now + 90 * DAY, status: "active",
    });
    await ctx.db.insert("batches", {
      itemId: itemIds[0], quantity: 2, expiryDate: now + 5 * DAY, status: "active",
    });
    batchCount += 2;

    // 食用油 — 1 个正常批次
    await ctx.db.insert("batches", {
      itemId: itemIds[1], quantity: 2, expiryDate: now + 180 * DAY, status: "active",
    });
    batchCount++;

    // 酱油 — 1 个 3 天内临期
    await ctx.db.insert("batches", {
      itemId: itemIds[2], quantity: 1, expiryDate: now + 2 * DAY, status: "active",
    });
    batchCount++;

    // 鸡蛋 — 1 个 3 天内临期
    await ctx.db.insert("batches", {
      itemId: itemIds[3], quantity: 3, expiryDate: now + 1 * DAY, status: "active",
    });
    batchCount++;

    // 牛奶 — 1 个已过期
    await ctx.db.insert("batches", {
      itemId: itemIds[4], quantity: 1, expiryDate: now - 2 * DAY, status: "expired",
    });
    batchCount++;

    // 面包 — 已过期（库存已为 0）
    await ctx.db.insert("batches", {
      itemId: itemIds[5], quantity: 0, expiryDate: now - 5 * DAY, status: "expired",
    });
    batchCount++;

    // 方便面 — 2 个正常批次
    await ctx.db.insert("batches", {
      itemId: itemIds[6], quantity: 5, expiryDate: now + 120 * DAY, status: "active",
    });
    await ctx.db.insert("batches", {
      itemId: itemIds[6], quantity: 3, expiryDate: now + 60 * DAY, status: "active",
    });
    batchCount += 2;

    // 咖啡 — 1 个 6 天内临期
    await ctx.db.insert("batches", {
      itemId: itemIds[7], quantity: 2, expiryDate: now + 6 * DAY, status: "active",
    });
    batchCount++;

    // 蜂蜜 — 正常（保质期很长）
    await ctx.db.insert("batches", {
      itemId: itemIds[8], quantity: 1, expiryDate: now + 365 * DAY, status: "active",
    });
    batchCount++;

    // 黄油 — 已过期（库存已为 0）
    await ctx.db.insert("batches", {
      itemId: itemIds[9], quantity: 0, expiryDate: now - 3 * DAY, status: "expired",
    });
    batchCount++;

    // 感冒药 — 1 个正常
    await ctx.db.insert("batches", {
      itemId: itemIds[16], quantity: 2, expiryDate: now + 240 * DAY, status: "active",
    });
    batchCount++;

    // 创可贴 — 1 个 5 天内临期
    await ctx.db.insert("batches", {
      itemId: itemIds[17], quantity: 1, expiryDate: now + 4 * DAY, status: "active",
    });
    batchCount++;

    // 维生素C — 已过期（库存已为 0）
    await ctx.db.insert("batches", {
      itemId: itemIds[18], quantity: 0, expiryDate: now - 10 * DAY, status: "expired",
    });
    batchCount++;

    // 退烧药 — 正常
    await ctx.db.insert("batches", {
      itemId: itemIds[19], quantity: 1, expiryDate: now + 300 * DAY, status: "active",
    });
    batchCount++;

    // ────────────────────────────────────────────────
    // 4. 预警数据
    //    低库存 / 缺货 / 临期 / 已过期
    // ────────────────────────────────────────────────
    let alertCount = 0;

    // 鸡蛋 — low_stock（3 < 6）
    await ctx.db.insert("alerts", {
      itemId: itemIds[3], type: "low_stock", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 牛奶 — low_stock（1 < 2）
    await ctx.db.insert("alerts", {
      itemId: itemIds[4], type: "low_stock", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 面包 — out_of_stock（0）
    await ctx.db.insert("alerts", {
      itemId: itemIds[5], type: "out_of_stock", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 黄油 — out_of_stock（0）
    await ctx.db.insert("alerts", {
      itemId: itemIds[9], type: "out_of_stock", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 卫生纸 — low_stock（1 < 2）
    await ctx.db.insert("alerts", {
      itemId: itemIds[11], type: "low_stock", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 牙膏 — out_of_stock（0）
    await ctx.db.insert("alerts", {
      itemId: itemIds[14], type: "out_of_stock", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 维生素C — out_of_stock（0）
    await ctx.db.insert("alerts", {
      itemId: itemIds[18], type: "out_of_stock", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 电池 — low_stock（2 < 4）
    await ctx.db.insert("alerts", {
      itemId: itemIds[20], type: "low_stock", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 酱油 — expiry_soon（2 天后过期）
    await ctx.db.insert("alerts", {
      itemId: itemIds[2], type: "expiry_soon", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 鸡蛋 — expiry_soon（1 天后过期）
    await ctx.db.insert("alerts", {
      itemId: itemIds[3], type: "expiry_soon", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 牛奶 — expired
    await ctx.db.insert("alerts", {
      itemId: itemIds[4], type: "expired", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 面包 — expired
    await ctx.db.insert("alerts", {
      itemId: itemIds[5], type: "expired", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 黄油 — expired
    await ctx.db.insert("alerts", {
      itemId: itemIds[9], type: "expired", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // 维生素C — expired
    await ctx.db.insert("alerts", {
      itemId: itemIds[18], type: "expired", isRead: false, isDismissed: false, userId,
    });
    alertCount++;

    // ────────────────────────────────────────────────
    // 5. 购物清单
    //    auto_alert（从预警自动生成）+ manual（手动添加）
    // ────────────────────────────────────────────────
    let shoppingCount = 0;

    // 自动生成项（关联物品）
    await ctx.db.insert("shoppingListItems", {
      itemId: itemIds[3], plannedQuantity: 6, source: "auto_alert", status: "pending", addedBy: userId,
    }); // 鸡蛋 补 6 个
    shoppingCount++;

    await ctx.db.insert("shoppingListItems", {
      itemId: itemIds[4], plannedQuantity: 3, source: "auto_alert", status: "pending", addedBy: userId,
    }); // 牛奶 补 3 盒
    shoppingCount++;

    await ctx.db.insert("shoppingListItems", {
      itemId: itemIds[5], plannedQuantity: 2, source: "auto_alert", status: "pending", addedBy: userId,
    }); // 面包 补 2 袋
    shoppingCount++;

    await ctx.db.insert("shoppingListItems", {
      itemId: itemIds[9], plannedQuantity: 1, source: "auto_alert", status: "pending", addedBy: userId,
    }); // 黄油 补 1 块
    shoppingCount++;

    await ctx.db.insert("shoppingListItems", {
      itemId: itemIds[14], plannedQuantity: 2, source: "auto_alert", status: "pending", addedBy: userId,
    }); // 牙膏 补 2 支
    shoppingCount++;

    await ctx.db.insert("shoppingListItems", {
      itemId: itemIds[18], plannedQuantity: 1, source: "auto_alert", status: "pending", addedBy: userId,
    }); // 维生素C 补 1 瓶
    shoppingCount++;

    await ctx.db.insert("shoppingListItems", {
      itemId: itemIds[20], plannedQuantity: 4, source: "auto_alert", status: "pending", addedBy: userId,
    }); // 电池 补 4 节
    shoppingCount++;

    // 手动添加项（关联物品）
    await ctx.db.insert("shoppingListItems", {
      itemId: itemIds[11], plannedQuantity: 3, source: "manual", status: "pending", addedBy: userId,
    }); // 卫生纸 补 3 包
    shoppingCount++;

    await ctx.db.insert("shoppingListItems", {
      itemId: itemIds[13], plannedQuantity: 1, source: "manual", status: "pending", addedBy: userId,
    }); // 洗衣液 补 1 瓶
    shoppingCount++;

    // 手动添加项（临时物品，不关联 items 表）
    await ctx.db.insert("shoppingListItems", {
      tempItemName: "厨房纸巾", plannedQuantity: 2, source: "manual", status: "pending", addedBy: userId,
    });
    shoppingCount++;

    await ctx.db.insert("shoppingListItems", {
      tempItemName: "保鲜袋", plannedQuantity: 1, source: "manual", status: "pending", addedBy: userId,
    });
    shoppingCount++;

    await ctx.db.insert("shoppingListItems", {
      tempItemName: "酸奶", plannedQuantity: 6, source: "manual", status: "pending", addedBy: userId,
    });
    shoppingCount++;

    return {
      items: itemDefs.length,
      inventoryLogs: logCount,
      batches: batchCount,
      alerts: alertCount,
      shoppingListItems: shoppingCount,
    };
  },
});
