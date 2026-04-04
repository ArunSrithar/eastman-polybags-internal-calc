import { useRouting } from "../../hooks/useRouting";
import Sidebar from "./Sidebar/Sidebar";
import PlaceholderView from "./PlaceholderView";
import { MAIN_MARGIN_LEFT } from "../../constants/layout";
import { GravureSettingsProvider } from "../../context/GravureSettingsContext";
import { FlexoSettingsProvider } from "../../context/FlexoSettingsContext";
import GravureRateCalculator from "../calculators/GravureRateCalculator/GravureRateCalculator";
import GravureSavedQuotes from "../calculators/GravureRateCalculator/GravureSavedQuotes";
import FlexoRateCalculator from "../calculators/FlexoRateCalculator/FlexoRateCalculator";
import FlexoSavedQuotes from "../calculators/FlexoRateCalculator/FlexoSavedQuotes";
import JobCostCalculator from "../calculators/JobCostCalculator/JobCostCalculator";
import JobCostSavedQuotes from "../calculators/JobCostCalculator/JobCostSavedQuotes";
import GravurePriceSettings from "../RateSettings/GravurePriceSettings";
import FlexoPriceSettings from "../RateSettings/FlexoPriceSettings";

// Persistent views — stay mounted to preserve state across navigation.
const PERSISTENT_VIEWS = {
  gravure: GravureRateCalculator,
  "gravure-quotes": GravureSavedQuotes,
  "gravure-settings": GravurePriceSettings,
  flexo: FlexoRateCalculator,
  "flexo-quotes": FlexoSavedQuotes,
  "flexo-settings": FlexoPriceSettings,
  "job-cost": JobCostCalculator,
  "job-cost-quotes": JobCostSavedQuotes,
};

export default function AppShell() {
  const [activeView, navigate] = useRouting();

  function renderFallback() {
    return <PlaceholderView viewId={activeView} />;
  }

  const isPersistent = activeView in PERSISTENT_VIEWS;

  return (
    <>
      <Sidebar activeView={activeView} onNavigate={navigate} />

      <main className="h-dvh p-3" style={{ marginLeft: MAIN_MARGIN_LEFT }}>
        <GravureSettingsProvider>
          <FlexoSettingsProvider>
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
          </FlexoSettingsProvider>
        </GravureSettingsProvider>

        {/* Non-persistent views */}
        {isPersistent ? null : renderFallback()}
      </main>
    </>
  );
}
