import { FlexoIcon } from "../../ui/Icons";
import FlexoResult from "./FlexoResult";
import { calculateFlexoRate } from "../../../utils/calculators/flexoRateCalc";
import { fmt } from "../../../utils/format";
import SavedQuotesView from "../SavedQuotesView";

const formatFlexoPrice = (q) => "₹" + fmt(q.pricePerKg);

export default function FlexoSavedQuotes() {
  return (
    <SavedQuotesView
      calcKey="flexo-rate-calc"
      icon={FlexoIcon}
      title="Flexo — Saved Quotes"
      calculateRate={calculateFlexoRate}
      ResultComponent={FlexoResult}
      formatPrice={formatFlexoPrice}
    />
  );
}
