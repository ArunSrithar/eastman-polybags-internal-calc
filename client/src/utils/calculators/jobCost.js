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
 *   Items 9–10: amount_i = price_i  (flat charge, no qty)
 *
 * Returns null if dispatchWeight is 0, no items are enabled, or total is 0.
 */
export function calculateJobCost(form) {
  const lineItems = LINE_ITEMS.map((def) => {
    const item = form.items?.[def.key] ?? {};
    const enabled = item.enabled ?? true;
    const price = parseFloat(item.price) || 0;

    let amount = 0;
    if (enabled) {
      if (def.hasQty) {
        const qty = parseFloat(item.qty) || 0;
        amount = qty * price;
      } else {
        amount = price;
      }
    }

    return {
      key: def.key,
      label: def.label,
      hasQty: def.hasQty,
      enabled,
      qty: def.hasQty ? parseFloat(item.qty) || 0 : null,
      price,
      amount,
    };
  });

  const enabledItems = lineItems.filter((i) => i.enabled);
  const totalAmount = enabledItems.reduce((s, i) => s + i.amount, 0);
  const dispatchWeight = parseFloat(form.dispatchWeight) || 0;
  const finishedWeight = parseFloat(form.finishedWeight) || 0;

  if (enabledItems.length === 0 || totalAmount === 0) {
    return null;
  }

  return {
    lineItems,
    enabledItems,
    totalAmount,
    finishedWeight,
    dispatchWeight,
    costOfJob: dispatchWeight > 0 ? totalAmount / dispatchWeight : null,
  };
}
