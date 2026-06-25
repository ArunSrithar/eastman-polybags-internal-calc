import { CheckIcon, PlusIcon, TrashIcon } from "../../ui/Icons";
import sizeLabel from "./sizeLabel";

export default function PouchSizesColumn({
  canEdit,
  selectedCompany,
  pouches,
  selectedPouchId,
  onSelectPouch,
  onDeletePouch,
  addingSize,
  onStartAdd,
  widthInput,
  heightInput,
  onWidthChange,
  onHeightChange,
  onSizeInputKeyDown,
  onConfirmAdd,
}) {
  return (
    <section className="card overflow-hidden min-h-[22rem] flex flex-col">
      <div className="card-section border-b border-separator flex items-center justify-between gap-2">
        <p className="text-sm font-semibold text-label">Pouch Sizes</p>
        <div className="flex items-center gap-2 min-w-0">
          {selectedCompany ? (
            <span className="text-xs text-label-3 truncate">{selectedCompany.name}</span>
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
                className="input-base py-1.5 text-sm"
                disabled={!canEdit || !selectedCompany}
              />
              <span className="text-label-3">x</span>
              <input
                type="text"
                value={heightInput}
                onChange={(event) => onHeightChange(event.target.value)}
                onKeyDown={onSizeInputKeyDown}
                placeholder="H"
                className="input-base py-1.5 text-sm"
                disabled={!canEdit || !selectedCompany}
              />
              <button
                type="button"
                onClick={onConfirmAdd}
                className="table-action-btn text-tint hover:bg-tint/10 shrink-0"
                disabled={!canEdit || !selectedCompany}
                aria-label="Create pouch size"
                title="Create (Enter)"
              >
                <CheckIcon className="size-3.5" />
              </button>
            </div>
          </div>
        ) : null}

        {pouches.length === 0 ? (
          <div className="card-section text-sm text-label-3">No pouch sizes for this company</div>
        ) : (
          pouches.map((pouch) => {
            const selected = pouch.id === selectedPouchId;
            return (
              <div
                key={pouch.id}
                className={`rounded-lg px-3 py-2 transition-colors ${selected ? "bg-tint/10 text-tint" : "hover:bg-fill text-label"}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectPouch(pouch.id)}
                    className={`text-sm font-medium text-left flex-1 ${selected ? "text-tint" : "text-label"}`}
                  >
                    {sizeLabel(pouch)}
                  </button>
                  {canEdit ? (
                    <button
                      type="button"
                      onClick={() => onDeletePouch(pouch.id)}
                      className="table-action-btn text-red-500 hover:bg-red-500/10"
                      aria-label={`Delete ${sizeLabel(pouch)}`}
                    >
                      <TrashIcon className="size-3.5" />
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
