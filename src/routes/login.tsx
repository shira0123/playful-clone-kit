import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { AuthFrame, FormMessage } from "@/components/auth/AuthFrame";
import { loginUser } from "@/server-fns";
export const Route = createFileRoute("/login")({ component: Login });
function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState<string>();
  const [pending, setPending] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);
    const form = new FormData(event.currentTarget);
    try {
      const user = await loginUser({
        data: { email: String(form.get("email")), password: String(form.get("password")) },
      });
      await navigate({ to: user.role === "admin" ? "/admin" : "/dashboard" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to sign in.");
    } finally {
      setPending(false);
    }
  }
  return (
    <AuthFrame title="Welcome back" subtitle="Sign in to your EVOLVE TRADE HUB account">
      <form className="mt-7 space-y-4" onSubmit={submit}>
        <label className="block text-sm font-medium">
          Email
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="block text-sm font-medium">
          Password
          <input
            required
            type="password"
            name="password"
            autoComplete="current-password"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <button
          disabled={pending}
          className="w-full cursor-pointer rounded-md bg-gold px-4 py-2.5 font-semibold text-navy transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Signing in…" : "Sign in"}
        </button>
      </form>
      <FormMessage message={error} />
      <p className="mt-5 text-center text-sm">
        <Link to="/forgot-password" className="text-navy underline">
          Forgot password?
        </Link>
      </p>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="font-semibold text-navy underline">
          Create an account
        </Link>
      </p>
    </AuthFrame>
  );
}
