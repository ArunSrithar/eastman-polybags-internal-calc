import { LINE_ITEMS } from "../../constants/jobCost";

/**
 * calculateJobCost(form)
 *
 * Formula:
 *   Cost of Job (₹/kg) = Total Amount / Dispatch Weight
 *
 * Where:
 *   Total Amount = Σ amount_i  for each ENABLED line item
 *   Materials/Lamination/Slitting/Pouch: amount_i = qty_i × price_i
 *   Printing: amount = (normalQty × colorCount × colorRate) + (metallicQty × metallicRate,
 *             if enabled) + (mattQty × mattRate, if enabled) — each component has its own
 *             manually entered weight
 *   Packing/Transport: amount_i = price_i × finishedWeight
 *
 * Tax is backed out of the resulting Cost of Job (not added on top): the entered
 * rate is treated as tax-inclusive, so costOfJobExclTax = costOfJob / (1 + tax/100).
 *
 * Returns null if dispatchWeight is 0, no items are enabled, or total is 0.
 */
export function calculateJobCost(form) {
  const finishedWeight = parseFloat(form.finishedWeight) || 0;

  // First pass: build line items with hasQty amounts
  const lineItems = LINE_ITEMS.map((def) => {
    const item = form.items?.[def.key] ?? {};
    const enabled = item.enabled ?? true;
    const price = parseFloat(item.price) || 0;

    let amount = 0;
    let qty = def.hasQty ? parseFloat(item.qty) || 0 : null;

    if (enabled && def.key === "printingCharges") {
      const normalColors = parseInt(item.normalColors) || 0;
      const normalRate = parseFloat(item.normalColorPrice) || 0;
      const normalQty = parseFloat(item.normalColorQty) || 0;
      const normalAmount = normalQty * normalColors * normalRate;

      const metallicRate = item.metallicEnabled ? parseFloat(item.metallicColorPrice) || 0 : 0;
      const metallicQty = item.metallicEnabled ? parseFloat(item.metallicColorQty) || 0 : 0;
      const metallicAmount = metallicQty * metallicRate;

      const mattRate = item.mattFinish ? parseFloat(item.mattFinishPrice) || 0 : 0;
      const mattQty = item.mattFinish ? parseFloat(item.mattFinishQty) || 0 : 0;
      const mattAmount = mattQty * mattRate;

      amount = normalAmount + metallicAmount + mattAmount;
      qty = null;
    } else if (enabled && def.hasQty) {
      amount = qty * price;
    }

    return {
      key: def.key,
      label: def.label,
      hasQty: def.hasQty,
      isPercentage: def.isPercentage ?? false,
      enabled,
      qty,
      price: def.key === "printingCharges" ? null : price,
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

  // Second pass: flat items use per-kg rates × finished weight
  for (const item of lineItems) {
    if (!item.hasQty && item.enabled) {
      item.amount = item.price * finishedWeight;
    }
  }

  const enabledItems = lineItems.filter((i) => i.enabled);
  const flatTotal = enabledItems.reduce((s, i) => s + i.amount, 0);
  const rawTotalAmount = flatTotal + wastageAmount;
  const dispatchWeight = parseFloat(form.dispatchWeight) || 0;

  if (enabledItems.length === 0 || rawTotalAmount === 0) {
    return null;
  }

  const totalAmount = rawTotalAmount;
  const costOfJob = dispatchWeight > 0 ? totalAmount / dispatchWeight : null;

  const taxPercent = parseFloat(form.tax) || 0;
  const taxDivisor = 1 + taxPercent / 100;
  const costOfJobExclTax = costOfJob != null ? costOfJob / taxDivisor : null;
  const taxAmountPerKg = costOfJob != null ? costOfJob - costOfJobExclTax : null;

  return {
    lineItems,
    enabledItems,
    wastagePercent,
    wastageAmount,
    totalAmount,
    finishedWeight,
    dispatchWeight,
    costOfJob,
    taxPercent,
    taxAmountPerKg,
    costOfJobExclTax,
  };
}
