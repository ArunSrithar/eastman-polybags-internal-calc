import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserIcon } from "../ui/Icons";
import PasswordInput from "../ui/PasswordInput";
import AuthPageLayout from "./AuthPageLayout";

export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function clearError() {
    setError(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err.message || "Invalid username or password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      {/* Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-tint/10 mb-4">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-7 text-tint"
          >
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h1 className="text-xl font-semibold text-label">Eastman Polybags</h1>
        <p className="text-sm text-label-3 mt-1">Internal Calculator</p>
      </div>

      {/* Card */}
      <div className="card overflow-visible shadow-lg">
        <div className="card-section pb-1">
          <h2 className="text-base font-semibold text-label">Sign in</h2>
          <p className="text-xs text-label-3 mt-0.5">
            Enter your credentials to continue
          </p>
        </div>

        <div className="divider mx-4" />

        <form onSubmit={handleSubmit} noValidate>
          <div className="card-section space-y-3">
            {/* Username */}
            <div>
              <label htmlFor="username" className="field-label mb-1.5 block">
                Username
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-3 pointer-events-none">
                  <UserIcon className="size-4" />
                </span>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    clearError();
                  }}
                  placeholder="Enter username"
                  autoComplete="username"
                  autoFocus
                  className="input-base pl-9"
                  required
                />
              </div>
            </div>

            {/* Password */}
            <PasswordInput
              id="login-password"
              label="Password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                clearError();
              }}
              placeholder="Enter password"
              autoComplete="current-password"
            />

            {/* Error */}
            {error ? <p className="form-error">{error}</p> : null}
          </div>

          <div className="divider mx-4" />

          <div className="card-section pt-3">
            <button
              type="submit"
              disabled={loading || !username || !password}
              className="btn-primary btn-pill w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Signing in…" : "Sign in"}
            </button>
          </div>
        </form>
      </div>
    </AuthPageLayout>
  );
}
