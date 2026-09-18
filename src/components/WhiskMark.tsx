export function WhiskMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 30V15" />
      <path d="M13 30h6" />
      <path d="M10 15c0-6.2 2.6-12 6-12s6 5.8 6 12c0 1.7-2.2 2.8-6 2.8s-6-1.1-6-2.8Z" />
      <path d="M11.2 8.8C12.6 10.2 14.2 11 16 11s3.4-.8 4.8-2.2" />
      <path d="M11 12.2c1.5 1.2 3.1 1.8 5 1.8s3.5-.6 5-1.8" />
      <path d="M11.4 6.2C13 5.2 14.5 4.7 16 4.7s3 .5 4.6 1.5" />
    </svg>
  );
}
