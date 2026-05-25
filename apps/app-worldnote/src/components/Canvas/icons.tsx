type IconProps = {
  className?: string;
};

export function UserIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>User icon</title>
      <circle cx="12" cy="8" r="3.2" />
      <path d="M5.5 19c1.6-3 4-4.5 6.5-4.5S16.9 16 18.5 19" />
    </svg>
  );
}

export function MapPinIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Location icon</title>
      <path d="M12 20s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

export function StickyNoteIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Note icon</title>
      <path d="M5 4h14v11l-5 5H5z" />
      <path d="M14 15h5" />
      <path d="M14 15v5" />
    </svg>
  );
}

export function LinkIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Link icon</title>
      <path d="M8.5 13.5 6 16a3.2 3.2 0 1 0 4.5 4.5l2.5-2.5" />
      <path d="M15.5 10.5 18 8a3.2 3.2 0 1 0-4.5-4.5L11 6" />
    </svg>
  );
}

export function SelectIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Select icon</title>
      <path d="M5 4.5 11.5 18l2.2-4.8L18.5 15 5 4.5Z" />
    </svg>
  );
}

export function DragIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Drag icon</title>
      <path d="M9 11V6.5a2.5 2.5 0 1 1 5 0V11" />
      <path d="M11.5 11h1a4 4 0 0 1 4 4v1.5" />
      <path d="M12 11v8.5" />
    </svg>
  );
}

export function TextIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Text icon</title>
      <path d="M7 5.5h10" />
      <path d="M12 5.5V18.5" />
      <path d="M9 18.5h6" />
    </svg>
  );
}

export function ActionsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Actions icon</title>
      <circle cx="7.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="7.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="7.5" cy="16.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="16.5" cy="16.5" r="1.3" fill="currentColor" stroke="none" />
      <path d="M12 10.5v3" />
      <path d="M10.5 12h3" />
    </svg>
  );
}

export function VaultIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Vault icon</title>
      <rect x="5" y="4.5" width="14" height="6.5" rx="1.5" />
      <path d="M8 7.5h8" />
      <rect x="5" y="13" width="14" height="6.5" rx="1.5" />
      <path d="M8 16h8" />
    </svg>
  );
}

export function PlusIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Plus icon</title>
      <path d="M12 5v14" />
      <path d="M5 12h14" />
    </svg>
  );
}

export function CheckSquareIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>To-do icon</title>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </svg>
  );
}

export function SlashIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Line icon</title>
      <path d="M5 19 19 5" />
    </svg>
  );
}

export function BoardIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Board icon</title>
      <rect x="4.5" y="4.5" width="15" height="15" rx="2.5" />
      <path d="M12 4.5v15" />
      <path d="M4.5 12h15" />
    </svg>
  );
}

export function ColumnsIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Column icon</title>
      <rect x="4.5" y="5" width="5.2" height="14" rx="1.3" />
      <rect x="10.9" y="5" width="3.2" height="14" rx="1.3" />
      <rect x="15.3" y="5" width="4.2" height="14" rx="1.3" />
    </svg>
  );
}

export function CommentIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Comment icon</title>
      <path d="M5.5 6.5h13a1.5 1.5 0 0 1 1.5 1.5v7a1.5 1.5 0 0 1-1.5 1.5h-8l-4 3v-3h-1a1.5 1.5 0 0 1-1.5-1.5V8A1.5 1.5 0 0 1 5.5 6.5Z" />
    </svg>
  );
}

export function ImageIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Image icon</title>
      <rect x="4.5" y="5.5" width="15" height="13" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m7 16 3.5-3.5 2.8 2.8 2.7-2.7 2 2" />
    </svg>
  );
}

export function UploadIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Upload icon</title>
      <path d="M12 15V6" />
      <path d="m8.5 9.5 3.5-3.5 3.5 3.5" />
      <path d="M5 18h14" />
    </svg>
  );
}

export function TrashIcon({ className }: IconProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <title>Trash icon</title>
      <path d="M4.5 7h15" />
      <path d="M9.5 4.5h5" />
      <path d="m7 7 .7 11.2a1.3 1.3 0 0 0 1.3 1.2h6a1.3 1.3 0 0 0 1.3-1.2L17 7" />
      <path d="M10 10v6.5" />
      <path d="M14 10v6.5" />
    </svg>
  );
}
