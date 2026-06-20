import SelectField from "../../../form/SelectField";
import ToggleField from "../../../form/ToggleField";

export default function OptionalChargeRow({
  label,
  enabled,
  onToggle,
  priceValue,
  onPriceChange,
  priceOptions,
}) {
  return (
    <>
      <ToggleField
        label={label}
        on={enabled}
        onToggle={onToggle}
      />
      {enabled ? (
        <SelectField
          label={`${label} Price`}
          placeholder="₹/kg"
          storageKey={`flexo-${label.toLowerCase()}-price`}
          defaultOptions={priceOptions}
          value={priceValue}
          onChange={onPriceChange}
          creatable
        />
      ) : null}
    </>
  );
}
