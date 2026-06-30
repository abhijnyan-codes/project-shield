const icons = {
  "Impersonation": "🪪",
  "Urgency": "⏱",
  "Financial Request": "💸",
  "Suspicious Link": "🔗",
  "Other": "⚠️",
}

export default function RedFlagCard({ type, detail }) {
  return (
    <div className="border border-[var(--color-border)] rounded-xl p-4 bg-[var(--color-surface)]">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icons[type] || "⚠️"}</span>
        <span className="font-semibold text-sm text-[var(--color-text)]">{type}</span>
      </div>
      <p className="text-xs text-[var(--color-muted)] font-mono leading-relaxed">{detail}</p>
    </div>
  )
}