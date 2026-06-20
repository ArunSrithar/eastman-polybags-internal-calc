import SelectField from "../../../form/SelectField";

export default function MaterialPriceQuantityRow({
  materialLabel,
  priceValue,
  onPriceChange,
  qtyValue,
  onQtyChange,
  qtyDisabled,
}) {
  return (
    <>
      <SelectField
        label={`${materialLabel} Price`}
        placeholder="₹/kg"
        storageKey={`flexo-${materialLabel.toLowerCase()}-price`}
        defaultOptions={["0", "50", "100", "150", "200"]}
        value={priceValue}
        onChange={onPriceChange}
        creatable
      />
      <SelectField
        label={`${materialLabel} Qty`}
        placeholder="kg"
        storageKey={`flexo-${materialLabel.toLowerCase()}-qty`}
        defaultOptions={["0", "1", "2", "5", "10"]}
        value={qtyValue}
        onChange={onQtyChange}
        disabled={qtyDisabled}
        creatable
      />
    </>
  );
}
