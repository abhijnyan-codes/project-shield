import { useState, useRef, useEffect } from "react";
import { analyzeScam } from "../lib/groq";
import { Shield, Send, FileText, AlertTriangle } from "lucide-react";

function RiskBadge({ level }) {
  const styles = {
    HIGH: "bg-[var(--color-danger)] text-white",
    MEDIUM: "bg-amber-500 text-white",
    LOW: "bg-[var(--color-success)] text-white",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${styles[level]}`}
    >
      <AlertTriangle className="w-3 h-3" />
      {level} RISK
    </span>
  );
}

function ShieldMessage({ result }) {
  return (
    <div className="flex gap-3 items-start">
      <div className="w-8 h-8 rounded-full bg-[var(--color-danger)] flex items-center justify-center flex-shrink-0 mt-1">
        <Shield className="w-4 h-4 text-white" />
      </div>
      <div className="flex-1 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl rounded-tl-none p-5 flex flex-col gap-4 max-w-2xl">
        {/* Threat header */}
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xs font-semibold text-[var(--color-muted)] uppercase tracking-widest">
            Threat Intelligence
          </span>
          <RiskBadge level={result.riskLevel} />
        </div>

        {/* Warning */}
        {result.riskLevel === "HIGH" && (
          <p className="text-[var(--color-danger)] font-bold text-sm">
            ⚠️ Do not engage. Do not pay.
          </p>
        )}

        {/* Summary */}
        <p className="text-sm text-[var(--color-text)]">{result.summary}</p>

        {/* Red Flags */}
        {result.redFlags?.length > 0 && (
          <div className="bg-[var(--color-bg)] rounded-xl p-4 flex flex-col gap-2 border border-[var(--color-border)]">
            <span className="text-xs font-semibold text-[var(--color-danger)] uppercase tracking-widest">
              Forensic Breakdown
            </span>
            {result.redFlags.map((flag, i) => (
              <div key={i} className="flex gap-2 text-sm text-[var(--color-text)]">
                <span className="text-[var(--color-danger)] mt-0.5 flex-shrink-0">✕</span>
                <span>
                  <span className="font-semibold">{flag.type}:</span> {flag.detail}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Flagged Phrases */}
        {result.flaggedPhrases?.length > 0 && (
          <div className="flex flex-col gap-2">
            {result.flaggedPhrases.map((phrase, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-[var(--color-highlight)] border border-amber-200 rounded-lg px-3 py-2"
              >
                <span className="text-amber-500 text-xs">⚠</span>
                <span className="font-mono text-xs text-[var(--color-text)]">"{phrase}"</span>
              </div>
            ))}
          </div>
        )}

        {/* Advice */}
        <p className="text-sm text-[var(--color-text)]">
          <span className="font-semibold">Next Steps: </span>
          {result.advice}
        </p>

        {/* Action buttons */}
        <div className="flex flex-wrap gap-2">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-[var(--color-danger)] text-white text-xs font-semibold hover:opacity-90 transition flex items-center gap-1"
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
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold hover:bg-[var(--color-bg)] transition"
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
            className="px-4 py-2 rounded-xl border border-[var(--color-border)] text-xs font-semibold hover:bg-[var(--color-bg)] transition"
          >
            Save Report
          </button>
        </div>
      </div>
    </div>
  );
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end">
      <div className="bg-[var(--color-text)] text-white rounded-2xl rounded-tr-none px-5 py-3 max-w-xl text-sm leading-relaxed">
        {text}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex gap-3 items-center">
      <div className="w-8 h-8 rounded-full bg-[var(--color-danger)] flex items-center justify-center flex-shrink-0">
        <Shield className="w-4 h-4 text-white" />
      </div>
      <div className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl rounded-tl-none px-5 py-3">
        <div className="flex gap-1 items-center">
          <span className="text-xs text-[var(--color-muted)] mr-2">Shield is analyzing</span>
          <span
            className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)] animate-bounce"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)] animate-bounce"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="w-1.5 h-1.5 rounded-full bg-[var(--color-muted)] animate-bounce"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      </div>
    </div>
  );
}

const EXAMPLE =
  "URGENT: This is Inspector Sharma from CBI. Your Aadhaar card has been linked to a money laundering case. A warrant has been issued for your arrest. Transfer Rs. 50,000 immediately to the RBI secure verification account to halt the arrest proceedings. Do not tell anyone or you will be charged with evidence tampering.";

export default function Analyze() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function handleSend(text) {
    const userText = text || input;
    if (!userText.trim()) return;
    setInput("");
    setMessages((prev) => [...prev, { type: "user", text: userText }]);
    setLoading(true);
    try {
      const result = await analyzeScam(userText);
      setMessages((prev) => [...prev, { type: "shield", result }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          type: "shield",
          result: {
            riskLevel: "LOW",
            summary: "Analysis failed. Please check your API key.",
            redFlags: [],
            flaggedPhrases: [],
            advice: "Try again or check your internet connection.",
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 flex flex-col h-[calc(100vh-130px)]">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="font-display font-bold text-2xl text-[var(--color-text)]">
          Fraud Analyzer
        </h1>
        <p className="text-xs text-[var(--color-muted)] uppercase tracking-widest mt-1">
          Secure AI Analysis Session
        </p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto flex flex-col gap-5 pb-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-[var(--color-danger)] bg-opacity-10 flex items-center justify-center">
              <Shield className="w-8 h-8 text-[var(--color-danger)]" />
            </div>
            <div>
              <p className="font-display font-semibold text-[var(--color-text)]">
                Describe your situation
              </p>
              <p className="text-sm text-[var(--color-muted)] mt-1">
                Paste a suspicious message or describe a call you received
              </p>
            </div>
            <button
              onClick={() => handleSend(EXAMPLE)}
              className="text-xs text-[var(--color-info)] border border-[var(--color-info)] px-4 py-2 rounded-full hover:bg-blue-50 transition flex items-center gap-2"
            >
              <FileText className="w-3 h-3" />
              Try an example
            </button>
          </div>
        )}

        {messages.map((msg, i) =>
          msg.type === "user" ? (
            <UserMessage key={i} text={msg.text} />
          ) : (
            <ShieldMessage key={i} result={msg.result} />
          )
        )}

        {loading && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="border-t border-[var(--color-border)] pt-4">
        <div className="flex gap-3 items-end bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder="Paste a message or describe the suspicious call..."
            rows={2}
            className="flex-1 resize-none bg-transparent text-sm text-[var(--color-text)] placeholder:text-[var(--color-muted)] focus:outline-none"
          />
          <button
            onClick={() => handleSend()}
            disabled={loading || !input.trim()}
            className="w-9 h-9 rounded-xl bg-[var(--color-danger)] flex items-center justify-center hover:opacity-90 transition disabled:opacity-40 flex-shrink-0"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </div>
        <p className="text-xs text-[var(--color-muted)] text-center mt-2">
          Press Enter to analyze · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}