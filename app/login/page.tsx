"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase";
import { Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      setError("Invalid email or password.");
      setLoading(false);
      return;
    }

    router.push("/admin");
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-charcoal flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-4">
            <Image
              src="/images/Umami - logo.png"
              alt="Umami Street"
              width={72}
              height={72}
              className="rounded-full object-contain"
            />
          </div>
          <h1
            className="text-cream text-2xl font-bold"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Umami Street
          </h1>
          <p className="text-stone text-sm mt-1">Admin Console</p>
        </div>

        {/* Form */}
        <div className="bg-cream p-8">
          <h2
            className="text-charcoal text-xl font-bold mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Sign In
          </h2>

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-charcoal mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full border border-stone/40 bg-white px-4 py-3 text-sm focus:border-maroon outline-none"
                placeholder="admin@umamistreet.com"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wide text-charcoal mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full border border-stone/40 bg-white px-4 py-3 text-sm focus:border-maroon outline-none pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPw(!showPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone"
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-maroon text-sm font-medium">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full text-center disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
        </div>

        <p className="text-center text-stone/40 text-xs mt-6">
          Umami Street Admin — Authorized Access Only
        </p>
      </div>
    </div>
  );
}
