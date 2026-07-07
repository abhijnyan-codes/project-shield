import { useState, useRef, useEffect } from "react"
import { analyzeScam, analyzeURLOrFile } from "../lib/groq"
import { transcribeAudio } from "../lib/groq"
import { generateIncidentReport } from "../lib/reportGenerator"
import { scanURL } from "../lib/virusTotal"
import { detectAIImageFromFile } from "../lib/geminiImageDetector"
import { 
  Shield, 
  Send, 
  FileText, 
  AlertTriangle, 
  Lock, 
  Zap, 
  RefreshCcw, 
  Mic, 
  Paperclip, 
  Square, 
  X, 
  FileDown,
  Link2,
  MessageSquare,
  Image,
  Plus,
  ArrowUp
} from "lucide-react"

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

// ─── Scam DNA Match Card ──────────────────────────────────
function DnaMatchCard({ dna }) {
  if (!dna || !dna.campaignName) return null

  const percentage = dna.matchPercentage || 0
  const color = percentage > 80 ? "bg-red-500" : percentage > 50 ? "bg-amber-500" : "bg-blue-500"

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">🧬 Scam DNA Match</span>
        <span className="text-xs font-bold text-slate-900">{percentage}% match</span>
      </div>
      <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
        <div 
          className={`h-full ${color} rounded-full transition-all duration-1000`} 
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-sm font-semibold text-slate-800 mt-1">{dna.campaignName}</p>
      <p className="text-xs text-slate-500 leading-relaxed">{dna.description}</p>
    </div>
  )
}

