export default function PouchCompanyColumn({
  companies,
  selectedCompanyId,
  onSelectCompany,
}) {
  return (
    <section className="card overflow-hidden min-h-[22rem] flex flex-col">
      <div className="card-section border-b border-separator">
        <p className="text-sm font-semibold text-label">Companies</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-2 space-y-1">
        {companies.length === 0 ? (
          <div className="card-section text-sm text-label-3">No companies found</div>
        ) : (
          companies.map((company) => {
            const selected = company.id === selectedCompanyId;
            return (
              <button
                key={company.id}
                type="button"
                className={`w-full text-left rounded-lg px-3 py-2.5 transition-colors ${selected ? "bg-tint/10 text-tint" : "hover:bg-fill text-label"}`}
                onClick={() => onSelectCompany(company.id)}
              >
                <span className="text-sm font-medium truncate">{company.name}</span>
              </button>
            );
          })
        )}
      </div>
    </section>
  );
}
