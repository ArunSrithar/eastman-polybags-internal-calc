/**
 * GlassSeparator — translucent divider for glass/frosted surfaces.
 * Uses fill-2 border in both light and dark mode.
 *
 * Props:
 *   className  string  additional classes (e.g. "mx-2 mt-4" for inset)
 */
export default function GlassSeparator({ className = "" }) {
  return <div className={`divider ${className}`} role="separator" />;
}
