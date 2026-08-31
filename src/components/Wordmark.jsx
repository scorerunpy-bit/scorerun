export default function Wordmark({ size = 30 }) {
  return (
    <div className="flex items-center gap-2.5">
      <svg width={size} height={size} viewBox="0 0 24 24" fill="none" className="text-accent">
        <circle cx="12" cy="12" r="9.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 12l4.6-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <circle cx="12" cy="12" r="1.7" fill="currentColor" />
      </svg>
      <span className="text-[15px] font-semibold uppercase tracking-[.2em]">Scorerun</span>
    </div>
  );
}
