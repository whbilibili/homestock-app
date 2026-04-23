"use client";

import { useRouter } from "next/navigation";
import { useAlertCount } from "@/hooks/useAlerts";

/**
 * NotificationBadge — 通知角标组件
 *
 * 显示未读通知数量（真实 Convex 数据），点击跳转到 /notifications。
 * 设计规范：emoji 替代图标库（homestock-design 原则 #3）
 */
export default function NotificationBadge(): React.ReactElement {
  const router = useRouter();
  const unreadCount = useAlertCount() ?? 0;

  const handleClick = (): void => {
    router.push("/notifications");
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="relative flex items-center justify-center w-10 h-10 rounded-[var(--hs-radius-element)] transition-colors duration-[var(--hs-duration-micro)] hover:bg-[var(--hs-border)] cursor-pointer"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} 条未读通知，点击查看`
          : "没有未读通知，点击查看通知中心"
      }
    >
      <span className="text-xl" role="img" aria-hidden="true">
        🔔
      </span>
      {unreadCount > 0 && (
        <span
          className="absolute -top-0.5 -right-0.5 flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[var(--hs-radius-pill)] text-[10px] font-[800] tracking-[0.08em] text-white"
          style={{ background: "var(--hs-error)" }}
        >
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </button>
  );
}
