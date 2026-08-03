import { createFileRoute, Link } from "@tanstack/react-router";
import { type FormEvent, useState } from "react";
import { AuthFrame, FormMessage } from "@/components/auth/AuthFrame";
import { registerUser } from "@/server-fns";
import { Eye, EyeOff } from "lucide-react";

export const Route = createFileRoute("/register")({ component: Register });

function Register() {
  const [error, setError] = useState<string>();
  const [complete, setComplete] = useState(false);
  const [pending, setPending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(undefined);
    setPending(true);
    const f = new FormData(event.currentTarget);
    try {
      await registerUser({
        data: {
          firstName: String(f.get("firstName")),
          lastName: String(f.get("lastName")),
          email: String(f.get("email")),
          password: String(f.get("password")),
        },
      });
      setComplete(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Unable to create your account.");
    } finally {
      setPending(false);
    }
  }

  if (complete)
    return (
      <AuthFrame title="Check your email" subtitle="We sent a verification link to secure your account.">
        <Link
          to="/login"
          className="mt-7 block rounded-md bg-gold px-4 py-2.5 text-center font-semibold text-navy cursor-pointer transition-all hover:scale-[1.02]"
        >
          Return to sign in
        </Link>
      </AuthFrame>
    );

  return (
    <AuthFrame title="Create your account" subtitle="Start your investment journey with confidence.">
      <form className="mt-7 grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        <label className="text-sm font-medium">
          First name
          <input required name="firstName" className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>
        <label className="text-sm font-medium">
          Last name
          <input required name="lastName" className="mt-1 w-full rounded-md border px-3 py-2" />
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          Email
          <input
            required
            type="email"
            name="email"
            autoComplete="email"
            className="mt-1 w-full rounded-md border px-3 py-2"
          />
        </label>
        <label className="text-sm font-medium sm:col-span-2">
          Password
          <div className="relative mt-1">
            <input
              required
              type={showPassword ? "text" : "password"}
              name="password"
              minLength={12}
              autoComplete="new-password"
              className="w-full rounded-md border px-3 py-2 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <span className="mt-1 block text-xs text-muted-foreground">
            12+ characters with uppercase, lowercase, and a number.
          </span>
        </label>
        <button
          disabled={pending}
          className="sm:col-span-2 cursor-pointer rounded-md bg-gold px-4 py-2.5 font-semibold text-navy transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {pending ? "Creating account…" : "Create account"}
        </button>
      </form>
      <FormMessage message={error} />
      <p className="mt-5 text-center text-sm">
        Already registered?{" "}
        <Link to="/login" className="font-semibold text-navy underline">
          Sign in
        </Link>
      </p>
    </AuthFrame>
  );
}
