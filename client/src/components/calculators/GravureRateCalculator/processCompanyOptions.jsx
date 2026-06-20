import { fmt } from "../../../utils/format";

const PROCESS_RATE_UNITS = {
  normalColor: "/color",
  metallicColor: "/color",
  mattFinish: "/kg",
  singleLamination: "/kg",
  doubleLamination: "/kg",
  slitting: "/kg",
};

export function getProcessCompanyOptions(companies, processKey) {
  return (companies ?? [])
    .filter((company) => company.isActive !== false)
    .filter(
      (company) => company?.processes?.[processKey]?.isAvailable !== false,
    )
    .map((company) => ({
      value: company.name,
      label: company.name,
    }));
}

export function makeCompanyOptionRenderer(companies, processKey) {
  return (opt) => {
    const value = typeof opt === "string" ? opt : opt?.value ?? "";
    const label = typeof opt === "string" ? opt : opt?.label ?? value;
    const company = companies?.find((entry) => entry.name === value);
    const price = Number(company?.processes?.[processKey]?.price ?? 0);

    return (
      <span className="flex items-center justify-between gap-4">
        <span className="truncate">{label}</span>
        <span className="text-xs text-label-3 tabular-nums shrink-0">
          {`₹${fmt(price)}${PROCESS_RATE_UNITS[processKey] ?? ""}`}
        </span>
      </span>
    );
  };
}
