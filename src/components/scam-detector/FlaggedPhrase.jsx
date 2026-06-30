export default function FlaggedPhrase({ phrase }) {
  return (
    <div className="flex items-center gap-3 bg-[var(--color-highlight)] border border-amber-200 rounded-lg px-4 py-3">
      <span className="text-amber-500 text-sm">⚠</span>
      <span className="font-mono text-sm text-[var(--color-text)]">"{phrase}"</span>
    </div>
  )
}