import RiskBadge from "./RiskBadge";
import RedFlagCard from "./RedFlagCard";
import FlaggedPhrase from "./FlaggedPhrase";

export default function ResultPanel({ result }) {
  // Empty state — shown when no analysis has been run yet
  if (!result) {
    return (
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-8 flex flex-col items-center justify-center h-full min-h-[400px] text-center gap-3">
        <span className="text-4xl">🛡️</span>
        <p className="text-[var(--color-muted)] text-sm">
          Paste a message and click Analyze Risk to see results here.
        </p>
      </div>
    );
  }

  const isHigh = result.riskLevel === "HIGH";

  return (
    <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 flex flex-col gap-6">
      {/* Header: Warning + Badge + Summary */}
      <div className="flex flex-col gap-2">
        {isHigh && (
          <p className="text-[var(--color-danger)] font-display font-bold text-lg">
            ⚠️ Do not engage. Do not pay.
          </p>
        )}
        <RiskBadge level={result.riskLevel} />
        <p className="text-sm text-[var(--color-muted)] mt-1">{result.summary}</p>
      </div>

      <hr className="border-[var(--color-border)]" />

      {/* Red Flags Cards */}
      {result.redFlags?.length > 0 && (
        <div className="flex flex-col gap-3">
          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">
            🚩 Red Flags Detected
          </span>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {result.redFlags.map((flag, index) => (
              <RedFlagCard key={index} type={flag.type} detail={flag.detail} />
            ))}
          </div>
        </div>
      )}

      {/* Flagged Phrases */}
      {result.flaggedPhrases?.length > 0 && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[var(--color-danger)]" />
            <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">
              Flagged Syntax &amp; Triggers
            </span>
          </div>
          <div className="flex flex-col gap-2">
            {result.flaggedPhrases.map((phrase, index) => (
              <FlaggedPhrase key={index} phrase={phrase} />
            ))}
          </div>
        </div>
      )}

      <hr className="border-[var(--color-border)]" />

      {/* Actionable Advice */}
      <p className="text-sm text-[var(--color-text)]">
        <span className="font-semibold">Action: </span>
        {result.advice}
      </p>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <a
          href="https://cybercrime.gov.in"
          target="_blank"
          rel="noopener noreferrer"
          className="px-4 py-2 rounded-xl bg-[var(--color-info)] text-white text-sm font-semibold hover:opacity-90 transition flex items-center gap-1"
        >
          Report to Cybercrime Portal →
        </a>
        <button
          onClick={() => {
            const text = `🚨 SCAM ALERT: ${result.summary}\n\nRed Flags: ${result.redFlags
              ?.map((f) => f.type)
              .join(", ")}\n\nAction: ${result.advice}`;
            navigator.clipboard.writeText(text);
          }}
          className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-bg)] transition"
        >
          Share Warning
        </button>
        <button
          onClick={() => {
            const report = {
              timestamp: new Date().toISOString(),
              riskLevel: result.riskLevel,
              summary: result.summary,
              redFlags: result.redFlags,
              flaggedPhrases: result.flaggedPhrases,
              advice: result.advice,
            };
            const blob = new Blob([JSON.stringify(report, null, 2)], {
              type: "application/json",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = `shield-report-${Date.now()}.json`;
            a.click();
            URL.revokeObjectURL(url);
          }}
          className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-sm font-semibold hover:bg-[var(--color-bg)] transition"
        >
          Save Report
        </button>
      </div>
    </div>
  );
}