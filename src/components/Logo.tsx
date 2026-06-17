export default function Logo({ className = "" }: { className?: string }) {
  return (
    <span
      className={`inline-flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-sm ${className}`}
    >
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        {/* 선체 */}
        <path d="M3.5 13.5h17l-1.8 4.2a1 1 0 0 1-.92.6H6.2a1 1 0 0 1-.92-.6L3.5 13.5Z" fill="white" />
        {/* 선실 */}
        <path d="M7.5 13.5V8.8a1 1 0 0 1 1-1h3.2l2.8 2.7v3" stroke="white" strokeWidth="1.6" strokeLinejoin="round" />
        {/* 파도 */}
        <path d="M2.5 20.5c1.2 0 1.2-.9 2.4-.9s1.2.9 2.4.9 1.2-.9 2.4-.9 1.2.9 2.4.9 1.2-.9 2.4-.9 1.2.9 2.4.9 1.2-.9 2.4-.9" stroke="white" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    </span>
  )
}
