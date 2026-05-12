import { JobCostIcon } from "../../ui/Icons";
import JobCostResult from "./JobCostResult";
import JobCostPrintLayout from "./JobCostPrintLayout";
import { calculateJobCost } from "../../../utils/calculators/jobCost";
import { fmt } from "../../../utils/format";
import SavedQuotesView from "../SavedQuotesView";

const formatJobCostPrice = (q) => "₹" + fmt(q.pricePerKg) + "/kg";

export default function JobCostSavedQuotes() {
  return (
    <SavedQuotesView
      calcKey="job-cost"
      icon={JobCostIcon}
      title="Job Cost — Saved Quotes"
      calculateRate={calculateJobCost}
      ResultComponent={JobCostResult}
      PrintComponent={JobCostPrintLayout}
      formatPrice={formatJobCostPrice}
    />
  );
}
