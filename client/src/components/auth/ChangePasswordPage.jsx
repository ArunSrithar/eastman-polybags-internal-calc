import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { changePasswordApi } from "../../utils/authApi";
import { UserIcon, LockIcon, EyeIcon, EyeOffIcon, HomeIcon } from "../ui/Icons";
import TaglineHeadline from "./TaglineHeadline";

export default function ChangePasswordPage() {
  const { user, logout, refreshUser } = useAuth();

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    if (newPassword.length < 8)
      return "New password must be at least 8 characters";
    if (newPassword.length > 72)
      return "New password must be 72 characters or fewer";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setLoading(true);
    try {
      await changePasswordApi(newPassword);
      await refreshUser();
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex flex-col overflow-hidden relative auth-page-bg">
      <div className="auth-grid-overlay absolute inset-0 pointer-events-none" />
      <div className="auth-blob-1 absolute -top-40 -left-20 w-[700px] h-[700px] rounded-full pointer-events-none" />
      <div className="auth-blob-2 absolute -bottom-48 left-[10%] w-[600px] h-[600px] rounded-full pointer-events-none" />

      <div className="relative w-full flex-1 self-stretch grid grid-cols-1 lg:grid-cols-2">
        {/* Left: branding panel */}
        <div className="hidden lg:flex items-center justify-end pr-6 pl-16 relative z-10">
          <div className="space-y-10 max-w-md text-right">
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

        {/* Right: change password card */}
        <div className="flex items-center justify-center lg:justify-start px-4 lg:pl-6 lg:pr-16 relative z-10">
          <div className="w-full max-w-sm auth-login-card auth-card-swap-enter flex flex-col justify-center px-8 lg:px-10 py-14 lg:py-16">
            <div className="mb-7">
              <h2 className="text-3xl font-bold text-label mb-2">
                Set New Password
              </h2>
              <p className="text-label-3 text-sm">
                {user?.username ? `Welcome, ${user.username}` : "Welcome"} — set
                a new password to continue
              </p>
            </div>

            <form onSubmit={handleSubmit} noValidate className="space-y-4">
              {/* Username — disabled, pre-filled */}
              <div>
                <label htmlFor="cp-username" className="auth-field-label">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-4 pointer-events-none">
                    <UserIcon className="size-4" />
                  </span>
                  <input
                    id="cp-username"
                    type="text"
                    value={user?.username ?? ""}
                    disabled
                    className="auth-input pl-9 opacity-50 cursor-not-allowed"
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* New password */}
              <div>
                <label htmlFor="cp-new" className="auth-field-label">
                  New password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-3 pointer-events-none">
                    <LockIcon className="size-4" />
                  </span>
                  <input
                    id="cp-new"
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => {
                      setNewPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Min 8 characters"
                    autoComplete="new-password"
                    autoFocus
                    className="auth-input pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-label-3 hover:text-label-2 transition-colors"
                    aria-label={showNew ? "Hide password" : "Show password"}
                  >
                    {showNew ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {/* Confirm password */}
              <div>
                <label htmlFor="cp-confirm" className="auth-field-label">
                  Confirm new password
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-label-3 pointer-events-none">
                    <LockIcon className="size-4" />
                  </span>
                  <input
                    id="cp-confirm"
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => {
                      setConfirmPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Re-enter new password"
                    autoComplete="new-password"
                    className="auth-input pl-9 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-label-3 hover:text-label-2 transition-colors"
                    aria-label={showConfirm ? "Hide password" : "Show password"}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              {error ? <p className="form-error">{error}</p> : null}

              <div className="pt-2 flex flex-col gap-2">
                <button
                  type="submit"
                  disabled={loading || !newPassword || !confirmPassword}
                  className="auth-submit-btn"
                >
                  {loading ? "Saving…" : "Set New Password"}
                </button>
                <button
                  type="button"
                  onClick={() => logout()}
                  className="w-full text-sm text-tint font-medium py-2 hover:opacity-80 transition-opacity"
                >
                  Sign out
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <p className="absolute bottom-5 left-1/2 -translate-x-1/2 text-label-4 text-xs whitespace-nowrap">
        &copy; {new Date().getFullYear()} Eastman Colour Printers
      </p>
    </div>
  );
}
