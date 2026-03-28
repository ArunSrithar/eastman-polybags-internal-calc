/**
 * FormStack — outer wrapper for a calculator form.
 * Renders children in a vertical stack with consistent gap.
 */
export default function FormStack({ children }) {
  return <div className="flex flex-col gap-4">{children}</div>;
}
