import { GravureIcon } from "../../ui/Icons";
import GravureResult from "./GravureResult";
import GravurePrintLayout from "./GravurePrintLayout";
import { calculateGravureRate } from "../../../utils/calculators/gravureRate";
import SavedQuotesView from "../SavedQuotesView";

export default function GravureSavedQuotes() {
  return (
    <SavedQuotesView
      calcKey="gravure"
      icon={GravureIcon}
      title="Gravure — Saved Quotes"
      calculateRate={calculateGravureRate}
      ResultComponent={GravureResult}
      PrintComponent={GravurePrintLayout}
    />
  );
}
