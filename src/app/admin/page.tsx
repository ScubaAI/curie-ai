"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const ADMIN_PASSWORD = "curie2024";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    // Simulate a small delay for better UX
    await new Promise((resolve) => setTimeout(resolve, 500));

    if (password === ADMIN_PASSWORD) {
      // Store auth state in sessionStorage
      if (typeof window !== "undefined") {
        sessionStorage.setItem("admin_authenticated", "true");
      }
      router.push("/admin/dashboard");
    } else {
      setError("Contraseña incorrecta");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-black">
      <div className="w-full max-w-md px-6">
        {/* Logo/Branding */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white tracking-tight">
            Curie
          </h1>
          <p className="text-slate-400 mt-2 text-sm">
            Panel de Administración
          </p>
        </div>

        {/* Login Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 backdrop-blur-sm"
        >
          <div className="space-y-6">
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-slate-300 mb-2"
              >
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Ingresa tu contraseña"
                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-700 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all duration-200"
                disabled={isLoading}
                autoFocus
              />
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <p className="text-red-400 text-sm text-center">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !password}
              className="w-full py-3 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-700 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-cyan-500/50"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Verificando...
                </span>
              ) : (
                "Acceder"
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <p className="text-center text-slate-500 text-xs mt-6">
          © 2024 Curie Intelligence. Todos los derechos reservados.
        </p>
      </div>
    </div>
  );
}
