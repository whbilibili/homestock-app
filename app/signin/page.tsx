"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { ToastContainer, useToast } from "@/components/ui/Toast";

/* ------------------------------------------------------------------ */
/*  SignIn Page                                                        */
/* ------------------------------------------------------------------ */

export default function SignInPage() {
  const { signIn } = useAuthActions();
  const router = useRouter();

  const [flow, setFlow] = useState<"signIn" | "signUp">("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { messages, toast, dismiss } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    /* ---- client-side validation ---- */
    if (!email.trim()) {
      toast("请输入邮箱地址", "error");
      return;
    }
    if (password.length < 8) {
      toast("密码至少需要 8 个字符", "error");
      return;
    }

    setLoading(true);

    const formData = new FormData();
    formData.set("email", email);
    formData.set("password", password);
    formData.set("flow", flow);

    void signIn("password", formData)
      .then(() => {
        toast(flow === "signIn" ? "登录成功" : "注册成功", "success");
        router.push("/inventory");
      })
      .catch((err: Error) => {
        const msg =
          flow === "signIn"
            ? "登录失败，请检查邮箱和密码"
            : "注册失败，该邮箱可能已被注册";
        toast(err.message || msg, "error");
        setLoading(false);
      });
  };

  const isSignIn = flow === "signIn";

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* ---- Brand ---- */}
        <div className="mb-8 text-center">
          <h1
            className="text-3xl font-bold tracking-tight"
          >
            🏠 HomeStock
          </h1>
          <p className="mt-2 text-sm text-[var(--hs-text-muted)]">
            家庭库存，轻松掌握
          </p>
        </div>

        {/* ---- Card ---- */}
        <div className="rounded-[var(--hs-radius-component)] border border-[var(--hs-border)] bg-[var(--hs-bg-surface)] p-6">
          {/* ---- Tabs ---- */}
          <div className="mb-6 flex rounded-[var(--hs-radius-control)] border border-[var(--hs-border)] overflow-hidden">
            <button
              type="button"
              onClick={() => setFlow("signIn")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                isSignIn
                  ? "bg-[var(--hs-accent)] text-white"
                  : "bg-transparent text-[var(--hs-text-muted)] hover:text-[var(--hs-text)]"
              }`}
            >
              登录
            </button>
            <button
              type="button"
              onClick={() => setFlow("signUp")}
              className={`flex-1 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                !isSignIn
                  ? "bg-[var(--hs-accent)] text-white"
                  : "bg-transparent text-[var(--hs-text-muted)] hover:text-[var(--hs-text)]"
              }`}
            >
              注册
            </button>
          </div>

          {/* ---- Form ---- */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-email"
                className="text-sm font-medium text-[var(--hs-text)]"
              >
                邮箱
              </label>
              <input
                id="auth-email"
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoComplete="email"
                className="rounded-[var(--hs-radius-control)] border border-[var(--hs-border)] bg-[var(--hs-bg-surface)] px-3 py-2.5 text-sm text-[var(--hs-text)] placeholder:text-[var(--hs-text-muted)] outline-none transition-colors focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_var(--hs-accent-subtle)]"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="auth-password"
                className="text-sm font-medium text-[var(--hs-text)]"
              >
                密码
              </label>
              <input
                id="auth-password"
                type="password"
                name="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="至少 8 个字符"
                required
                minLength={8}
                autoComplete={isSignIn ? "current-password" : "new-password"}
                className="rounded-[var(--hs-radius-control)] border border-[var(--hs-border)] bg-[var(--hs-bg-surface)] px-3 py-2.5 text-sm text-[var(--hs-text)] placeholder:text-[var(--hs-text-muted)] outline-none transition-colors focus:border-[var(--hs-accent)] focus:shadow-[0_0_0_3px_var(--hs-accent-subtle)]"
              />
              {!isSignIn && (
                <p className="px-1 text-xs text-[var(--hs-text-muted)]">
                  密码至少需要 8 个字符
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 rounded-[var(--hs-radius-control)] bg-[var(--hs-accent)] py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--hs-accent-dark)] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {loading
                ? "处理中…"
                : isSignIn
                  ? "登录"
                  : "创建账号"}
            </button>
          </form>
        </div>

        {/* ---- Footer hint ---- */}
        <p className="mt-4 text-center text-xs text-[var(--hs-text-muted)]">
          {isSignIn ? "还没有账号？" : "已有账号？"}
          <button
            type="button"
            onClick={() => setFlow(isSignIn ? "signUp" : "signIn")}
            className="ml-1 font-medium text-[var(--hs-accent)] hover:text-[var(--hs-accent-dark)] underline underline-offset-2 cursor-pointer"
          >
            {isSignIn ? "立即注册" : "去登录"}
          </button>
        </p>
      </div>

      {/* ---- Toast ---- */}
      <ToastContainer messages={messages} onDismiss={dismiss} />
    </div>
  );
}
