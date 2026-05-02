import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { changePasswordApi } from "../../utils/authApi";
import { LockIcon } from "../ui/Icons";
import PasswordInput from "../ui/PasswordInput";
import AuthPageLayout from "./AuthPageLayout";

export default function ChangePasswordPage() {
  const { user, logout, refreshUser } = useAuth();

  const [oldPassword, setOldPassword]         = useState("");
  const [newPassword, setNewPassword]         = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError]   = useState(null);
  const [loading, setLoading] = useState(false);

  function clearError() { setError(null); }

  function validate() {
    if (!oldPassword) return "Current password is required";
    if (newPassword.length < 8) return "New password must be at least 8 characters";
    if (newPassword.length > 72) return "New password must be 72 characters or fewer";
    if (newPassword !== confirmPassword) return "Passwords do not match";
    if (newPassword === oldPassword) return "New password must differ from current password";
    return null;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const validationError = validate();
    if (validationError) { setError(validationError); return; }

    setError(null);
    setLoading(true);
    try {
      await changePasswordApi(oldPassword, newPassword);
      // Re-fetch user so mustChangePassword clears without a full page reload.
      await refreshUser();
    } catch (err) {
      setError(err.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthPageLayout>
      {/* Branding */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-tint/10 mb-4">
          <LockIcon className="size-7 text-tint" />
        </div>
        <h1 className="text-xl font-semibold text-label">Change Password</h1>
        <p className="text-sm text-label-3 mt-1">
          {user?.username ? `Welcome, ${user.username}` : "Welcome"} — set a new password to continue
        </p>
      </div>

      {/* Card */}
      <div className="card overflow-visible shadow-lg">
        <div className="card-section pb-1">
          <h2 className="text-base font-semibold text-label">Set new password</h2>
          <p className="text-xs text-label-3 mt-0.5">This is required before you can use the app</p>
        </div>

        <div className="divider mx-4" />

        <form onSubmit={handleSubmit} noValidate>
          <div className="card-section space-y-3">
            <PasswordInput
              id="old-password"
              label="Current password"
              value={oldPassword}
              onChange={(e) => { setOldPassword(e.target.value); clearError(); }}
              autoComplete="current-password"
            />
            <PasswordInput
              id="new-password"
              label="New password"
              value={newPassword}
              onChange={(e) => { setNewPassword(e.target.value); clearError(); }}
              autoComplete="new-password"
            />
            <PasswordInput
              id="confirm-password"
              label="Confirm new password"
              value={confirmPassword}
              onChange={(e) => { setConfirmPassword(e.target.value); clearError(); }}
              autoComplete="new-password"
            />

            <p className="text-xs text-label-3">Minimum 8 characters, maximum 72.</p>

            {error ? <p className="form-error">{error}</p> : null}
          </div>

          <div className="divider mx-4" />

          <div className="card-section pt-3 flex flex-col gap-2">
            <button
              type="submit"
              disabled={loading || !oldPassword || !newPassword || !confirmPassword}
              className="btn-primary btn-pill w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Saving…" : "Set new password"}
            </button>
            <button
              type="button"
              onClick={() => logout()}
              className="btn-ghost btn-pill w-full justify-center text-sm"
            >
              Sign out
            </button>
          </div>
        </form>
      </div>
    </AuthPageLayout>
  );
}
