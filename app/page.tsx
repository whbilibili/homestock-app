"use client";

import { useConvexAuth } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  return (
    <>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md p-4 border-b border-gray-200 flex flex-row justify-between items-center shadow-sm">
        <h1 className="font-semibold text-gray-800">HomeStock</h1>
        <SignOutButton />
      </header>
      <main className="p-8 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <h2 className="text-2xl font-bold text-gray-800">
          欢迎使用 HomeStock
        </h2>
        <p className="text-gray-500">家庭库存管理应用 — 功能开发中</p>
      </main>
    </>
  );
}

function SignOutButton() {
  const { isAuthenticated } = useConvexAuth();
  const { signOut } = useAuthActions();
  const router = useRouter();
  return (
    <>
      {isAuthenticated && (
        <button
          className="bg-gray-600 hover:bg-gray-700 text-white rounded-lg px-4 py-2 text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer"
          onClick={() =>
            void signOut().then(() => {
              router.push("/signin");
            })
          }
        >
          退出登录
        </button>
      )}
    </>
  );
}
