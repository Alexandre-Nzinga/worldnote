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
      <path d="M14.5 9.5 17 7a3.2 3.2 0 1 1 4.5 4.5L19 14" />
      <path d="m9.5 14.5-2.5 2.5A3.2 3.2 0 0 1 2.5 12.5L5 10" />
      <path d="m8 16 8-8" />
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
