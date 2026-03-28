import {
  SaveIcon,
  PrintIcon,
  ResetIcon,
  DeleteIcon,
  ExportIcon,
} from "../ui/Icons";

/**
 * CalculatorHeader — top bar for calculator and saved-quote views.
 *
 * Left side:  icon (bg-grouped-background-2) + title + subtitle
 * Right side: action buttons (reset, save, print, export, delete) — rounded-full pill style
 *
 * Props:
 *   icon        Component   calculator icon (e.g. GravureIcon)
 *   title       string      page title
 *   subtitle    string      short description
 *   onSave      fn|null     save handler — button hidden when null
 *   onPrint     fn|null     print handler — button hidden when null
 *   onExport    fn|null     export handler — button hidden when null
 *   onReset     fn|null     reset handler — button hidden when null
 *   onDelete    fn|null     delete handler — button hidden when null
 *   saveDisabled boolean    disable the save button (e.g. form incomplete)
 */
export default function CalculatorHeader({
  icon: Icon,
  title,
  subtitle,
  onSave = null,
  onPrint = null,
  onExport = null,
  onReset = null,
  onDelete = null,
  saveDisabled = false,
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      {/* Left — icon + title block */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="shrink-0 size-10 flex items-center justify-center rounded-xl bg-grouped-background-2 text-tint">
          <Icon className="size-5" />
        </span>
        <div className="min-w-0">
          <h1 className="text-lg font-bold text-label leading-tight truncate">
            {title}
          </h1>
          <p className="text-xs text-label-2 mt-0.5 truncate">{subtitle}</p>
        </div>
      </div>

      {/* Right — action buttons */}
      <div className="flex items-center gap-3 shrink-0">
        {onSave ? (
          <button
            type="button"
            onClick={onSave}
            disabled={saveDisabled}
            className="btn-primary btn-pill disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <SaveIcon className="size-4" />
            <span>Save</span>
          </button>
        ) : null}

        {onPrint ? (
          <button
            type="button"
            onClick={onPrint}
            className="btn-secondary btn-pill"
          >
            <PrintIcon className="size-4" />
            <span>Print</span>
          </button>
        ) : null}

        {onExport ? (
          <button
            type="button"
            onClick={onExport}
            className="btn-secondary btn-pill"
          >
            <ExportIcon className="size-4" />
            <span>Export</span>
          </button>
        ) : null}

        {onReset ? (
          <button
            type="button"
            onClick={onReset}
            className="btn-danger btn-pill"
          >
            <ResetIcon className="size-4" />
            <span>Reset</span>
          </button>
        ) : null}

        {onDelete ? (
          <button
            type="button"
            onClick={onDelete}
            className="btn-danger btn-pill"
            aria-label="Delete calculation"
          >
            <DeleteIcon className="size-4" />
            <span>Delete</span>
          </button>
        ) : null}
      </div>
    </div>
  );
}
