import { CalculatorSubIcon } from "../ui/Icons";

/**
 * InvoiceEmpty — placeholder shown when no result data is available.
 *
 * @param {string} [message]  — primary message
 * @param {string} [hint]     — secondary helper text
 */
export default function InvoiceEmpty({
  message = "No breakdown yet",
  hint = "Enable a material and set its price & quantity to see the rate breakdown.",
}) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] gap-3 px-6 text-center">
      <div className="size-12 rounded-2xl bg-fill-3 flex items-center justify-center">
        <CalculatorSubIcon className="size-5 text-label-3" />
      </div>
      <div>
        <p className="text-sm font-medium text-label-2">{message}</p>
        <p className="text-xs text-label-3 mt-1">{hint}</p>
      </div>
    </div>
  );
}
