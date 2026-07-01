import { FlexoIcon } from "../../ui/Icons";
import FlexoJobCostResult from "./FlexoJobCostResult";
import FlexoJobCostPrintLayout from "./FlexoJobCostPrintLayout";
import { calculateFlexoJobCost } from "../../../utils/calculators/flexoJobCost";
import { fmt } from "../../../utils/format";
import SavedQuotesView from "../SavedQuotesView";

const formatFlexoJobCostPrice = (q) => "₹" + fmt(q.pricePerKg) + "/kg";

export default function FlexoJobCostSavedQuotes() {
  return (
    <SavedQuotesView
      calcKey="flexo-job-cost"
      icon={FlexoIcon}
      title="Flexo — Saved Job Costs"
      calculateRate={calculateFlexoJobCost}
      ResultComponent={FlexoJobCostResult}
      PrintComponent={FlexoJobCostPrintLayout}
      formatPrice={formatFlexoJobCostPrice}
    />
  );
}
