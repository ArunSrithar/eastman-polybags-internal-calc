import { useAuth, AuthProvider } from "./context/AuthContext";
import AppShell from "./components/layout/AppShell";
import LoginPage from "./components/auth/LoginPage";
import ChangePasswordPage from "./components/auth/ChangePasswordPage";

function AuthGate() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-6 h-6 rounded-full border-2 border-tint border-t-transparent animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return <LoginPage />;
  if (user?.mustChangePassword) return <ChangePasswordPage />;
  return <AppShell />;
}

export default function App() {
  return (
    <AuthProvider>
      <AuthGate />
    </AuthProvider>
  );
}
