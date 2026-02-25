import { useEffect, useRef, useState } from "react";
import UserAvatar from "./UserAvatar";
import UserMenuDropdown from "./UserMenuDropdown";

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  /* Close on outside click */
  useEffect(() => {
    if (!isOpen) return;
    function handleOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [isOpen]);

  return (
    <div ref={ref} className="relative">
      <UserAvatar isOpen={isOpen} onClick={() => setIsOpen((prev) => !prev)} />
      {isOpen && <UserMenuDropdown onClose={() => setIsOpen(false)} />}
    </div>
  );
}
