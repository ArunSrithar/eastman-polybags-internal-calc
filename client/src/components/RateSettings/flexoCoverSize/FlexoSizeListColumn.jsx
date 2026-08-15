import { CheckIcon, CloseIcon, PlusIcon, TrashIcon } from "../../ui/Icons";
import IOSToggle from "../../ui/IOSToggle";
import { formatDimension } from "../../../utils/dimensionUtils";

export default function FlexoSizeListColumn({
  canEdit,
  selectedCompany,
  coverSizes,
  selectedCoverSizeId,
  onSelectCoverSize,
  onToggleCoverSize,
  onDeleteCoverSize,
  addingSize,
  onStartAdd,
  widthInput,
  heightInput,
  onWidthChange,
  onHeightChange,
  onSizeInputKeyDown,
  onConfirmAdd,
  onCancelAdd,
}) {
  return (
    <section className="card overflow-hidden min-h-[22rem] flex flex-col">
      <div className="card-section border-b border-separator flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-label">Cover Sizes</p>
        <div className="flex items-center gap-2 min-w-0">
          {selectedCompany ? (
            <span className="text-xs text-label-3 truncate">
              {selectedCompany.name}
            </span>
          ) : null}
          {canEdit ? (
            <button
              type="button"
              className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
              onClick={onStartAdd}
              disabled={!selectedCompany}
            >
              <PlusIcon className="size-3.5" />
              Add
            </button>
          ) : null}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
        {addingSize ? (
          <div className="rounded-lg border border-separator/60 bg-background/40 px-3 py-2">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={widthInput}
                onChange={(event) => onWidthChange(event.target.value)}
                onKeyDown={onSizeInputKeyDown}
                placeholder="W"
                autoFocus
                className="input-base py-1.5 text-sm flex-1 min-w-0"
                disabled={!canEdit || !selectedCompany}
              />
              <span className="text-label-3">x</span>
              <input
                type="text"
                value={heightInput}
                onChange={(event) => onHeightChange(event.target.value)}
                onKeyDown={onSizeInputKeyDown}
                placeholder="H"
                className="input-base py-1.5 text-sm flex-1 min-w-0"
                disabled={!canEdit || !selectedCompany}
              />
              <button
                type="button"
                onClick={onConfirmAdd}
                className="table-action-btn text-tint hover:bg-tint/10 shrink-0"
                disabled={!canEdit || !selectedCompany}
                aria-label="Create cover size"
                title="Create (Enter)"
              >
                <CheckIcon className="size-3.5" />
              </button>
              <button
                type="button"
                onClick={onCancelAdd}
                className="table-action-btn text-label-3 hover:bg-fill shrink-0"
                aria-label="Cancel"
                title="Cancel (Esc)"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        ) : null}

        {coverSizes.length === 0 ? (
          <div className="card-section text-sm text-label-3">
            No cover sizes for this company
          </div>
        ) : (
          coverSizes.map((coverSize) => {
            const selected = coverSize.id === selectedCoverSizeId;
            const enabled = coverSize.enabled !== false;
            return (
              <div
                key={coverSize.id}
                className={`rounded-lg px-3 py-2 transition-colors ${selected ? "bg-tint/10" : "hover:bg-fill"}`}
              >
                <div className="flex items-center gap-2">
                  <IOSToggle
                    on={enabled}
                    onToggle={() => onToggleCoverSize(coverSize.id, !enabled)}
                    disabled={!canEdit}
                  />
                  <button
                    type="button"
                    onClick={() => onSelectCoverSize(coverSize.id)}
                    className={`text-sm font-medium text-left flex-1 min-w-0 truncate cursor-pointer ${selected ? "text-tint" : enabled ? "text-label" : "text-label-3"}`}
                  >
                    {formatDimension(coverSize.coverSize)}
                  </button>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => onDeleteCoverSize(coverSize.id)}
                      className="table-action-btn text-red-500 hover:bg-red-500/10 shrink-0"
                      aria-label={`Delete ${coverSize.coverSize}`}
                    >
                      <TrashIcon />
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
