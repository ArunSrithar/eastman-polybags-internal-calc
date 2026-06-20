import { GravureIcon } from "../../ui/Icons";
import GravureResult from "./GravureResult";
import GravurePrintLayout from "./GravurePrintLayout";
import { calculateGravureRate } from "../../../utils/calculators/gravureRate";
import SavedQuotesView from "../SavedQuotesView";
import {
  useGravureSettings,
  buildRatesFromSettings,
} from "../../../context/GravureSettingsContext";

export default function GravureSavedQuotes() {
  const { settings, companies } = useGravureSettings();
  const rates = settings ? buildRatesFromSettings(settings) : undefined;

  return (
    <SavedQuotesView
      calcKey="gravure"
      icon={GravureIcon}
      title="Gravure — Saved Quotes"
      calculateRate={(form) => calculateGravureRate(form, rates, companies)}
      ResultComponent={GravureResult}
      PrintComponent={GravurePrintLayout}
    />
  );
}
