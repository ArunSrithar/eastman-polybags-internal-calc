import { JobCostIcon } from "../../ui/Icons";
import { SAMPLE_QUOTES } from "../../../constants/jobCost";
import JobCostResult from "./JobCostResult";
import { calculateJobCost } from "../../../utils/calculators/jobCost";
import { fmt } from "../../../utils/format";
import SavedQuotesView from "../SavedQuotesView";

const formatJobCostPrice = (q) => "₹" + fmt(q.costOfJob) + "/kg";

export default function JobCostSavedQuotes() {
  return (
    <SavedQuotesView
      calcKey="job-cost"
      icon={JobCostIcon}
      title="Job Cost — Saved Quotes"
      sampleQuotes={SAMPLE_QUOTES}
      calculateRate={calculateJobCost}
      ResultComponent={JobCostResult}
      formatPrice={formatJobCostPrice}
    />
  );
}
