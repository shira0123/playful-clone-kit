import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { z } from "zod";
import { AuthFrame, FormMessage } from "@/components/auth/AuthFrame";
import { verifyUserEmail } from "@/server-fns";
export const Route = createFileRoute("/verify-email")({ validateSearch: z.object({ token: z.string().optional() }), component: VerifyEmail });
function VerifyEmail() { const { token } = Route.useSearch(); const [error, setError] = useState<string>(); const [complete, setComplete] = useState(false); useEffect(() => { if (!token) { setError("The verification link is missing its token."); return; } void verifyUserEmail({ data: { token } }).then(() => setComplete(true)).catch((cause) => setError(cause instanceof Error ? cause.message : "Unable to verify this email.")); }, [token]); return <AuthFrame title={complete ? "Email verified" : "Verifying your email"} subtitle={complete ? "Your account is ready to use." : "This will take just a moment."}>{complete ? <Link to="/login" className="mt-7 block rounded-md bg-gold px-4 py-2.5 text-center font-semibold text-navy">Sign in</Link> : <FormMessage message={error} />}</AuthFrame>; }
