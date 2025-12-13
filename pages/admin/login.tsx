// pages/admin/login.tsx
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { getSupabase } from "../../utils/supabaseClient";
import { useAuth } from "../../utils/authContext";

function normalizeSupabaseError(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("invalid login") || lower.includes("invalid credentials")) {
    return "Email sau parolă incorectă.";
  }
  if (lower.includes("email not confirmed") || lower.includes("email not confirmed")) {
    return "Emailul nu este confirmat. Verificați inboxul pentru linkul de confirmare.";
  }
  if (lower.includes("over rate limit") || lower.includes("too many requests")) {
    return "Prea multe încercări. Încercați din nou în câteva minute.";
  }
  if (lower.includes("network") || lower.includes("fetch")) {
    return "Problemă de rețea. Verificați conexiunea la internet și încercați din nou.";
  }
  return message;
}

export default function AdminLogin() {
  const router = useRouter();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [hasRedirected, setHasRedirected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  const redirectPath =
    typeof router.query?.redirect === "string" && router.query.redirect.startsWith("/")
      ? router.query.redirect
      : "/admin";

  const handleLogin = async () => {
    const supabase = getSupabase();
    if (!supabase) return;

    // Reset previous errors
    setError(null);
    setFieldErrors({});

    // Basic client-side validation
    const nextFieldErrors: { email?: string; password?: string } = {};
    if (!email.trim()) nextFieldErrors.email = "Introduceți adresa de email.";
    if (!password) nextFieldErrors.password = "Introduceți parola.";
    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setLoading(true);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);

    if (signInError) {
      const message = normalizeSupabaseError(signInError.message);
      setError(message);
      return;
    }

    // On success, navigate to admin immediately
    setHasRedirected(true);
    router.replace(redirectPath);
  };

  useEffect(() => {
    if (!user || hasRedirected) return;
    const hasAuthCookie =
      typeof document !== "undefined" &&
      (document.cookie.includes("sb-access-token") ||
        document.cookie.includes("sb:token"));

    if (hasAuthCookie) {
      setHasRedirected(true);
      router.replace(redirectPath);
    }
  }, [user, hasRedirected, router, redirectPath]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-gray-800">Login Admin</h1>
        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {error}
          </div>
        )}
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:ring-2 focus:ring-indigo-300"
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        {fieldErrors.email && (
          <p className="-mt-2 mb-3 text-sm text-red-600">{fieldErrors.email}</p>
        )}
        <input
          className="w-full border border-gray-300 rounded-md px-3 py-2 mb-3 focus:ring-2 focus:ring-indigo-300"
          type="password"
          placeholder="Parola"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {fieldErrors.password && (
          <p className="-mt-2 mb-3 text-sm text-red-600">{fieldErrors.password}</p>
        )}
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full bg-indigo-500 text-white py-2 rounded-md hover:bg-indigo-600 disabled:opacity-60"
        >
          {loading ? "Se loghează..." : "Login"}
        </button>
      </div>
    </div>
  );
}
