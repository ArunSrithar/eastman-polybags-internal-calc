import { useEffect } from "react";
import { FlexoIcon } from "../../ui/Icons";
import FlexoResult from "./FlexoResult";
import FlexoPrintLayout from "./FlexoPrintLayout";
import { calculateFlexoRate } from "../../../utils/calculators/flexoRateCalc";
import { fmt } from "../../../utils/format";
import SavedQuotesView from "../SavedQuotesView";
import {
  useFlexoSettings,
  buildFlexoRatesFromSettings,
} from "../../../context/FlexoSettingsContext";

const formatFlexoPrice = (q) => "₹" + fmt(q.pricePerKg);

export default function FlexoSavedQuotes() {
  const { settings, companies, companyCoverSizes, fetchCompanyCoverSizes } =
    useFlexoSettings();
  const rates = settings ? buildFlexoRatesFromSettings(settings) : undefined;

  // Prefetch cover sizes for every company so historical quotes referencing
  // any of them can resolve their rates when replayed.
  useEffect(() => {
    for (const company of companies) {
      if (!companyCoverSizes[company.id]) {
        fetchCompanyCoverSizes(company.id);
      }
    }
  }, [companies, companyCoverSizes, fetchCompanyCoverSizes]);

  return (
    <SavedQuotesView
      calcKey="flexo-rate-calc"
      icon={FlexoIcon}
      title="Flexo — Saved Quotes"
      calculateRate={(form) =>
        calculateFlexoRate(form, rates, companies, companyCoverSizes)
      }
      ResultComponent={FlexoResult}
      PrintComponent={FlexoPrintLayout}
      formatPrice={formatFlexoPrice}
    />
  );
}
