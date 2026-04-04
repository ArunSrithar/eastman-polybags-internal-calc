import { useState, useEffect, useCallback } from "react";
import { CheckIcon, XMarkIcon } from "./Icons";

/**
 * Toast — a lightweight self-dismissing notification.
 *
 * Usage:
 *   const [toast, showToast] = useToast();
 *   showToast("Quote saved", "Details…");           // success (default)
 *   showToast("Update Failed", "Details…", "error"); // error
 *   return <>{toast}</>
 */

const VARIANTS = {
  success: {
    iconBg: "bg-green-500/15",
    iconColor: "text-green-500",
    Icon: CheckIcon,
  },
  error: {
    iconBg: "bg-red-500/15",
    iconColor: "text-red-500",
    Icon: XMarkIcon,
  },
};

function Toast({ title, message, variant = "success", onDone }) {
  const [phase, setPhase] = useState("enter"); // enter → visible → exit → done
  const { iconBg, iconColor, Icon } = VARIANTS[variant] ?? VARIANTS.success;

  useEffect(() => {
    // Trigger slide-in on next frame
    const enterTimer = requestAnimationFrame(() => setPhase("visible"));

    // Start exit after 2.5s
    const exitTimer = setTimeout(() => setPhase("exit"), 2500);

    // Remove after exit animation
    const doneTimer = setTimeout(onDone, 2900);

    return () => {
      cancelAnimationFrame(enterTimer);
      clearTimeout(exitTimer);
      clearTimeout(doneTimer);
    };
  }, [onDone]);

  const translateX =
    phase === "enter"
      ? "translate-x-[calc(100%+1.5rem)]"
      : phase === "exit"
        ? "translate-x-[calc(100%+1.5rem)]"
        : "translate-x-0";

  return (
    <div
      className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-2xl w-80
        bg-background/60 dark:bg-background-2/60 backdrop-blur-2xl backdrop-saturate-200
        border border-separator/30 dark:border-white/10 shadow-lg
        flex items-center gap-3
        transition-all duration-400 ease-out
        ${translateX} ${phase === "exit" ? "opacity-0" : "opacity-100"}`}
    >
      <span
        className={`shrink-0 size-8 rounded-full flex items-center justify-center ${iconBg} ${iconColor}`}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-label truncate">{title}</p>
        <p className="text-xs text-label-2 mt-0.5 leading-snug">{message}</p>
      </div>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((title, message, variant = "success") => {
    setToast({ title, message, variant, key: Date.now() });
  }, []);

  const element = toast ? (
    <Toast
      key={toast.key}
      title={toast.title}
      message={toast.message}
      variant={toast.variant}
      onDone={() => setToast(null)}
    />
  ) : null;

  return [element, showToast];
}
