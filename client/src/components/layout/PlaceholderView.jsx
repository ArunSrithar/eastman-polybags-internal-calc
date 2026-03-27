import { VIEW_META } from "../../constants/navigation";

const DEFAULT_META = {
  title: "Coming Soon",
  description: "This section is under development.",
};

export default function PlaceholderView({ viewId }) {
  const meta = VIEW_META[viewId] || DEFAULT_META;

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center max-w-sm">
        <div className="mx-auto mb-4 size-12 rounded-2xl bg-fill-3 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="size-6 text-label-3"
          >
            <rect x="3" y="3" width="18" height="18" rx="3" />
            <path d="M9 12h6M12 9v6" />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-label">{meta.title}</h2>
        <p className="text-sm text-label-2 mt-1">{meta.description}</p>
        <span className="inline-block mt-4 text-xs font-medium text-label-3 bg-fill-4 rounded-full px-3 py-1">
          Coming soon
        </span>
      </div>
    </div>
  );
}
