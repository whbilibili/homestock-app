"use client";

import type { ReactElement } from "react";
import {
  useAlertList,
  useDismissAlert,
  useAddToShoppingList,
} from "@/hooks/useAlerts";
import AlertList from "@/components/alerts/AlertList";
import { useToast, ToastContainer } from "@/components/ui/Toast";

/**
 * NotificationsPage — 通知中心
 *
 * 展示未读提醒列表，支持"加入购物清单"和"忽略"操作。
 * 设计系统：
 * - 单列列表布局 max-w-2xl mx-auto
 * - 页面标题 text-xl font-bold（Outfit）
 * - 加载态：skeleton pulse
 */
export default function NotificationsPage(): ReactElement {
  const alerts = useAlertList();
  const dismissAlert = useDismissAlert();
  const addToShoppingList = useAddToShoppingList();
  const { messages, toast, dismiss: dismissToast } = useToast();

  const handleDismiss = async (alertId: Parameters<typeof dismissAlert>[0]): Promise<void> => {
    try {
      await dismissAlert(alertId);
      toast("已忽略该提醒", "success");
    } catch {
      toast("操作失败，请重试", "error");
    }
  };

  const handleAddToShoppingList = async (
    alertId: Parameters<typeof addToShoppingList>[0],
  ): Promise<void> => {
    try {
      await addToShoppingList(alertId);
      toast("已加入购物清单 🛒", "success");
    } catch {
      toast("操作失败，请重试", "error");
    }
  };

  return (
    <div className="py-6 max-w-2xl mx-auto">
      {/* 页面标题 */}
      <div className="mb-6">
        <h1
          className="text-xl font-bold"
          style={{ color: "var(--hs-text)" }}
        >
          🔔 通知中心
        </h1>
        {alerts !== undefined && alerts.length > 0 && (
          <p className="mt-1 text-sm text-[var(--hs-text-muted)]">
            {alerts.length} 条待处理提醒
          </p>
        )}
      </div>

      {/* 内容区 */}
      {alerts === undefined ? (
        /* 加载态：spinner */
        <div className="flex items-center justify-center py-16"><div className="w-8 h-8 border-2 border-[var(--hs-border)] border-t-[var(--hs-accent)] rounded-full" style={{ animation: "spin 0.8s linear infinite" }} /></div>
      ) : (
        <AlertList
          alerts={alerts}
          onDismiss={handleDismiss}
          onAddToShoppingList={handleAddToShoppingList}
        />
      )}

      {/* Toast 反馈 */}
      <ToastContainer messages={messages} onDismiss={dismissToast} />
    </div>
  );
}
