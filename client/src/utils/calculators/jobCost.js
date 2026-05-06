import { LINE_ITEMS } from "../../constants/jobCost";

/**
 * calculateJobCost(form)
 *
 * Formula:
 *   Cost of Job (₹/kg) = Total Amount / Dispatch Weight
 *
 * Where:
 *   Total Amount = Σ amount_i  for each ENABLED line item
 *   Items 1–8:  amount_i = qty_i × price_i
 *   Items 9–11: amount_i = price_i  (flat charge, no qty)
 *
 * Returns null if dispatchWeight is 0, no items are enabled, or total is 0.
 */
export function calculateJobCost(form) {
  // First pass: build line items with hasQty amounts
  const lineItems = LINE_ITEMS.map((def) => {
    const item = form.items?.[def.key] ?? {};
    const enabled = item.enabled ?? true;
    const price = parseFloat(item.price) || 0;

    let amount = 0;
    if (enabled && def.hasQty) {
      const qty = parseFloat(item.qty) || 0;
      amount = qty * price;
    }

    return {
      key: def.key,
      label: def.label,
      hasQty: def.hasQty,
      isPercentage: def.isPercentage ?? false,
      enabled,
      qty: def.hasQty ? parseFloat(item.qty) || 0 : null,
      price,
      amount,
    };
  });

  // Base total = materials + charges (hasQty items) only
  const baseTotal = lineItems
    .filter((i) => i.hasQty && i.enabled)
    .reduce((s, i) => s + i.amount, 0);

  // Wastage: standalone % field, applied to base total
  const wastagePercent = parseFloat(form.wastage) || 0;
  const wastageAmount = (wastagePercent / 100) * baseTotal;

  // Second pass: flat items — all flat (packing, transport)
  for (const item of lineItems) {
    if (!item.hasQty && item.enabled) {
      item.amount = item.price;
    }
  }

  const enabledItems = lineItems.filter((i) => i.enabled);
  const flatTotal = enabledItems.reduce((s, i) => s + i.amount, 0);
  const totalAmount = flatTotal + wastageAmount;
  const dispatchWeight = parseFloat(form.dispatchWeight) || 0;
  const finishedWeight = parseFloat(form.finishedWeight) || 0;

  if (enabledItems.length === 0 || totalAmount === 0) {
    return null;
  }

  return {
    lineItems,
    enabledItems,
    wastagePercent,
    wastageAmount,
    totalAmount,
    finishedWeight,
    dispatchWeight,
    costOfJob: dispatchWeight > 0 ? totalAmount / dispatchWeight : null,
  };
}
