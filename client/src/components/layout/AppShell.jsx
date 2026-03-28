import { useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import PlaceholderView from "./PlaceholderView";
import { MAIN_MARGIN_LEFT } from "../../constants/layout";
import GravureRateCalculator from "../calculators/GravureRateCalculator/GravureRateCalculator";

// Calculator views will be wired here once rebuilt.
const CALCULATOR_VIEWS = {
  gravure: GravureRateCalculator,
  flexo: null,
  "job-cost": null,
};

export default function AppShell() {
  const [activeView, setActiveView] = useState("dashboard");

  function renderMainContent() {
    const CalcComponent = CALCULATOR_VIEWS[activeView];
    if (CalcComponent) {
      return <CalcComponent />;
    }
    return <PlaceholderView viewId={activeView} />;
  }

  return (
    <>
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main className="h-dvh p-3" style={{ marginLeft: MAIN_MARGIN_LEFT }}>
        {renderMainContent()}
      </main>
    </>
  );
}
