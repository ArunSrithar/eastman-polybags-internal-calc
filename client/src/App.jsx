import { useAuth, AuthProvider } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./components/auth/LoginPage";
import ChangePasswordPage from "./components/auth/ChangePasswordPage";

function syncAuthUrl(isAuthenticated, mustChangePassword) {
  const { pathname } = window.location;
  if (!isAuthenticated && pathname !== "/auth") {
    window.history.replaceState(null, "", "/auth");
  } else if (
    isAuthenticated &&
    mustChangePassword &&
    pathname !== "/auth/reset"
  ) {
    window.history.replaceState(null, "", "/auth/reset");
  } else if (
    isAuthenticated &&
    !mustChangePassword &&
    pathname.startsWith("/auth")
  ) {
    window.history.replaceState(null, "", "/");
  }
}

function resolveScene(isAuthenticated, mustChangePassword) {
  if (!isAuthenticated) return "auth";
  if (mustChangePassword) return "change-pw";
  return "app";
}

function AuthGate() {
  const { isAuthenticated, loading, user } = useAuth();
  const mustChange = user?.mustChangePassword ?? false;

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-tint border-t-transparent animate-spin" />
      </div>
    );
  }

  // Sync URL synchronously during render so AppShell mounts with the correct path.
  syncAuthUrl(isAuthenticated, mustChange);

  const scene = resolveScene(isAuthenticated, mustChange);
  if (scene === "auth") return <LoginPage />;
  if (scene === "change-pw") return <ChangePasswordPage />;
  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
