function UserIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-6"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  );
}

export default function UserAvatar({ onClick, isOpen }) {
  return (
    <button
      onClick={onClick}
      aria-label="User menu"
      aria-expanded={isOpen}
      className={`size-10 flex items-center justify-center rounded-full transition-all cursor-pointer ${
        isOpen
          ? "bg-tint/15 text-tint"
          : "bg-fill-3 text-label-2 hover:text-label"
      }`}
    >
      <UserIcon />
    </button>
  );
}
