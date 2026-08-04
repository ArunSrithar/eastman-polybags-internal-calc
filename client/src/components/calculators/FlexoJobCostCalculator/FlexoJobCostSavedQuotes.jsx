import { FlexoIcon } from "../../ui/Icons";
import FlexoJobCostResult from "./FlexoJobCostResult";
import FlexoJobCostFormDetails from "./FlexoJobCostFormDetails";
import FlexoJobCostPrintLayout from "./FlexoJobCostPrintLayout";
import { calculateFlexoJobCost } from "../../../utils/calculators/flexoJobCost";
import { fmt } from "../../../utils/format";
import SavedQuotesView from "../SavedQuotesView";

const formatFlexoJobCostPrice = (q) => "₹" + fmt(q.pricePerKg) + "/kg";

function FlexoJobCostResultWithDetails({ result, form }) {
  return (
    <>
      <FlexoJobCostResult result={result} form={form} />
      <FlexoJobCostFormDetails form={form} />
    </>
  );
}

export default function FlexoJobCostSavedQuotes() {
  return (
    <SavedQuotesView
      calcKey="flexo-job-cost"
      icon={FlexoIcon}
      title="Flexo — Saved Job Costs"
      calculateRate={calculateFlexoJobCost}
      ResultComponent={FlexoJobCostResultWithDetails}
      PrintComponent={FlexoJobCostPrintLayout}
      formatPrice={formatFlexoJobCostPrice}
    />
  );
}
