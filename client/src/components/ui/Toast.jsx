import { useState, useEffect, useCallback } from "react";

/**
 * Toast — a lightweight self-dismissing notification.
 *
 * Usage:
 *   const [toast, showToast] = useToast();
 *   showToast("Quote saved successfully!");
 *   return <>{toast}</>
 */

function Toast({ title, message, onDone }) {
  const [phase, setPhase] = useState("enter"); // enter → visible → exit → done

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
      className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-2xl w-80
        bg-background/60 dark:bg-background-2/60 backdrop-blur-2xl backdrop-saturate-200
        border border-separator/30 dark:border-white/10 shadow-lg
        text-sm font-medium text-label
        transition-all duration-400 ease-out
        ${translateX} ${phase === "exit" ? "opacity-0" : "opacity-100"}`}
    >
      <p className="font-semibold text-label truncate">{title}</p>
      <p className="text-label-2 mt-0.5">{message}</p>
    </div>
  );
}

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((title, message) => {
    setToast({ title, message, key: Date.now() });
  }, []);

  const element = toast ? (
    <Toast
      key={toast.key}
      title={toast.title}
      message={toast.message}
      onDone={() => setToast(null)}
    />
  ) : null;

  return [element, showToast];
}
