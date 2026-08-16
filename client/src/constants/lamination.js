/**
 * Lamination types, shared by both Gravure calculators so the pill labels and
 * stored values stay in step.
 *
 * "none" is the off state — selecting it is what disables the charge, which is
 * why neither screen has a separate lamination enable toggle.
 */
export const LAMINATION_OPTIONS = [
  { value: "none", label: "None" },
  { value: "single", label: "Single" },
  { value: "double", label: "Double" },
];
