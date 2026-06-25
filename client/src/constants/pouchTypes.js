export const POUCH_TYPE_OPTIONS = [
  { value: "normalPouch", label: "Normal Pouch" },
  { value: "normalWithZipLock", label: "Normal with Zip lock" },
  { value: "standUpPouch", label: "Stand-Up Pouch" },
  { value: "standUpWithZipLock", label: "Stand-Up with Zip lock" },
];

export const POUCH_TYPE_LABELS = POUCH_TYPE_OPTIONS.reduce((acc, option) => {
  acc[option.value] = option.label;
  return acc;
}, {});

export function getPouchTypeLabel(typeKey) {
  return POUCH_TYPE_LABELS[typeKey] ?? "Pouch";
}

export function makeDefaultPouchTypes() {
  return {
    normalPouch: { price: 0, isAvailable: true },
    normalWithZipLock: { price: 0, isAvailable: true },
    standUpPouch: { price: 0, isAvailable: true },
    standUpWithZipLock: { price: 0, isAvailable: true },
  };
}
