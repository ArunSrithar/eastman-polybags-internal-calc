import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";
import SidebarFooter from "./SidebarFooter";

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="fixed top-3 bottom-3 left-3 z-40 w-64 flex flex-col glass-panel overflow-hidden">
      <SidebarHeader />
      <SidebarNav activeView={activeView} onNavigate={onNavigate} />
      <SidebarFooter />
    </aside>
  );
}
