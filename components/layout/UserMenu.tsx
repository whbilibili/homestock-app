"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useCallback } from "react";

/**
 * UserMenu — 用户信息 + 退出按钮
 *
 * 显示退出登录按钮。
 * 设计规范：Outfit 字体、emerald accent（homestock-design）
 */
export default function UserMenu(): React.ReactElement {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();

  const handleSignOut = useCallback((): void => {
    void signOut().then(() => {
      router.push("/signin");
    });
  }, [signOut, router]);

  if (!isAuthenticated) {
    return <div />;
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="flex items-center gap-2 px-3 py-2 rounded-[var(--hs-radius-element)] text-sm font-semibold transition-all duration-[var(--hs-duration-micro)] hover:bg-[var(--hs-border)] cursor-pointer"
      style={{ color: "var(--hs-text-muted)" }}
    >
      <span role="img" aria-hidden="true">👋</span>
      <span>退出</span>
    </button>
  );
}
