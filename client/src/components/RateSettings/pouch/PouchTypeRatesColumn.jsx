import IOSToggle from "../../ui/IOSToggle";
import { POUCH_TYPE_OPTIONS } from "../../../constants/pouchTypes";
import sizeLabel from "./sizeLabel";

export default function PouchTypeRatesColumn({
  selectedPouch,
  canEdit,
  rateDrafts,
  onChangeDraft,
  onCommitDraft,
  onToggleType,
}) {
  return (
    <section className="card overflow-hidden min-h-[22rem] flex flex-col">
      <div className="card-section border-b border-separator flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-label">Pouch Type Rates</p>
        <p className="text-xs text-label-3">
          {selectedPouch ? `Size: ${sizeLabel(selectedPouch)}` : "Select a pouch size"}
        </p>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
        {!selectedPouch ? (
          <div className="card-section text-sm text-label-3">Pick a pouch size to edit type rates</div>
        ) : (
          POUCH_TYPE_OPTIONS.map((typeDef) => {
            const typeState = selectedPouch.types?.[typeDef.value] ?? {
              price: 0,
              isAvailable: true,
            };
            const isAvailable = typeState.isAvailable !== false;
            const draftValue =
              rateDrafts[typeDef.value] ?? String(typeState.price ?? 0);

            return (
              <div
                key={typeDef.value}
                className="rounded-xl border border-separator/60 bg-background/40 overflow-hidden"
              >
                <div className="py-3 px-4 flex items-center gap-2">
                  <IOSToggle
                    on={isAvailable}
                    onToggle={() => onToggleType(typeDef.value, !isAvailable)}
                    disabled={!canEdit}
                  />
                  <span className="text-sm font-medium text-label flex-1">
                    {typeDef.label}
                  </span>
                  <div
                    className={`flex items-center input-base p-0 overflow-hidden w-44 shrink-0 ${!isAvailable ? "opacity-50" : ""}`}
                  >
                    <span className="px-2.5 text-label-3 text-sm border-r border-separator shrink-0 select-none">
                      ₹
                    </span>
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={draftValue}
                      onChange={(event) => onChangeDraft(typeDef.value, event.target.value)}
                      onBlur={(event) => onCommitDraft(typeDef.value, event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key === "Enter") {
                          event.preventDefault();
                          event.currentTarget.blur();
                        }
                      }}
                      disabled={!canEdit || !isAvailable}
                      className="flex-1 bg-transparent px-2 py-2 text-sm text-left outline-none input-no-spinner w-0 tabular-nums"
                    />
                    <span className="px-2 text-label-3 text-xs shrink-0">per kg</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
