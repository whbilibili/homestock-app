import { redirect } from "next/navigation";

/**
 * 根路径页面
 *
 * middleware (proxy.ts) 会处理重定向：
 * - 已登录 → /inventory
 * - 未登录 → /signin
 *
 * 此页面作为 fallback，直接重定向到 /inventory。
 */
export default function Home(): never {
  redirect("/inventory");
}
