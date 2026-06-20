import { DEFAULT_GRAVURE_COMPANY_NAME } from "../../../utils/calculators/gravureRate";

export function isOwnGravureCompany(name) {
  if (!name) return false;
  return (
    String(name).trim().toLowerCase() ===
    DEFAULT_GRAVURE_COMPANY_NAME.toLowerCase()
  );
}

export function visibleCompanyName(name) {
  if (!name || isOwnGravureCompany(name)) return null;
  return name;
}