// ─── VirusTotal Stats Display ──────────────────────────────────
function VirusTotalStats({ stats }) {
  if (!stats) return null
  
  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex flex-wrap gap-3 text-xs">
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        Malicious: {stats.malicious || 0}
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        Suspicious: {stats.suspicious || 0}
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        Harmless: {stats.harmless || 0}
      </span>
      <span className="flex items-center gap-1">
        <span className="w-2 h-2 rounded-full bg-slate-300" />
        Undetected: {stats.undetected || 0}
      </span>
    </div>
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

        {/* Show analysis source for URL scans */}
        {result.isURLScan && (
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="bg-slate-100 px-2 py-0.5 rounded-full">🤖 AI Analysis</span>
            {result.vendorStats && (
              <span className="bg-slate-100 px-2 py-0.5 rounded-full">🔗 VirusTotal</span>
            )}
          </div>
        )}

        {/* Show Gemini model for AI image detection */}
        {result.model && result.isAIImage !== undefined && (
          <div className="flex items-center gap-2 text-[10px] text-slate-400">
            <span className="bg-slate-100 px-2 py-0.5 rounded-full">🧠 Gemini</span>
            <span className="bg-slate-100 px-2 py-0.5 rounded-full">
              {result.isAIImage ? `AI: ${result.model}` : `Real Image`}
            </span>
            {result.confidence !== undefined && (
              <span className="bg-slate-100 px-2 py-0.5 rounded-full">
                {result.confidence}% confidence
              </span>
            )}
          </div>
        )}

        {/* 🧬 Scam DNA Match - Rendered here */}
        {result.dnaMatch && <DnaMatchCard dna={result.dnaMatch} />}

        {/* 🔗 VirusTotal Stats */}
        {result.vendorStats && <VirusTotalStats stats={result.vendorStats} />}

        {result.riskLevel === "HIGH" && (
          <p className="text-red-600 font-bold text-sm bg-red-50 px-3 py-2.5 rounded-lg border border-red-100">
            🚨 Do not engage. Do not pay.
          </p>
        )}

        <p className="text-sm text-slate-700 leading-relaxed">{result.summary}</p>

        {/* Threat Score for URL scans */}
        {result.threatScore !== undefined && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">Threat Score:</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  result.threatScore > 70 ? "bg-red-500" : 
                  result.threatScore > 40 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${result.threatScore}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{result.threatScore}/100</span>
          </div>
        )}

        {/* Confidence for AI image detection */}
        {result.confidence !== undefined && result.model && (
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-500">AI Probability:</span>
            <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full ${
                  result.confidence > 70 ? "bg-red-500" : 
                  result.confidence > 40 ? "bg-amber-500" : "bg-emerald-500"
                }`}
                style={{ width: `${result.confidence}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{result.confidence}%</span>
          </div>
        )}

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

        {/* Action Row */}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <a
            href="https://cybercrime.gov.in"
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition"
          >
            Report to Cybercrime Portal
          </a>

          <button
            onClick={() => {
              const reportData = {
                riskLevel: result.riskLevel,
                summary: result.summary,
                redFlags: result.redFlags || [],
                flaggedPhrases: result.flaggedPhrases || [],
                advice: result.advice,
                transcript: result.transcript || "No transcript available",
                timestamp: new Date().toISOString(),
              }
              generateIncidentReport(reportData)
            }}
            className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition shadow-sm"
          >
            <FileDown className="w-3.5 h-3.5 inline mr-1" />
            PDF Report
          </button>

          <button
            onClick={() => navigator.clipboard.writeText(`SCAM ALERT: ${result.summary}\nAction: ${result.advice}`)}
            className="px-4 py-2 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition shadow-sm ml-auto"
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
      <div className="bg-slate-800 text-white rounded-3xl rounded-tr-sm px-5 py-3.5 max-w-2xl text-sm leading-relaxed whitespace-pre-wrap break-words shadow-sm">
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

  // ─── Multi-modal state ──────────────────────────────────────────
  const [isRecording, setIsRecording] = useState(false)
  const [recordingTime, setRecordingTime] = useState(0)
  const [attachment, setAttachment] = useState(null)
  const [isProcessingAudio, setIsProcessingAudio] = useState(false)
  const [transcriptionResult, setTranscriptionResult] = useState(null)
  
  // ─── Scanner Mode ──────────────────────────────────────────────
  const [scanMode, setScanMode] = useState("scam") // "scam" | "url" | "image"
  
  const fileInputRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const audioChunksRef = useRef([])
  const timerRef = useRef(null)
  const textareaRef = useRef(null) // Added for auto-expanding textarea

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, loading, isProcessingAudio])

  // ─── File Upload ──────────────────────────────────────────────────
  const handleFileChange = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    // ─── IMAGE FILES (for Image Scanner mode) ──────────────────────
    if (file.type.startsWith("image/")) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif", "image/webp", "image/svg+xml", "image/bmp"]
      if (validImageTypes.includes(file.type)) {
        setAttachment(file)
        return
      } else {
        alert("Please upload a valid image file (JPEG, PNG, GIF, WebP, SVG, or BMP).")
        return
      }
    }

    // ─── AUDIO FILES (for Scam Message mode) ──────────────────────
    const validAudioTypes = ["audio/mpeg", "audio/mp3", "audio/wav", "audio/m4a", "audio/ogg", "audio/webm", "audio/mp4"]
    const validAudioExtensions = /\.(mp3|wav|m4a|ogg|webm|mp4|mpga)$/i

    if (file.type.startsWith("audio/") || validAudioExtensions.test(file.name)) {
      if (file.size > 25 * 1024 * 1024) {
        alert("File too large. Please upload a file under 25MB.")
        return
      }
      await processAudioFile(file)
      return
    }

    // ─── UNKNOWN FILE TYPE ──────────────────────────────────────────
    alert("Please upload a valid image (JPEG, PNG, etc.) or audio file (MP3, WAV, etc.).")
  }

  // ─── Process Audio File ──────────────────────────────────────────
  const processAudioFile = async (file) => {
    setMessages(prev => [...prev, { 
      type: "user", 
      text: `🎤 Uploaded: ${file.name}`
    }])
    
    setIsProcessingAudio(true)
    setLoading(true)

    try {
      const transcribedText = await transcribeAudio(file)
      
      if (!transcribedText || transcribedText.trim().length === 0) {
        setMessages(prev => [...prev, {
          type: "shield",
          result: {
            riskLevel: "LOW",
            summary: "No speech detected in the audio. Please try a clearer recording with speech.",
            redFlags: [],
            flaggedPhrases: [],
            advice: "Make sure the audio contains clear speech and try again."
          }
        }])
        setIsProcessingAudio(false)
        setLoading(false)
        return
      }

      const displayText = transcribedText.length > 200 
        ? transcribedText.substring(0, 200) + "..." 
        : transcribedText
      
      setMessages(prev => [...prev, { 
        type: "user", 
        text: `📝 Transcribed: "${displayText}"`
      }])

      const result = await analyzeScam(transcribedText)
      setMessages(prev => [...prev, { type: "shield", result }])

    } catch (err) {
      console.error("Transcription error:", err)
      let userFriendlyMessage = "Transcription failed. Please try again."
      if (err.message.includes("network") || err.message.includes("fetch")) {
        userFriendlyMessage = "Network error. Please check your internet connection."
      } else if (err.message.includes("unsupported") || err.message.includes("format")) {
        userFriendlyMessage = "Audio format not supported. Please try MP3, WAV, or M4A."
      }
      setMessages(prev => [...prev, {
        type: "shield",
        result: {
          riskLevel: "LOW",
          summary: userFriendlyMessage,
          redFlags: [],
          flaggedPhrases: [],
          advice: "Try recording with a clearer voice or upload a different audio file."
        }
      }])
    } finally {
      setIsProcessingAudio(false)
      setLoading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  // ─── Recording Logic ─────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data)
        }
      }

      mediaRecorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" })
        if (blob.size < 1000) {
          setMessages(prev => [...prev, {
            type: "shield",
            result: {
              riskLevel: "LOW",
              summary: "Recording was too short or silent. Please try again.",
              redFlags: [],
              flaggedPhrases: [],
              advice: "Speak clearly for at least 3 seconds."
            }
          }])
          return
        }
        const file = new File([blob], `recording-${Date.now()}.webm`, { type: "audio/webm" })
        await processAudioFile(file)
      }

      mediaRecorder.start()
      setIsRecording(true)
      setRecordingTime(0)

      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1)
      }, 1000)

    } catch (err) {
      console.error("Mic access error:", err)
      alert("Please allow microphone access to record audio.")
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
    }
    clearInterval(timerRef.current)
    setIsRecording(false)
  }

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording()
    } else {
      startRecording()
    }
  }

  // ─── Auto-Resize Textarea ───────────────────────────────────────
  const handleInputChange = (e) => {
    setInput(e.target.value)
    if (textareaRef.current) {
      // Reset height to auto to calculate shrinkage if user deletes text
      textareaRef.current.style.height = "auto"
      // Set new height based on scrollHeight, capped at 200px
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`
    }
  }

  // ─── Send Text ──────────────────────────────────────────────────
  async function handleSend(textOverride) {
    const userText = textOverride || input
    if (!userText.trim() && !attachment) return

    const displayMessage = userText.trim() ? userText : `[Attached File: ${attachment?.name}]`
    
    setInput("")
    // Reset textarea height after sending
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
    }

    const currentAttachment = attachment
    setAttachment(null)
    
    setMessages(prev => [...prev, { type: "user", text: displayMessage }])
    setLoading(true)
    
    try {
      let result

      // ─── URL Scanner Mode ──────────────────────────────────────
      if (scanMode === "url") {
        const aiResult = await analyzeURLOrFile(userText)
        let vtResult = null
        try {
          vtResult = await scanURL(userText)
        } catch (e) {
          console.warn("VirusTotal unavailable:", e)
        }
        
        const redFlags = []
        if (aiResult.redFlags) {
          aiResult.redFlags.forEach(flag => {
            redFlags.push({
              type: flag.type || "AI Analysis",
              detail: flag.detail || flag
            })
          })
        }
        if (vtResult && vtResult.redFlags) {
          vtResult.redFlags.forEach(flag => {
            if (!redFlags.some(f => f.detail === flag.detail)) {
              redFlags.push(flag)
            }
          })
        }
        
        const riskLevels = { LOW: 0, MEDIUM: 1, HIGH: 2 }
        const aiRisk = riskLevels[aiResult.riskLevel] || 0
        const vtRisk = vtResult ? riskLevels[vtResult.riskLevel] || 0 : 0
        const finalRisk = Object.keys(riskLevels).find(k => riskLevels[k] === Math.max(aiRisk, vtRisk)) || "LOW"
        
        let vendorStats = null
        if (vtResult && vtResult.vendorStats) {
          vendorStats = vtResult.vendorStats
        }
        
        let summary = aiResult.summary || ""
        if (vtResult && vtResult.summary && !vtResult.isFallback) {
          summary = summary + " — " + vtResult.summary
        }
        
        result = {
          riskLevel: finalRisk,
          summary: summary,
          redFlags: redFlags,
          flaggedPhrases: aiResult.flaggedPhrases || [],
          advice: aiResult.advice || vtResult?.advice || "Proceed with caution.",
          vendorStats: vendorStats,
          threatScore: aiResult.threatScore || (finalRisk === "HIGH" ? 85 : finalRisk === "MEDIUM" ? 55 : 20),
          isURLScan: true,
        }
      }
      // ─── Image Scanner Mode ────────────────────────────────────
      else if (scanMode === "image") {
        if (currentAttachment && currentAttachment.type.startsWith("image/")) {
          // User uploaded an actual image file → Use Gemini
          const detection = await detectAIImageFromFile(currentAttachment)
          
          // Also run text analysis on user description (if any)
          let descriptionResult = null
          if (userText && userText.trim()) {
            try {
              descriptionResult = await analyzeURLOrFile(userText)
            } catch (e) {
              console.warn("Description analysis failed:", e)
            }
          }
          
          // Combine results
          const redFlags = [...detection.redFlags]
          if (descriptionResult && descriptionResult.redFlags) {
            descriptionResult.redFlags.forEach(flag => {
              if (!redFlags.some(f => f.detail === flag.detail)) {
                redFlags.push(flag)
              }
            })
          }
          
          result = {
            riskLevel: detection.riskLevel,
            summary: detection.summary + (descriptionResult ? " — " + descriptionResult.summary : ""),
            redFlags: redFlags,
            flaggedPhrases: descriptionResult?.flaggedPhrases || [],
            advice: detection.advice + " " + (descriptionResult?.advice || ""),
            confidence: detection.confidence,
            model: detection.model || "Unknown",
            isAIImage: detection.isAIGenerated || false,
            isURLScan: false,
          }
        } else {
          // No image uploaded — just run text analysis on the description
          result = await analyzeURLOrFile(userText || "No description provided")
          result.summary = "🖼️ Image Description Analysis: " + result.summary
          result.redFlags.push({ type: "Image Analysis", detail: "Description analyzed for scam indicators." })
          result.confidence = result.threatScore || 50
          result.isURLScan = false
        }
      }
      // ─── Scam Message Mode ─────────────────────────────────────
      else {
        result = await analyzeScam(userText || "No text provided")
      }
      
      setMessages(prev => [...prev, { type: "shield", result }])
    } catch (err) {
      console.error("Analysis error:", err)
      setMessages(prev => [...prev, {
        type: "shield",
        result: {
          riskLevel: "LOW",
          summary: "Analysis failed. Please try again.",
          redFlags: [],
          flaggedPhrases: [],
          advice: "Check your internet connection and try again."
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

  // ─── Format Recording Time ──────────────────────────────────────
  const formatTime = (seconds) => {
    const mins = String(Math.floor(seconds / 60)).padStart(2, "0")
    const secs = String(seconds % 60).padStart(2, "0")
    return `${mins}:${secs}`
  }

  // ─── The Multi-modal Input Box (Chat Style) ──────────────────────
  const InputPill = (
    <div className="relative flex flex-col w-full bg-white border border-slate-300 shadow-sm shadow-slate-200/50 rounded-3xl overflow-hidden focus-within:border-orange-400 focus-within:ring-1 focus-within:ring-orange-400 transition-all">
      
      {/* Attachments & Recording Badges */}
      {attachment && (
        <div className="flex items-center gap-2 mx-4 mt-3 px-3 py-1.5 bg-orange-50 text-orange-700 text-xs font-semibold rounded-xl w-max border border-orange-100 animate-in fade-in slide-in-from-bottom-1">
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

      {isRecording && (
        <div className="flex items-center gap-2 mx-4 mt-3 px-3 py-1.5 bg-red-50 text-red-600 text-xs font-semibold rounded-xl w-max border border-red-200 animate-pulse">
          <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
          Recording... {formatTime(recordingTime)}
        </div>
      )}

      {isProcessingAudio && (
        <div className="flex items-center gap-2 mx-4 mt-3 px-3 py-1.5 bg-blue-50 text-blue-600 text-xs font-semibold rounded-xl w-max border border-blue-200 animate-pulse">
          <span className="w-2 h-2 bg-blue-500 rounded-full animate-spin" />
          Transcribing audio with Whisper...
        </div>
      )}

      {/* Auto-expanding Text Area */}
      <textarea
        ref={textareaRef}
        value={input}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder={
          scanMode === "url" 
            ? "Paste a suspicious URL or describe a file..." 
            : scanMode === "image"
            ? "Describe the image or upload a screenshot..."
            : "Paste message, upload screenshot, or record..."
        }
        className="w-full max-h-[200px] min-h-[52px] pt-3 pb-2 px-4 resize-none bg-transparent outline-none text-slate-800 placeholder:text-slate-500 text-[15px] leading-relaxed overflow-y-auto"
        rows={1}
      />
      
      {/* Bottom Action Bar */}
      <div className="flex items-center justify-between px-3 pb-2.5 pt-1">
        
        {/* Left Side Controls (Upload) */}
        <div className="flex items-center gap-1">
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="audio/*,image/*" 
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
            title="Upload image or audio"
          >
            <Plus className="w-5 h-5" /> 
          </button>
        </div>

        {/* Right Side Controls (Mic & Send) */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleMicToggle}
            className={`p-2 rounded-full transition-all ${
              isRecording 
                ? 'text-red-500 bg-red-50 hover:bg-red-100 animate-pulse' 
                : 'text-slate-400 hover:text-slate-700 hover:bg-slate-100'
            }`}
            title={isRecording ? "Stop recording" : "Record audio"}
          >
            {isRecording ? <Square className="w-5 h-5" fill="currentColor" /> : <Mic className="w-5 h-5" />}
          </button>

          <button
            onClick={() => handleSend()}
            disabled={loading || isProcessingAudio || (!input.trim() && !attachment && !isRecording)}
            className="w-9 h-9 ml-1 rounded-full bg-slate-900 hover:bg-slate-800 text-white flex items-center justify-center transition-all disabled:opacity-40 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed shadow-sm"
          >
            <ArrowUp className="w-4 h-4 ml-[1px]" />
          </button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="bg-[#fafafa] flex flex-col h-[calc(100vh-70px)] font-sans relative overflow-hidden">
      
      {messages.length === 0 ? (
        <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center px-4 -mt-10">
          <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center shadow-sm shadow-orange-100/50 mb-6">
            <Shield className="w-7 h-7 text-orange-600" />
          </div>

          <h1 className="font-display font-bold text-3xl text-slate-900 tracking-tight">
            {scanMode === "url" 
              ? "🔗 Scan URL or File" 
              : scanMode === "image"
              ? "🖼️ Image Scanner"
              : "Describe your situation"}
          </h1>
          <p className="text-slate-500 text-sm mt-3 max-w-sm text-center leading-relaxed">
            {scanMode === "url" 
              ? "Paste a suspicious link or file name for instant threat analysis." 
              : scanMode === "image"
              ? "Upload a screenshot or describe an image for forensic analysis."
              : "Paste a suspicious message, upload a screenshot, or record a call."
            }
          </p>

          {/* ─── Mode Toggle ────────────────────────────────────────── */}
          <div className="flex flex-wrap gap-2 mt-4 bg-white border border-slate-200 rounded-full p-1 shadow-sm">
            <button 
              onClick={() => setScanMode("scam")} 
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                scanMode === "scam" 
                  ? "bg-[var(--color-danger)] text-white" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Scam</span>
            </button>
            <button 
              onClick={() => setScanMode("url")} 
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                scanMode === "url" 
                  ? "bg-[var(--color-danger)] text-white" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Link2 className="w-3.5 h-3.5" />
              <span>URL</span>
            </button>
            <button 
              onClick={() => setScanMode("image")} 
              className={`px-4 py-1.5 rounded-full text-xs font-semibold transition flex items-center gap-1 ${
                scanMode === "image" 
                  ? "bg-[var(--color-danger)] text-white" 
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Image className="w-3.5 h-3.5" />
              <span>Image</span>
            </button>
          </div>

          <button
            onClick={() => handleSend(
              scanMode === "url" 
                ? "https://icici-secure-login.xyz/verify-account" 
                : scanMode === "image"
                ? "A screenshot of a bank statement showing a transaction of ₹50,000 to 'RBI Verification Fund'. The font looks slightly off, and the logo is pixelated."
                : EXAMPLE
            )}
            className="mt-6 flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-blue-600 bg-white border border-blue-200 rounded-xl hover:bg-blue-50 transition shadow-sm"
          >
            <FileText className="w-3.5 h-3.5" />
            {scanMode === "url" ? "Try a suspicious URL" : scanMode === "image" ? "Try a fake image description" : "Try an example"}
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