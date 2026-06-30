import { useState } from "react"

const EXAMPLE = `URGENT: This is Inspector Sharma from CBI. Your Aadhaar card has been linked to a money laundering case. A warrant has been issued for your arrest. Transfer Rs. 50,000 immediately to the RBI secure verification account to halt the arrest proceedings. Do not tell anyone or you will be charged with evidence tampering.`

export default function InputPanel({ onAnalyze, loading }) {
  const [text, setText] = useState("")

  function handleSubmit() {
    if (text.trim()) onAnalyze(text)
  }

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">Input Data</span>
        <span className="text-xs text-[var(--color-muted)] bg-[var(--color-bg)] px-3 py-1 rounded-full border border-[var(--color-border)]">
          Auto-detects language
        </span>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Paste suspicious message, email, or call transcript here..."
        maxLength={5000}
        rows={10}
        className="w-full resize-none bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-4 text-sm font-mono text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none focus:border-[var(--color-danger)] transition"
      />

      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--color-muted)] font-mono">{text.length} / 5000</span>
        <button
          onClick={() => setText(EXAMPLE)}
          className="text-xs text-[var(--color-info)] hover:underline"
        >
          Try an example
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={loading || !text.trim()}
        className="w-full py-3 rounded-xl bg-[var(--color-danger)] text-white font-semibold text-sm hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="animate-spin inline-block">⟳</span>
            Analyzing...
          </>
        ) : (
          "Analyze Risk →"
        )}
      </button>
    </div>
  )
}