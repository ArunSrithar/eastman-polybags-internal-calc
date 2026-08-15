import { fmt } from "../../../utils/format";
import { compareDimensions } from "../../../utils/dimensionUtils";

export function getFlexoCompanyOptions(companies) {
  return (companies ?? [])
    .filter((company) => company.isActive !== false)
    .map((company) => ({ value: company.name, label: company.name }));
}

export function makeFlexoChargeOptionRenderer(companies, chargeKey) {
  return (opt) => {
    const value = typeof opt === "string" ? opt : (opt?.value ?? "");
    const label = typeof opt === "string" ? opt : (opt?.label ?? value);
    const company = companies?.find((entry) => entry.name === value);
    const price = Number(company?.charges?.[chargeKey]?.price ?? 0);

    return (
      <span className="flex items-center justify-between gap-4">
        <span className="truncate">{label}</span>
        <span className="text-xs text-label-3 tabular-nums shrink-0">
          {`₹${fmt(price)}`}
        </span>
      </span>
    );
  };
}

export function findFlexoCompanyByName(companies, name) {
  return (companies ?? []).find((c) => c.name === name);
}

export function getCompanyCoverSizeOptions(companyCoverSizes, companyId) {
  if (!companyId) return [];
  return (companyCoverSizes?.[companyId] ?? [])
    .filter((cs) => cs.enabled !== false)
    .map((cs) => cs.coverSize)
    .sort(compareDimensions);
}
