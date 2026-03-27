import { useState } from "react";
import Sidebar from "./Sidebar/Sidebar";
import PlaceholderView from "./PlaceholderView";
import { MAIN_MARGIN_LEFT } from "../../constants/layout";

// Calculator views will be wired here once rebuilt.
const CALCULATOR_VIEWS = {
  gravure: null,
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
    <div className="min-h-dvh">
      <Sidebar activeView={activeView} onNavigate={setActiveView} />

      <main
        className="min-h-dvh px-6 py-6"
        style={{ marginLeft: MAIN_MARGIN_LEFT }}
      >
        {renderMainContent()}
      </main>
    </div>
  );
}
