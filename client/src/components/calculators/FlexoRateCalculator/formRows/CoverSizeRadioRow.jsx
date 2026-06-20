import RadioField from "../../../form/RadioField";

export default function CoverSizeRadioRow({
  label,
  options,
  value,
  onChange,
}) {
  return (
    <RadioField
      name={label.replace(/\s+/g, "-").toLowerCase()}
      label={label}
      options={options}
      value={value}
      onChange={onChange}
    />
  );
}
