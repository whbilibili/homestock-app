import {
  convexAuthNextjsMiddleware,
  createRouteMatcher,
  nextjsMiddlewareRedirect,
} from "@convex-dev/auth/nextjs/server";

const isSignInPage = createRouteMatcher(["/signin"]);
const isProtectedRoute = createRouteMatcher([
  "/inventory",
  "/items",
  "/items/(.*)",
  "/shopping",
  "/expiry",
  "/notifications",
]);

export default convexAuthNextjsMiddleware(async (request, { convexAuth }) => {
  const isAuthenticated = await convexAuth.isAuthenticated();

  // 已登录用户访问登录页 → 重定向到库存总览
  if (isSignInPage(request) && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/inventory");
  }

  // 已登录用户访问根路径 → 重定向到库存总览
  if (request.nextUrl.pathname === "/" && isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/inventory");
  }

  // 未登录用户访问根路径 → 重定向到登录页
  if (request.nextUrl.pathname === "/" && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }

  // 未登录用户访问受保护路由 → 重定向到登录页
  if (isProtectedRoute(request) && !isAuthenticated) {
    return nextjsMiddlewareRedirect(request, "/signin");
  }
});

export const config = {
  // The following matcher runs middleware on all routes
  // except static assets.
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
