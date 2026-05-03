import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, HomeIcon } from "../ui/Icons";
import TaglineHeadline from "./TaglineHeadline";

export default function LoginPage() {
  const { login } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

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
    <div className="min-h-screen w-full flex flex-col overflow-hidden relative auth-page-bg">
      {/* Box grid overlay */}
      <div className="auth-grid-overlay absolute inset-0 pointer-events-none" />

      {/* Glow blobs — theme-aware via CSS classes */}
      <div className="auth-blob-1 absolute -top-40 -left-20 w-[700px] h-[700px] rounded-full pointer-events-none" />
      <div className="auth-blob-2 absolute -bottom-48 left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none" />

      {/* Full-screen two-column layout */}
      <div className="relative w-full flex-1 self-stretch grid grid-cols-1 lg:grid-cols-2">
        {/* Left: branding panel — content right-aligned, hugging center */}
        <div className="hidden lg:flex items-center justify-end pr-6 pl-16 relative z-10">
          <div className="space-y-10 max-w-md text-right">
            {/* Logo / wordmark — swap svg for <img> when a logo asset is available */}
            <div className="flex items-center gap-3 justify-end">
              <span className="text-label font-semibold text-base tracking-tight">
                Eastman Colour Printers
              </span>
              <div className="size-9 rounded-xl ring-1 ring-tint/40 bg-tint/15 flex items-center justify-center flex-shrink-0">
                <HomeIcon className="size-4.5 text-tint" />
              </div>
            </div>

            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 bg-tint/15 border border-tint/25 rounded-full px-3 py-1">
                <p className="text-tint text-[11px] font-semibold uppercase tracking-[0.2em]">
                  Internal Calculator
                </p>
                <span className="size-1.5 rounded-full bg-tint" />
              </div>
              <TaglineHeadline />
              <p className="text-label-3 text-sm leading-relaxed max-w-xs ml-auto">
                Daily rate calculations, quote generation, and cost breakdowns —
                all in one place.
              </p>
            </div>
          </div>
        </div>

        {/* Right: form panel — card left-aligned, hugging center */}
        <div className="flex items-center justify-center lg:justify-start px-4 lg:pl-6 lg:pr-16 relative z-10">
          {/* Mobile-only wordmark */}
          <div className="lg:hidden absolute top-8 left-1/2 -translate-x-1/2 flex items-center gap-2">
            <div className="size-7 rounded-lg bg-tint/10 flex items-center justify-center">
              <HomeIcon className="size-4 text-tint" />
            </div>
            <span className="text-label font-semibold text-sm">
              Eastman Colour Printers
            </span>
          </div>

          {/* Glass card — custom material tuned for dark context */}
          <div className="w-full max-w-sm auth-login-card auth-card-swap-enter flex flex-col justify-center px-8 lg:px-10 py-14 lg:py-16">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-label mb-2">
                Welcome back
              </h2>
              <p className="text-label-3 text-sm">
                Sign in to access the calculator
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              <div>
                <label htmlFor="username" className="auth-field-label">
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
                      setError(null);
                    }}
                    placeholder="Enter your username"
                    autoComplete="username"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit(e);
                    }}
                    className="auth-input pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <label htmlFor="login-password" className="auth-field-label">
                  Password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-3 pointer-events-none">
                    <LockIcon className="size-4" />
                  </span>
                  <input
                    id="login-password"
                    type={visible ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit(e);
                    }}
                    className="auth-input pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-label-3 hover:text-label-2 transition-colors"
                    aria-label={visible ? "Hide password" : "Show password"}
                  >
                    {visible ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error ? <p className="form-error">{error}</p> : null}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="auth-submit-btn"
                >
                  {loading ? "Signing in…" : "Sign in"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
      {/* end centered wrapper */}

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-label-4 text-xs whitespace-nowrap">
        &copy; {new Date().getFullYear()} Eastman Colour Printers
      </p>
    </div>
  );
}
