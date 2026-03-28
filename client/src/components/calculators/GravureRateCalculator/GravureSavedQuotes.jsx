import { GravureIcon } from "../../ui/Icons";
import { SAMPLE_QUOTES } from "../../../constants/gravureRates";
import GravureResult from "./GravureResult";
import { calculateGravureRate } from "../../../utils/calculators/gravureRate";
import SavedQuotesView from "../SavedQuotesView";

export default function GravureSavedQuotes() {
  return (
    <SavedQuotesView
      calcKey="gravure"
      icon={GravureIcon}
      title="Gravure — Saved Quotes"
      sampleQuotes={SAMPLE_QUOTES}
      calculateRate={calculateGravureRate}
      ResultComponent={GravureResult}
    />
  );
}
