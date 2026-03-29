import { useRouting } from "../../hooks/useRouting";
import Sidebar from "./Sidebar/Sidebar";
import PlaceholderView from "./PlaceholderView";
import { MAIN_MARGIN_LEFT } from "../../constants/layout";
import GravureRateCalculator from "../calculators/GravureRateCalculator/GravureRateCalculator";
import GravureSavedQuotes from "../calculators/GravureRateCalculator/GravureSavedQuotes";
import FlexoRateCalculator from "../calculators/FlexoRateCalculator/FlexoRateCalculator";
import FlexoSavedQuotes from "../calculators/FlexoRateCalculator/FlexoSavedQuotes";

// Persistent views — stay mounted to preserve state across navigation.
const PERSISTENT_VIEWS = {
  gravure: GravureRateCalculator,
  "gravure-quotes": GravureSavedQuotes,
  flexo: FlexoRateCalculator,
  "flexo-quotes": FlexoSavedQuotes,
};

// Views that render fresh each time (placeholders, etc.)
const CALCULATOR_VIEWS = {
  "job-cost": null,
};

export default function AppShell() {
  const [activeView, navigate] = useRouting();

  function renderFallback() {
    const CalcComponent = CALCULATOR_VIEWS[activeView];
    if (CalcComponent) {
      return <CalcComponent />;
    }
    return <PlaceholderView viewId={activeView} />;
  }

  const isPersistent = activeView in PERSISTENT_VIEWS;

  return (
    <>
      <Sidebar activeView={activeView} onNavigate={navigate} />

      <main className="h-dvh p-3" style={{ marginLeft: MAIN_MARGIN_LEFT }}>
        {/* Persistent views — always mounted, hidden via CSS */}
        {Object.entries(PERSISTENT_VIEWS).map(([viewId, Component]) => (
          <div
            key={viewId}
            className="h-full"
            style={{ display: activeView === viewId ? "block" : "none" }}
          >
            <Component />
          </div>
        ))}

        {/* Non-persistent views */}
        {isPersistent ? null : renderFallback()}
      </main>
    </>
  );
}
