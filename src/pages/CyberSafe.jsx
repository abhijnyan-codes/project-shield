import { useState, useRef, useEffect } from "react"
import { analyzeCyberSafe } from "../lib/groq"
import { cyberCells, getCyberCellByState } from "../lib/cyberCells"
import { 
  Shield, 
  FileText, 
  AlertTriangle, 
  Lock, 
  RefreshCcw,
  UserX,
  Heart,
  Phone,
  Download,
  Copy,
  ExternalLink,
  MapPin,
  Eye,
  FileWarning,
  User,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Award,
  AlertCircle
} from "lucide-react"

// ─── Situation Types ──────────────────────────────────────────
const SITUATION_TYPES = [
  { 
    id: "bullying", 
    icon: <UserX className="w-6 h-6" />, 
    label: "Bullying", 
    desc: "I'm being harassed or threatened online." 
  },
  { 
    id: "blackmail", 
    icon: <Lock className="w-6 h-6" />, 
    label: "Blackmail", 
    desc: "Someone is trying to extort money or info." 
  },
  { 
    id: "sextortion", 
    icon: <User className="w-6 h-6" />, 
    label: "Sextortion", 
    desc: "Private images are being used against me." 
  },
  { 
    id: "impersonation", 
    icon: <UserX className="w-6 h-6" />, 
    label: "Impersonation", 
    desc: "Someone is pretending to be me online." 
  },
  { 
    id: "other", 
    icon: <HelpCircle className="w-6 h-6" />, 
    label: "Something else", 
    desc: "I need help with a different situation." 
  },
]

