import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

export default defineSchema({
  ...authTables,

  // ── 物品主表 ──────────────────────────────────────────
  items: defineTable({
    name: v.string(),
    category: v.string(),
    unit: v.string(),
    quantity: v.number(),
    alertThreshold: v.number(),
    trackExpiry: v.boolean(),
    isArchived: v.boolean(),
    householdId: v.optional(v.string()), // P2 预留，届时改为 v.id("households")
    createdBy: v.id("users"),
    updatedBy: v.id("users"),
  })
    .index("by_category", ["category"])
    .index("by_archived", ["isArchived"]),

  // ── 库存变动日志 ──────────────────────────────────────
  inventoryLogs: defineTable({
    itemId: v.id("items"),
    previousQuantity: v.number(),
    newQuantity: v.number(),
    changeAmount: v.number(),
    operatorId: v.id("users"),
  })
    .index("by_item", ["itemId"])
    .index("by_operator", ["operatorId"]),

  // ── 预警 ──────────────────────────────────────────────
  alerts: defineTable({
    itemId: v.id("items"),
    type: v.union(v.literal("low_stock"), v.literal("expiry_soon"), v.literal("expired")),
    isRead: v.boolean(),
    isDismissed: v.boolean(),
    userId: v.id("users"),
  })
    .index("by_user_unread", ["userId", "isRead"])
    .index("by_item", ["itemId"]),

  // ── 购物清单 ──────────────────────────────────────────
  shoppingListItems: defineTable({
    itemId: v.optional(v.id("items")), // 可关联已有物品，也可为临时条目
    tempItemName: v.optional(v.string()), // itemId 为空时使用
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
  })
    .index("by_status", ["status"])
    .index("by_item", ["itemId"]),

  // ── 批次（保质期追踪） ────────────────────────────────
  batches: defineTable({
    itemId: v.id("items"),
    quantity: v.number(),
    expiryDate: v.number(), // Unix timestamp (ms)
    status: v.union(
      v.literal("active"),
      v.literal("consumed"),
      v.literal("expired"),
      v.literal("disposed"),
    ),
  })
    .index("by_item", ["itemId"])
    .index("by_expiry", ["expiryDate"])
    .index("by_status", ["status"]),
});
