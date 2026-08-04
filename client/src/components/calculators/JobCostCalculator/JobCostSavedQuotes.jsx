import { JobCostIcon } from "../../ui/Icons";
import JobCostResult from "./JobCostResult";
import JobCostFormDetails from "./JobCostFormDetails";
import JobCostPrintLayout from "./JobCostPrintLayout";
import { calculateJobCost } from "../../../utils/calculators/jobCost";
import { fmt } from "../../../utils/format";
import SavedQuotesView from "../SavedQuotesView";

const formatJobCostPrice = (q) => "₹" + fmt(q.pricePerKg) + "/kg";

function JobCostResultWithDetails({ result, form }) {
  return (
    <>
      <JobCostResult result={result} form={form} />
      <JobCostFormDetails form={form} />
    </>
  );
}

export default function JobCostSavedQuotes() {
  return (
    <SavedQuotesView
      calcKey="job-cost"
      icon={JobCostIcon}
      title="Job Cost — Saved Quotes"
      calculateRate={calculateJobCost}
      ResultComponent={JobCostResultWithDetails}
      PrintComponent={JobCostPrintLayout}
      formatPrice={formatJobCostPrice}
    />
  );
}
