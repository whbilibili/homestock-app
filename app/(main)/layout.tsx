import AppShell from "@/components/layout/AppShell";

/**
 * (main) 路由组 Layout
 *
 * 所有需要 AppShell（Sidebar + Header + MobileTabBar）的页面
 * 都放在 (main) 路由组下。登录页 /signin 不在此路由组内。
 */
export default function MainLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AppShell>{children}</AppShell>;
}
