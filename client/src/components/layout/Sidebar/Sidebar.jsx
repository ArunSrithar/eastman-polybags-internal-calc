import SidebarHeader from "./SidebarHeader";
import SidebarNav from "./SidebarNav";
import SidebarFooter from "./SidebarFooter";

export default function Sidebar({ activeView, onNavigate }) {
  return (
    <aside className="fixed top-3 bottom-3 left-3 z-40 w-64 flex flex-col bg-background/60 dark:bg-background-2/60 backdrop-blur-2xl backdrop-saturate-200 border border-separator/30 dark:border-white/10 rounded-2xl shadow-lg shadow-black/5 dark:shadow-black/30 overflow-hidden">
      <SidebarHeader />
      <SidebarNav activeView={activeView} onNavigate={onNavigate} />
      <SidebarFooter />
    </aside>
  );
}
