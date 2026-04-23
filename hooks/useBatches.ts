"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

/**
 * useBatches — 批次管理 Hook
 *
 * 封装 Convex batches.* 函数调用，是客户端与 Convex 批次交互的唯一入口。
 * 遵循架构约束：Component 层禁止直接 import { api }。
 */

/** 批次状态 */
export type BatchStatus = "active" | "consumed" | "expired" | "disposed";

/** 临期/过期批次文档（listExpiring 返回） */
export interface ExpiringBatchDoc {
  _id: Id<"batches">;
  _creationTime: number;
  itemId: Id<"items">;
  quantity: number;
  expiryDate: number;
  status: BatchStatus;
  itemName: string;
  itemUnit: string;
}

/** 批次文档（listByItem 返回） */
export interface BatchDoc {
  _id: Id<"batches">;
  _creationTime: number;
  itemId: Id<"items">;
  quantity: number;
  expiryDate: number;
  status: BatchStatus;
}

/** 紧急程度等级 */
export type UrgencyLevel = "expired" | "critical" | "warning" | "normal";

/** 紧急程度元信息 */
export interface UrgencyMeta {
  level: UrgencyLevel;
  emoji: string;
  label: string;
  colorClass: string;
  bgClass: string;
}

/** 计算批次的紧急程度 */
export function getUrgency(batch: { expiryDate: number; status: string }): UrgencyMeta {
  const now = Date.now();
  const threeDaysMs = 3 * 24 * 60 * 60 * 1000;
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

  if (batch.status === "expired" || batch.expiryDate <= now) {
    return {
      level: "expired",
      emoji: "💀",
      label: "已过期",
      colorClass: "text-[var(--hs-error)]",
      bgClass: "bg-[var(--hs-error-bg)]",
    };
  }
  if (batch.expiryDate <= now + threeDaysMs) {
    return {
      level: "critical",
      emoji: "🔥",
      label: "3天内过期",
      colorClass: "text-orange-600",
      bgClass: "bg-orange-50",
    };
  }
  if (batch.expiryDate <= now + sevenDaysMs) {
    return {
      level: "warning",
      emoji: "⏰",
      label: "7天内过期",
      colorClass: "text-[var(--hs-warn)]",
      bgClass: "bg-[var(--hs-warn-bg)]",
    };
  }
  return {
    level: "normal",
    emoji: "✅",
    label: "正常",
    colorClass: "text-[var(--hs-ok)]",
    bgClass: "bg-[var(--hs-ok-bg)]",
  };
}

/** 格式化保质期剩余天数 */
export function formatDaysRemaining(expiryDate: number): string {
  const now = Date.now();
  const diffMs = expiryDate - now;
  const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  if (diffDays < 0) {
    return `已过期 ${Math.abs(diffDays)} 天`;
  }
  if (diffDays === 0) {
    return "今天过期";
  }
  if (diffDays === 1) {
    return "明天过期";
  }
  return `${diffDays} 天后过期`;
}

/** 格式化到期日期 */
export function formatExpiryDate(expiryDate: number): string {
  return new Date(expiryDate).toLocaleDateString("zh-CN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

// ── Hooks ──────────────────────────────────────────────────

/** 临期/过期批次列表 Hook（/expiry 页面使用） */
export function useExpiringBatches(): ExpiringBatchDoc[] | undefined {
  return useQuery(api.batches.listExpiring);
}

/** 按物品查询批次列表 Hook（物品详情页批次 Tab 使用） */
export function useBatchesByItem(itemId: Id<"items">): BatchDoc[] | undefined {
  return useQuery(api.batches.listByItem, { itemId });
}
