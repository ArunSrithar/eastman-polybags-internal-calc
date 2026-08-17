export const DEFAULT_FLEXO_COMPANY_NAME = "Eastman Color Printers";

export function isOwnFlexoCompany(name) {
  if (!name) return false;
  return (
    String(name).trim().toLowerCase() ===
    DEFAULT_FLEXO_COMPANY_NAME.toLowerCase()
  );
}

export function visibleFlexoCompanyName(name) {
  if (!name || isOwnFlexoCompany(name)) return null;
  return name;
}
