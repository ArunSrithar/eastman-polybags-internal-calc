import { useState } from "react";
import AppHeader from "./Header/AppHeader";
import GravureRateCalculator from "../calculators/GravureRateCalculator";
import RateCalculator from "../calculators/RateCalculator";
import Calculator3 from "../calculators/Calculator3";
import CostingCalculator from "../calculators/CostingCalculator";

const TABS = [
  { id: "gravure", label: "Gravure" },
  { id: "rate", label: "Rate Calc" },
  { id: "calc3", label: "Calc 3" },
  { id: "costing", label: "Costing" },
];

const CALCULATORS = [
  GravureRateCalculator,
  RateCalculator,
  Calculator3,
  CostingCalculator,
];

export default function AppShell() {
  const [activeIndex, setActiveIndex] = useState(0);
  const ActiveCalculator = CALCULATORS[activeIndex];

  return (
    <div className="min-h-dvh bg-grouped-background">
      {/* ── Single fixed header: logo | island tabs | user menu */}
      <AppHeader
        tabs={TABS}
        activeIndex={activeIndex}
        onChange={setActiveIndex}
      />

      {/* ── Scrollable content — offset by h-14 header only */}
      <main className="pt-[88px] px-4 pb-8">
        <ActiveCalculator />
      </main>
    </div>
  );
}
