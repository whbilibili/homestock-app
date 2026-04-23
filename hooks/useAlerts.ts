"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * useAlerts — 预警管理 Hook
 *
 * 封装 Convex alerts.* 函数调用，是客户端与 Convex 预警交互的唯一入口。
 * 遵循架构约束：Component 层禁止直接 import { api }。
 */

/** 提醒类型 */
export type AlertType = "low_stock" | "out_of_stock" | "expiry_soon" | "expired";

/** 提醒文档类型（从 listUnread 返回） */
export interface AlertDoc {
  _id: Id<"alerts">;
  _creationTime: number;
  itemId: Id<"items">;
  type: AlertType;
  isRead: boolean;
  isDismissed: boolean;
  userId: Id<"users">;
  itemName: string;
}

/** 提醒类型元信息（emoji + 标签 + 颜色） */
export interface AlertTypeMeta {
  emoji: string;
  label: string;
  colorClass: string;
  bgClass: string;
}

/** 提醒类型到元信息映射 */
export const alertTypeMeta: Record<AlertType, AlertTypeMeta> = {
  low_stock: {
    emoji: "⚠️",
    label: "库存不足",
    colorClass: "text-[var(--hs-warn)]",
    bgClass: "bg-[var(--hs-warn-bg)]",
  },
  out_of_stock: {
    emoji: "🔴",
    label: "已缺货",
    colorClass: "text-[var(--hs-error)]",
    bgClass: "bg-[var(--hs-error-bg)]",
  },
  expiry_soon: {
    emoji: "⏰",
    label: "即将过期",
    colorClass: "text-[var(--hs-warn)]",
    bgClass: "bg-[var(--hs-warn-bg)]",
  },
  expired: {
    emoji: "💀",
    label: "已过期",
    colorClass: "text-[var(--hs-error)]",
    bgClass: "bg-[var(--hs-error-bg)]",
  },
};

/** 未读提醒列表 Hook */
export function useAlertList(): AlertDoc[] | undefined {
  return useQuery(api.alerts.listUnread);
}

/** 未读提醒计数 Hook（用于角标） */
export function useAlertCount(): number | undefined {
  return useQuery(api.alerts.countUnread);
}

/** 忽略提醒 mutation Hook */
export function useDismissAlert(): (alertId: Id<"alerts">) => Promise<null> {
  const dismissMutation = useMutation(api.alerts.dismiss);
  return (alertId: Id<"alerts">) => dismissMutation({ alertId });
}

/** 加入购物清单 mutation Hook */
export function useAddToShoppingList(): (
  alertId: Id<"alerts">,
) => Promise<{ shoppingListItemId: Id<"shoppingListItems"> }> {
  const addMutation = useMutation(api.alerts.addToShoppingList);
  return (alertId: Id<"alerts">) => addMutation({ alertId });
}

/** 格式化时间差（友好显示） */
export function formatAlertTime(creationTime: number): string {
  const now = Date.now();
  const diff = now - creationTime;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "刚刚";
  if (minutes < 60) return `${minutes} 分钟前`;
  if (hours < 24) return `${hours} 小时前`;
  if (days < 7) return `${days} 天前`;

  const date = new Date(creationTime);
  return `${date.getMonth() + 1}月${date.getDate()}日`;
}
