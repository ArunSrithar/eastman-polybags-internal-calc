import { FlexoIcon } from "../../ui/Icons";
import { SAMPLE_QUOTES } from "../../../constants/flexoRateCalc";
import FlexoResult from "./FlexoResult";
import { calculateFlexoRate } from "../../../utils/calculators/flexoRateCalc";
import { fmt } from "../../../utils/format";
import SavedQuotesView from "../SavedQuotesView";

const formatFlexoPrice = (q) => "₹" + fmt(q.totalRate);

export default function FlexoSavedQuotes() {
  return (
    <SavedQuotesView
      calcKey="flexo-rate-calc"
      icon={FlexoIcon}
      title="Flexo — Saved Quotes"
      sampleQuotes={SAMPLE_QUOTES}
      calculateRate={calculateFlexoRate}
      ResultComponent={FlexoResult}
      formatPrice={formatFlexoPrice}
    />
  );
}
