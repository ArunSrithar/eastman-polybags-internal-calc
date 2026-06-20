import ToggleField from "../../../form/ToggleField";
import SelectField from "../../../form/SelectField";

export default function JobCostItemRow({
  item,
  enabled,
  onToggle,
  qtyValue,
  onQtyChange,
  priceValue,
  onPriceChange,
  amountValue,
  onAmountChange,
  showQtyPrice,
  qtyPlaceholder,
  pricePlaceholder,
  amountPlaceholder,
  storageKeyPrefix,
}) {
  return (
    <>
      <ToggleField
        label={item.label}
        on={enabled}
        onToggle={onToggle}
      />
      {enabled ? (
        <>
          {showQtyPrice ? (
            <>
              <SelectField
                label={`${item.label} Qty`}
                placeholder={qtyPlaceholder}
                storageKey={`${storageKeyPrefix}-${item.key}-qty`}
                defaultOptions={["0", "1", "2", "5", "10"]}
                value={qtyValue}
                onChange={onQtyChange}
                creatable
              />
              <SelectField
                label={`${item.label} Price`}
                placeholder={pricePlaceholder}
                storageKey={`${storageKeyPrefix}-${item.key}-price`}
                defaultOptions={["0", "50", "100", "150", "200"]}
                value={priceValue}
                onChange={onPriceChange}
                creatable
              />
            </>
          ) : (
            <SelectField
              label={`${item.label} Amount`}
              placeholder={amountPlaceholder}
              storageKey={`${storageKeyPrefix}-${item.key}-amount`}
              defaultOptions={["0", "100", "500", "1000"]}
              value={amountValue}
              onChange={onAmountChange}
              creatable
            />
          )}
        </>
      ) : null}
    </>
  );
}