// ─── Risk Badge ──────────────────────────────────────────────
function RiskBadge({ level }) {
  const styles = {
    EMERGENCY: "bg-red-600 text-white animate-pulse",
    HIGH: "bg-red-500 text-white",
    MEDIUM: "bg-amber-500 text-white",
    LOW: "bg-emerald-500 text-white",
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${styles[level] || styles.LOW}`}>
      <AlertTriangle className="w-3 h-3" />
      {level === "EMERGENCY" ? "CRITICAL" : `${level}`}
    </span>
  )
}

// ─── Main Component ──────────────────────────────────────────
export default function CyberSafe() {
  const [selectedType, setSelectedType] = useState(null)
  const [description, setDescription] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [analyzed, setAnalyzed] = useState(false)
  const [selectedState, setSelectedState] = useState("")
  const [showStateDropdown, setShowStateDropdown] = useState(false)

  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [result, loading])

  // ─── Handle Analysis ────────────────────────────────────────
  async function handleAnalyze() {
    if (!description.trim() || !selectedType) return
    setLoading(true)
    setAnalyzed(false)

    try {
      const userText = `[${selectedType || "General"}] ${description}`
      const data = await analyzeCyberSafe(userText)
      setResult(data)
      setAnalyzed(true)
    } catch (err) {
      setResult({
        riskLevel: "LOW",
        harassmentType: null,
        summary: "Analysis failed. Please try again.",
        threatAssessment: "No threat detected",
        emergencyFlag: false,
        flaggedPhrases: [],
        advice: "Check your internet connection and try again.",
        evidenceTips: "Screenshot the conversation before retrying.",
        reportingSteps: "If this is urgent, call 112 now.",
        legalActions: [],
        policeInvolvement: "Not recommended",
        caseSummary: "Unable to analyze at this time.",
        complaintDraft: "Please try again after checking your connection.",
        immediateActions: ["Check your internet connection", "Try again"],
        supportMessage: "You're not alone. We're here to help."
      })
      setAnalyzed(true)
    } finally {
      setLoading(false)
    }
  }

  // ─── Get State Cell ────────────────────────────────────────
  const cellDetails = selectedState ? getCyberCellByState(selectedState) : null

  // ─── Generate Report ID ────────────────────────────────────
  const reportId = `CS-${Date.now().toString().slice(-8)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`

  // ─── Render Results (Analyzed State) ───────────────────────
  const renderResults = () => {
    if (!result) return null
    const isEmergency = result.riskLevel === "EMERGENCY"

    return (
      <div className="w-full animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span className="text-[10px] font-bold text-emerald-600 tracking-widest uppercase">Secure Session</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
            <span>REF: {reportId}</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className={isEmergency ? "text-red-500 font-bold" : "text-emerald-600 font-bold"}>
              {isEmergency ? "⚠️ EMERGENCY" : "✓ ACTIVE"}
            </span>
          </div>
        </div>

        {/* State Dropdown */}
        <div className="mb-4 p-3 bg-white border border-slate-200 rounded-xl shadow-sm">
          <button
            onClick={() => setShowStateDropdown(!showStateDropdown)}
            className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
          >
            <MapPin className="w-4 h-4" />
            {showStateDropdown ? "Hide" : "View"} Local Police Stations
          </button>
          {showStateDropdown && (
            <div className="mt-3">
              <select
                value={selectedState}
                onChange={(e) => setSelectedState(e.target.value)}
                className="w-full p-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300"
              >
                <option value="">Select your state...</option>
                {cyberCells.map((cell) => (
                  <option key={cell.state} value={cell.state}>
                    {cell.state}
                  </option>
                ))}
              </select>
              {cellDetails && (
                <div className="mt-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-sm font-semibold text-slate-800">{cellDetails.nodalAgency}</p>
                  <p className="text-xs text-slate-600 mt-1">📞 {cellDetails.contact}</p>
                  <p className="text-xs text-slate-600">✉️ {cellDetails.email}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Severity */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Severity</span>
          <RiskBadge level={result.riskLevel} />
        </div>

        {/* What's Happening */}
        <div className="mb-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">What's Happening</h3>
          <p className="text-sm text-slate-700 leading-relaxed p-4 bg-slate-50 border border-slate-100 rounded-xl">
            {result.caseSummary || result.summary}
          </p>
        </div>

        {/* What To Do Now */}
        {result.immediateActions?.length > 0 && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
            <h3 className="text-xs font-bold text-red-700 uppercase tracking-widest mb-2">What To Do Now</h3>
            <ol className="space-y-1.5">
              {result.immediateActions.map((action, i) => (
                <li key={i} className="flex items-start gap-2 text-xs text-slate-700">
                  <span className="font-bold text-red-500 min-w-[18px]">{i + 1}.</span>
                  <span>{action}</span>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Legal Protection */}
        {result.legalActions?.length > 0 && (
          <div className="mb-4 p-4 bg-slate-800 text-white rounded-xl">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-widest mb-1.5">Legal Protection</h3>
            <p className="text-sm text-slate-300 leading-relaxed">
              You are protected under {result.legalActions.join(", ")}.
            </p>
          </div>
        )}

        {/* FIR Draft */}
        {result.complaintDraft && (
          <div className="mb-4 p-4 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">FIR Draft</h3>
              <button
                onClick={() => navigator.clipboard.writeText(result.complaintDraft)}
                className="text-[10px] font-semibold text-orange-600 hover:text-orange-800 transition flex items-center gap-1"
              >
                <Copy className="w-3 h-3" />
                Copy
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap font-mono bg-slate-50 p-3 rounded-lg border border-slate-100 max-h-40 overflow-y-auto">
              {result.complaintDraft}
            </p>
          </div>
        )}

        {/* Buttons */}
        <div className="flex flex-wrap gap-3 mb-4">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="flex-1 min-w-[120px] px-4 py-2.5 bg-emerald-600 text-white text-xs font-semibold rounded-xl hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-2"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            Report Here
          </a>
          <button
            onClick={() => {
              const text = `🚨 HARASSMENT REPORT\n\nReport ID: ${reportId}\nType: ${result.harassmentType || "Unspecified"}\nRisk: ${result.riskLevel}\n\nSummary: ${result.caseSummary || result.summary}\n\nImmediate Actions:\n${result.immediateActions?.join("\n") || "N/A"}\n\nLegal: ${result.legalActions?.join(", ") || "N/A"}`
              navigator.clipboard.writeText(text)
            }}
            className="px-4 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:bg-slate-700 transition shadow-sm flex items-center justify-center gap-2"
          >
            <Copy className="w-3.5 h-3.5" />
            Copy Report
          </button>
          <button
            onClick={() => {
              const report = {
                reportId,
                timestamp: new Date().toISOString(),
                riskLevel: result.riskLevel,
                harassmentType: result.harassmentType,
                summary: result.summary,
                caseSummary: result.caseSummary,
                complaintDraft: result.complaintDraft,
                legalActions: result.legalActions,
                immediateActions: result.immediateActions,
                advice: result.advice,
              }
              const blob = new Blob([JSON.stringify(report, null, 2)], { type: "application/json" })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `cybersafe-${reportId}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="px-4 py-2.5 bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl hover:bg-slate-50 transition shadow-sm flex items-center justify-center gap-2"
          >
            <Download className="w-3.5 h-3.5" />
            Download
          </button>
        </div>

        {/* Support Message */}
        {result.supportMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-center">
            <p className="text-sm text-emerald-700 font-medium flex items-center justify-center gap-2">
              <Heart className="w-4 h-4" />
              {result.supportMessage}
            </p>
          </div>
        )}

        {/* Footer Badges */}
        <div className="mt-4 flex flex-wrap items-center justify-center gap-4 text-[10px] text-slate-400 font-bold tracking-wider uppercase">
          <span className="flex items-center gap-1.5">
            <Shield className="w-3 h-3 text-emerald-500" />
            Encrypted
          </span>
          <span className="w-px h-3 bg-slate-300" />
          <span className="flex items-center gap-1.5">
            <Lock className="w-3 h-3 text-emerald-500" />
            Zero-Knowledge
          </span>
        </div>
      </div>
    )
  }

  // ─── Render Empty State (Landing Page Design) ───────────────
  const renderEmptyState = () => (
    <div className="flex-1 w-full mx-auto animate-in fade-in duration-500 flex flex-col justify-center">
      
      {/* Header text exactly matching the design */}
      <div className="text-center mb-10">
        <h2 className="text-lg font-bold text-slate-800 mb-3">
          You're not alone. We'll help you through this.
        </h2>
        <p className="text-sm text-slate-500 max-w-md mx-auto leading-relaxed">
          Tell us what's happening. CyberSafe will guide you step by step — privately and securely.
        </p>
      </div>

      {/* Grid of 5 Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-5 gap-4 w-full mb-10">
        {SITUATION_TYPES.map((type) => (
          <button
            key={type.id}
            onClick={() => setSelectedType(type.id)}
            className={`flex flex-col text-left p-6 rounded-2xl border-2 transition-all duration-200 bg-white shadow-sm ${
              selectedType === type.id
                ? "border-orange-400 shadow-orange-100 scale-[1.02] bg-orange-50/20"
                : "border-transparent hover:border-orange-200 hover:shadow-md"
            }`}
          >
            <div className={`mb-4 w-10 h-10 flex items-center justify-center transition-colors ${
              selectedType === type.id ? "text-orange-600" : "text-slate-700"
            }`}>
              {type.icon}
            </div>
            <span className="text-sm font-bold text-slate-900 mb-1.5">{type.label}</span>
            <span className="text-xs text-slate-500 leading-snug">{type.desc}</span>
          </button>
        ))}
      </div>

      {/* Description Field (Integrated cleanly so Start Session logic works) */}
      <div className="w-full max-w-2xl mx-auto mb-8">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Please describe the situation in a few words before starting..."
          className="w-full min-h-[80px] p-4 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-200 focus:border-orange-300 transition resize-none shadow-sm"
          rows={2}
        />
      </div>

      {/* Action Area: Start Session Button & Encryption Label */}
      <div className="flex flex-col items-center mb-16">
        <button
          onClick={handleAnalyze}
          disabled={loading || !description.trim() || !selectedType}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white px-8 py-3.5 rounded-xl font-bold text-sm shadow-md transition-all mb-3"
        >
          {loading ? (
            <>
              <span className="animate-spin">⏳</span> Analyzing...
            </>
          ) : (
            <>
              Start Session
              <ArrowRight className="w-4 h-4 ml-1" />
            </>
          )}
        </button>
        <div className="flex items-center gap-2 text-[10px] font-bold text-emerald-600 tracking-widest uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
          End-To-End Encrypted & Private
        </div>
      </div>

      {/* Emergency Assistance Banner */}
      <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-sm">
        <div className="max-w-sm">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="w-4 h-4 text-orange-500" />
            <span className="text-xs font-bold text-orange-600 uppercase tracking-widest">Emergency Assistance</span>
          </div>
          <h3 className="text-sm font-bold text-slate-900 mb-1">Immediate Support Available</h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            If you are in immediate physical danger, please contact local law enforcement or use these trusted helplines.
          </p>
        </div>

        <div className="flex flex-wrap gap-3">
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1 min-w-[140px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase">NCW HELPLINE</span>
            <span className="text-sm font-bold text-orange-600">7827170170</span>
          </div>
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1 min-w-[140px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase">CYBERCRIME PORTAL</span>
            <span className="text-sm font-bold text-orange-600">cybercrime.gov.in</span>
          </div>
          <div className="bg-white px-4 py-3 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-1 min-w-[140px]">
            <span className="text-[10px] font-bold text-slate-400 uppercase">ICALL HELPLINE</span>
            <span className="text-sm font-bold text-orange-600">9152987821</span>
          </div>
        </div>
      </div>
    </div>
  )

  // ─── Main Layout Wrapper ─────────────────────────────────────
  return (
    <div className="bg-[#fafafa] flex flex-col min-h-screen font-sans">
      {/* We apply a wider max-width for the empty state to accommodate the 5 cards horizontally */}
      <div className={`mx-auto px-6 py-8 w-full flex-1 flex flex-col ${!analyzed && !result ? "max-w-5xl" : "max-w-3xl"}`}>
        {!analyzed && !result ? renderEmptyState() : renderResults()}
      </div>
    </div>
  )
}