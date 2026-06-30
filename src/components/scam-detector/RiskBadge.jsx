export default function RiskBadge({ level }) {
  const styles = {
    HIGH: "bg-[var(--color-danger)] text-white",
    MEDIUM: "bg-amber-500 text-white",
    LOW: "bg-[var(--color-success)] text-white",
  }

  const pulse = level === "HIGH" ? "animate-pulse" : ""

  return (
    <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-mono font-bold text-sm ${styles[level]} ${pulse}`}>
      <span>⚠</span>
      <span>{level} RISK</span>
    </div>
  )
}