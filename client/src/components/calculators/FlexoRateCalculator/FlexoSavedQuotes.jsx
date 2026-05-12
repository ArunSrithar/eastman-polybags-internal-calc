import { FlexoIcon } from "../../ui/Icons";
import FlexoResult from "./FlexoResult";
import FlexoPrintLayout from "./FlexoPrintLayout";
import { calculateFlexoRate } from "../../../utils/calculators/flexoRateCalc";
import { fmt } from "../../../utils/format";
import SavedQuotesView from "../SavedQuotesView";
import {
  useFlexoSettings,
  buildFlexoRatesFromSettings,
} from "../../../context/FlexoSettingsContext";

const formatFlexoPrice = (q) => "₹" + fmt(q.pricePerKg);

export default function FlexoSavedQuotes() {
  const { settings } = useFlexoSettings();
  const rates = settings ? buildFlexoRatesFromSettings(settings) : undefined;

  return (
    <SavedQuotesView
      calcKey="flexo-rate-calc"
      icon={FlexoIcon}
      title="Flexo — Saved Quotes"
      calculateRate={(form) => calculateFlexoRate(form, rates)}
      ResultComponent={FlexoResult}
      PrintComponent={FlexoPrintLayout}
      formatPrice={formatFlexoPrice}
    />
  );
}
