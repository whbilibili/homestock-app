"use client";

/**
 * NotificationBadge — 通知角标组件
 *
 * 显示未读通知数量。ALERT-001 实现前使用 mock 数据占位。
 * 设计规范：emoji 替代图标库（homestock-design 原则 #3）
 */
export default function NotificationBadge(): React.ReactElement {
  // TODO: ALERT-001 实现后替换为 useQuery(api.alerts.countUnread)
  const unreadCount = 0;

  return (
    <button
      type="button"
      className="relative flex items-center justify-center w-10 h-10 rounded-[var(--hs-radius-element)] transition-colors duration-[var(--hs-duration-micro)] hover:bg-[var(--hs-border)]"
      aria-label={
        unreadCount > 0
          ? `${unreadCount} 条未读通知`
          : "没有未读通知"
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
