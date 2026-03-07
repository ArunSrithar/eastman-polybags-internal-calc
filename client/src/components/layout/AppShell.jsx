import { useState } from "react";
import AppHeader from "./Header/AppHeader";
import GravureRateCalculator from "../calculators/GravureRateCalculator";
import FlexoRateCalculator from "../calculators/FlexoRateCalculator";
import JobCostCalculator from "../calculators/JobCostCalculator";

const TABS = [
  { id: "gravure", label: "Gravure" },
  { id: "flexo", label: "Flexo Calc" },
  { id: "job-cost", label: "Job Cost" },
];

const CALCULATORS = [
  GravureRateCalculator,
  FlexoRateCalculator,
  JobCostCalculator,
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
      <main className="pt-22 px-4 pb-8">
        <ActiveCalculator />
      </main>
    </div>
  );
}
