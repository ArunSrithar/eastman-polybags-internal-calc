import { Children } from "react";

/**
 * FormSection — a .card wrapper with optional section-header title.
 * Automatically inserts .divider between children.
 *
 * Props:
 *   title     string|null   optional section header text (e.g. "Materials")
 *   children  ReactNode     field components to render inside the card
 */
export default function FormSection({ title, children }) {
  const items = Children.toArray(children);

  return (
    <div className="card">
      {title ? (
        <>
          <div className="card-section pb-2">
            <p className="section-header">{title}</p>
          </div>
          <div className="divider mx-3" />
        </>
      ) : null}

      {items.map((child, idx) => (
        <div key={idx}>
          {idx > 0 ? <div className="divider mx-3" /> : null}
          {child}
        </div>
      ))}
    </div>
  );
}
