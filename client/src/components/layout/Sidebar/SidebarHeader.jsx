import { APP_NAME, APP_SUBTITLE } from "../../../constants/layout";
import GlassSeparator from "../../ui/GlassSeparator";

export default function SidebarHeader() {
  return (
    <div className="pt-7 pb-3">
      <div className="px-5">
        <p className="text-lg font-bold text-label leading-none tracking-tight">
          {APP_NAME}
        </p>
        <p className="text-xs text-label-2 mt-1.5">{APP_SUBTITLE}</p>
      </div>
      <GlassSeparator className="mx-2 mt-4" />
    </div>
  );
}
