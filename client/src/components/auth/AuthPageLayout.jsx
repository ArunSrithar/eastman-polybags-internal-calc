/**
 * AuthPageLayout — shared outer wrapper for login/change-password screens.
 * Renders the grid background, centers content vertically + horizontally.
 */
export default function AuthPageLayout({ children }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      {/* Grid background — matches app body pattern */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(var(--color-separator) 1px, transparent 1px), linear-gradient(90deg, var(--color-separator) 1px, transparent 1px)",
          backgroundSize: "5em 5em",
          opacity: 0.5,
        }}
      />
      <div className="relative w-full max-w-sm">{children}</div>
    </div>
  );
}
