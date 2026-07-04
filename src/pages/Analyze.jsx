import { useState, useRef, useEffect } from "react"
import { analyzeScam } from "../lib/groq"
import { Shield, Send, FileText, AlertTriangle, Lock, Zap, RefreshCcw, Mic, Paperclip, Square, X } from "lucide-react"

function RiskBadge({ level }) {
  const styles = {
    HIGH: "bg-red-500 text-white",
    MEDIUM: "bg-amber-500 text-white",
    LOW: "bg-emerald-500 text-white",
  }
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold tracking-wider ${styles[level]}`}>
      <AlertTriangle className="w-3 h-3" />
      {level} RISK
    </span>
  )
}

function ShieldMessage({ result }) {
  return (
    <div className="flex gap-4 items-start animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 mt-1 border border-orange-200">
        <Shield className="w-4 h-4 text-orange-600" />
      </div>
      <div className="flex-1 bg-white border border-slate-200 rounded-2xl rounded-tl-none p-5 flex flex-col gap-4 max-w-3xl shadow-sm">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Threat Intelligence</span>
          <RiskBadge level={result.riskLevel} />
        </div>

        {result.riskLevel === "HIGH" && (
          <p className="text-red-600 font-bold text-sm bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
            🚨 Do not engage. Do not pay.
          </p>
        )}

        <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>

        {result.redFlags?.length > 0 && (
          <div className="bg-slate-50 rounded-xl p-4 flex flex-col gap-2.5 border border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-1">Forensic Breakdown</span>
            {result.redFlags.map((flag, i) => (
              <div key={i} className="flex gap-2.5 text-sm text-slate-700">
                <span className="text-red-400 mt-0.5 flex-shrink-0">✕</span>
                <span><span className="font-semibold text-slate-900">{flag.type}:</span> {flag.detail}</span>
              </div>
            ))}
          </div>
        )}

        {result.flaggedPhrases?.length > 0 && (
          <div className="flex flex-col gap-2">
            {result.flaggedPhrases.map((phrase, i) => (
              <div key={i} className="flex items-start gap-2 bg-amber-50 border border-amber-200/60 rounded-lg px-3 py-2">
                <span className="text-amber-500 text-xs mt-0.5">⚠</span>
                <span className="font-mono text-xs text-slate-800 leading-relaxed">"{phrase}"</span>
              </div>
            ))}
          </div>
        )}

        <div className="pt-2 border-t border-slate-100">
          <p className="text-sm text-slate-700">
            <span className="font-semibold text-slate-900">Next Steps: </span>{result.advice}
          </p>
        </div>

        <div className="flex flex-wrap gap-2 mt-1">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Report to Cybercrime Portal
          </a>
          <button
            onClick={() => navigator.clipboard.writeText(`SCAM ALERT: ${result.summary}\nAction: ${result.advice}`)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-sm"
          >
            Copy Warning
          </button>
        </div>
      </div>
    </div>
  )
}

function UserMessage({ text }) {
  return (
    <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-slate-800 text-white rounded-3xl rounded-tr-sm px-5 py-3.5 max-w-2xl text-sm leading-relaxed whitespace-pre-wrap shadow-sm">
        {text}
      </div>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex gap-4 items-center">
      <div className="w-9 h-9 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0 border border-orange-200">
        <Shield className="w-4 h-4 text-orange-600" />
      </div>
      <div className="bg-white border border-slate-200 shadow-sm rounded-2xl rounded-tl-none px-5 py-3.5">
        <div className="flex gap-1.5 items-center">
          <span className="text-xs text-slate-400 font-medium mr-2">Analyzing threat</span>
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{animationDelay: '0ms'}} />
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{animationDelay: '150ms'}} />
          <span className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-bounce" style={{animationDelay: '300ms'}} />
        </div>
      </div>
    </div>
  )
}

const EXAMPLE = `URGENT: This is Inspector Sharma from CBI. Your Aadhaar card has been linked to a money laundering case. A warrant has been issued for your arrest. Transfer Rs. 50,000 immediately to the RBI secure verification account to halt the arrest proceedings. Do not tell anyone or you will be charged with evidence tampering.`

export default function Analyze() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  // Multi-modal state
  const [isRecording, setIsRecording] = useState(false)
  const [attachment, setAttachment] = useState(null)
  const fileInputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading])

  // File Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setAttachment(file)
      // You can trigger auto-analysis here, or wait for them to press send.
    }
  }

  const handleMicToggle = () => {
    setIsRecording(!isRecording)
    // Hook up to your Whisper logic here
  }

  async function handleSend(textOverride) {
    const userText = textOverride || input
    
    // Check if we have text OR an attachment before firing
    if (!userText.trim() && !attachment) return

    // Build the user message visual (handle attachment name if no text)
    const displayMessage = userText.trim() ? userText : `[Attached File: ${attachment.name}]`

    setInput("")
    setAttachment(null) // clear attachment after sending
    setIsRecording(false) // ensure mic is off
    
    setMessages(prev => [...prev, { type: "user", text: displayMessage }])
    setLoading(true)
    
    try {
      // NOTE: Pass the attachment to your API if it exists alongside the text
      const result = await analyzeScam(userText, attachment) 
      setMessages(prev => [...prev, { type: "shield", result }])
    } catch (err) {
      setMessages(prev => [...prev, {
        type: "shield",
        result: {
          riskLevel: "LOW",
          summary: "Analysis failed. Please check your API key.",
          redFlags: [],
          flaggedPhrases: [],
          advice: "Try again or check your internet connection."
        }
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // The Multi-modal Input Pill
  const InputPill = (
    <div className="relative flex flex-col w-full bg-white/90 backdrop-blur-md border border-slate-200 shadow-[0_4px_25px_-5px_rgba(0,0,0,0.1)] rounded-[32px] pt-2 pb-1.5 px-2 focus-within:bg-white focus-within:border-orange-300 focus-within:ring-4 focus-within:ring-orange-50 transition-all">
      
      {/* Attachment Preview Chip */}
      {attachment && (
        <div className="flex items-center gap-2 mx-4 mt-1 mb-1 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-xl w-max border border-orange-100 animate-in fade-in slide-in-from-bottom-1">
          <Paperclip className="w-3.5 h-3.5" />
          <span className="truncate max-w-[150px]">{attachment.name}</span>
          <button 
            onClick={() => setAttachment(null)}
            className="hover:bg-orange-200 p-0.5 rounded-full transition-colors ml-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex items-end gap-2 w-full">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Paste message, upload screenshot, or record..."
          className="flex-1 max-h-[200px] min-h-[44px] py-2.5 px-5 resize-none bg-transparent outline-none text-slate-700 placeholder:text-slate-400 text-[15px] leading-relaxed"
          rows={1}
        />
        
        {/* Action Button Group */}
        <div className="flex items-center gap-1.5 mb-1 mr-1 flex-shrink-0">
          
          {/* Hidden File Input */}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*,audio/*" 
          />
          
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Upload image or audio"
          >
            <Paperclip className="w-4.5 h-4.5" />
          </button>

          <button
            onClick={handleMicToggle}
            className={`p-2.5 rounded-full transition-all ${
              isRecording 
                ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse shadow-sm' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title="Record audio"
          >
            {isRecording ? <Square className="w-4.5 h-4.5" fill="currentColor" /> : <Mic className="w-4.5 h-4.5" />}
          </button>

          <button
            onClick={() => handleSend()}
            disabled={loading || (!input.trim() && !attachment && !isRecording)}
            className="w-10 h-10 ml-1 rounded-full bg-[#ffab8a] hover:bg-orange-500 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Send className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-[#fafafa] flex flex-col h-[calc(100vh-70px)] font-sans relative overflow-hidden">
      
      {messages.length === 0 ? (
        /* ================= EMPTY STATE ================= */
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 -mt-10">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center shadow-sm shadow-orange-100/50 mb-6">
            <Shield className="w-7 h-7 text-orange-600" />
          </div>

          <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight">Describe your situation</h1>
          <p className="text-slate-500 text-sm mt-3 max-w-sm text-center leading-relaxed">
            Paste a suspicious message, upload a screenshot, or record a call
          </p>

          <button
            onClick={() => handleSend(EXAMPLE)}
            className="mt-6 flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-blue-600 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            Try an example
          </button>

          <div className="flex items-center gap-4 text-[10px] text-slate-400 font-bold tracking-[0.15em] uppercase mt-8 mb-6">
            <span className="flex items-center gap-1.5"><Lock className="w-3 h-3" /> End-to-end encrypted</span>
            <span className="w-1 h-1 bg-slate-300 rounded-full" />
            <span className="flex items-center gap-1.5"><Zap className="w-3 h-3" /> Secure analysis</span>
          </div>

          <div className="w-full max-w-4xl">
            {InputPill}
            <p className="text-[11px] text-slate-400 mt-3 text-center font-medium">Press Enter to analyze · Shift+Enter for new line</p>
          </div>
        </div>
      ) : (

        /* ================= CHAT STATE ================= */
        <>
          <div className="absolute top-6 right-6 lg:right-10 z-20">
            <button
              onClick={() => setMessages([])}
              className="flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 bg-white/80 backdrop-blur-md px-4 py-2.5 border border-slate-200 rounded-full shadow-sm transition-all"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Clear Session
            </button>
          </div>

          <div className="flex-1 overflow-y-auto w-full no-scrollbar pt-20 pb-40">
            <div className="max-w-4xl mx-auto w-full px-6 flex flex-col gap-6">
              {messages.map((msg, i) =>
                msg.type === "user"
                  ? <UserMessage key={i} text={msg.text} />
                  : <ShieldMessage key={i} result={msg.result} />
              )}
              {loading && <TypingIndicator />}
              <div ref={bottomRef} className="h-4" />
            </div>
          </div>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-full max-w-4xl px-6 z-20">
            {InputPill}
            <p className="text-[11px] text-slate-500 mt-2.5 text-center font-medium drop-shadow-sm">
              Press Enter to analyze · Shift+Enter for new line
            </p>
          </div>
        </>
      )}
    </div>
  )
}