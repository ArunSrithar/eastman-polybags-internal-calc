/**
 * GlassSeparator — translucent divider for glass/frosted surfaces.
 * Uses black/10 in light mode, white/10 in dark mode.
 *
 * Props:
 *   className  string  additional classes (e.g. "mx-6 mt-4" for inset)
 */
export default function GlassSeparator({ className = "" }) {
  return (
    <div
      className={`border-t border-black/10 dark:border-white/10 ${className}`}
      role="separator"
    />
  );
}
