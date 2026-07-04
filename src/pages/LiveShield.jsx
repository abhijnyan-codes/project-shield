import { useState, useRef, useEffect } from "react"
import { Shield, MicOff, Lock, Zap, Phone, AlertTriangle, RefreshCcw } from "lucide-react"
import { analyzeLiveChunk } from "../lib/groq"

export default function LiveShield() {
  const [isActive, setIsActive] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [chunks, setChunks] = useState([])
  const [status, setStatus] = useState("READY")
  const [error, setError] = useState(null)
  const [elapsed, setElapsed] = useState(0)
  const [isSimulation, setIsSimulation] = useState(false)

  const recognitionRef = useRef(null)
  const timerRef = useRef(null)
  const isActiveRef = useRef(false)
  const lastTranscriptRef = useRef("")

  // ─── NOTIFICATIONS ──────────────────────────────────────────────
  const sendNotification = (title, body) => {
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification(title, {
        body: body,
        icon: "/shield-icon.svg",
        vibrate: [200, 100, 200],
        requireInteraction: true,
      })
    }
  }

  // ─── STATUS CONFIG ──────────────────────────────────────────────
  const statusConfig = {
    READY: { label: "SYSTEM READY", color: "text-emerald-600", dot: "bg-emerald-500" },
    LISTENING: { label: "LIVE MONITORING", color: "text-amber-600", dot: "bg-amber-500 animate-pulse" },
    ANALYZING: { label: "ANALYZING", color: "text-blue-600", dot: "bg-blue-500 animate-pulse" },
    ALERT: { label: "🚨 SCAM DETECTED", color: "text-red-600", dot: "bg-red-500 animate-pulse" },
  }

  const formatTime = (s) => {
    const mins = String(Math.floor(s / 60)).padStart(2, "0")
    const secs = String(s % 60).padStart(2, "0")
    return `${mins}:${secs}`
  }

  // ─── SIMULATION MODE (Fallback) ──────────────────────────────
  const startSimulation = () => {
    setIsSimulation(true)
    setIsActive(true)
    setStatus("LISTENING")
    setError(null)
    setChunks([{ time: "00:00", text: "🎤 Simulation mode active — perfect for demo!" }])

    const demoPhrases = [
      { delay: 2000, text: "I just received a call from someone claiming to be from CBI." },
      { delay: 4500, text: "They said I have a pending arrest warrant against my name." },
      { delay: 7000, text: "They asked me to pay ₹50,000 immediately to avoid arrest." },
      { delay: 9500, text: "I'm scared, should I pay them?" },
      { delay: 12000, text: "🚨 SCAM PATTERN DETECTED — Hang up now!", isAlert: true },
    ]

    let idx = 0
    const simInterval = setInterval(() => {
      if (idx >= demoPhrases.length) {
        setStatus("ALERT")
        sendNotification("🚨 Project Shield Alert", demoPhrases[demoPhrases.length - 1].text)
        clearInterval(simInterval)
        return
      }
      const phrase = demoPhrases[idx]
      const currentTime = formatTime(elapsed + idx * 3)
      setChunks((prev) => [
        ...prev,
        {
          time: currentTime,
          text: phrase.text,
          isAlert: phrase.isAlert || false,
        },
      ])
      if (phrase.isAlert) {
        setStatus("ALERT")
        sendNotification("🚨 Project Shield Alert", phrase.text)
        if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      }
      idx++
    }, 3000)

    // Store interval for cleanup
    window.simInterval = simInterval
    return simInterval
  }

  // ─── REAL MICROPHONE (Web Speech API) ─────────────────────────
  const startRealMic = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

    if (!SpeechRecognition) {
      setError("Speech recognition not supported. Switching to simulation.")
      startSimulation()
      return
    }

    try {
      setError(null)
      setStatus("LISTENING")
      setIsActive(true)
      setIsSimulation(false)
      setChunks([{ time: "00:00", text: "🎤 Microphone active. Listening for scam indicators..." }])
      setTranscript("")
      lastTranscriptRef.current = ""

      const recognition = new SpeechRecognition()

      // ✅ KEY FIX: "en-IN" = Indian English → outputs in Roman/Latin script (Hinglish)
      recognition.lang = "en-IN"
      recognition.continuous = true
      recognition.interimResults = true
      recognition.maxAlternatives = 1

      recognition.onstart = () => {
        console.log("Shield is listening...")
      }

      recognition.onerror = (event) => {
        console.error("Speech recognition error:", event.error)

        // ─── BRAVE / FIREFOX FIX ────────────────────────────────────
        if (event.error === "network" || event.error === "not-allowed") {
          setError(
            "🔴 Microphone blocked. In Brave, click the Shield icon and turn it DOWN. " +
            "In Chrome, allow mic permissions. Switching to simulation."
          )
          stopMonitoring()
          setTimeout(() => startSimulation(), 1000)
        } else if (event.error === "no-speech") {
          // Ignore — user is just quiet
        } else {
          setError("Speech recognition failed. Switching to simulation.")
          stopMonitoring()
          setTimeout(() => startSimulation(), 1000)
        }
      }

      recognition.onresult = async (event) => {
        let finalText = ""

        // Extract final transcripts only (ignore interim)
        for (let i = event.resultIndex; i < event.results.length; i++) {
          if (event.results[i].isFinal) {
            const transcriptText = event.results[i][0].transcript.trim()
            if (transcriptText) {
              finalText += transcriptText + " "
            }
          }
        }

        // Only process if we have new final text
        if (finalText.trim().length === 0) return

        // ✅ FIX: Capture timestamp NOW — accurate!
        const timestamp = formatTime(elapsed)

        // Update full transcript
        const newTranscript = transcript + " " + finalText.trim()
        setTranscript(newTranscript)

        // Add to chunks
        setChunks((prev) => [
          ...prev,
          {
            time: timestamp,
            text: `"${finalText.trim()}"`,
          },
        ])

        // ─── ANALYZE FOR SCAMS ─────────────────────────────────────
        setStatus("ANALYZING")

        try {
          const result = await analyzeLiveChunk(newTranscript)

          if (result.riskLevel === "HIGH" || result.shouldEndCall) {
            setStatus("ALERT")
            const alertMsg = result.liveWarning || "🚨 SCAM DETECTED — Hang up immediately."

            setChunks((prev) => [
              ...prev,
              {
                time: "⚠️",
                text: alertMsg,
                isAlert: true,
              },
            ])

            sendNotification("🚨 Project Shield Alert", alertMsg)
            if (navigator.vibrate) navigator.vibrate([200, 100, 200])

            // Play audio alert
            try {
              const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
              const oscillator = audioCtx.createOscillator()
              const gainNode = audioCtx.createGain()
              oscillator.connect(gainNode)
              gainNode.connect(audioCtx.destination)
              oscillator.frequency.value = 800
              oscillator.type = "square"
              gainNode.gain.value = 0.3
              oscillator.start()
              setTimeout(() => oscillator.stop(), 300)
            } catch (e) {
              // Ignore
            }
          } else {
            setStatus("LISTENING")
            if (result.inferredTactics?.length > 0) {
              setChunks((prev) => [
                ...prev,
                {
                  time: "🔍",
                  text: `Tactics: ${result.inferredTactics.join(", ")}`,
                  isTactic: true,
                },
              ])
            }
          }
        } catch (err) {
          console.error("Analysis error:", err)
          setStatus("LISTENING")
        }
      }

      recognition.onend = () => {
        // If still active and not in alert, restart recognition
        if (isActiveRef.current && status !== "ALERT") {
          try {
            recognition.start()
          } catch (e) {
            console.log("Restarting recognition...")
          }
        }
      }

      recognitionRef.current = recognition
      recognition.start()

      // ─── ELAPSED TIMER ──────────────────────────────────────────
      timerRef.current = setInterval(() => {
        setElapsed((prev) => prev + 1)
      }, 1000)
    } catch (err) {
      console.error("Failed to start:", err)
      setError("Failed to start microphone. Using simulation.")
      startSimulation()
    }
  }

  // ─── START / STOP ──────────────────────────────────────────────
  const startMonitoring = () => {
    // Request notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission()
    }
    startRealMic()
  }

  const stopMonitoring = () => {
    isActiveRef.current = false

    // Stop recognition
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop()
      } catch (e) {}
      recognitionRef.current = null
    }

    // Stop simulation interval
    if (window.simInterval) {
      clearInterval(window.simInterval)
      window.simInterval = null
    }

    // Stop timer
    clearInterval(timerRef.current)

    setIsActive(false)
    setStatus("READY")
    setIsSimulation(false)
  }

  // ─── CLEANUP ──────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      isActiveRef.current = false
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop()
        } catch (e) {}
      }
      if (window.simInterval) {
        clearInterval(window.simInterval)
      }
      clearInterval(timerRef.current)
    }
  }, [])

  // ─── UI ──────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#fafafa] pb-20">
      <div className="max-w-4xl mx-auto px-6 flex flex-col items-center py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="font-display font-bold text-3xl text-slate-900">Live Shield</h1>
          <p className="text-slate-500 text-sm mt-1">
            Real-time voice monitoring for active scam calls
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="w-full max-w-2xl bg-red-50 border border-red-200 rounded-xl p-3 mb-4 text-red-700 text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            {error}
          </div>
        )}

        {/* Simulation indicator */}
        {isSimulation && isActive && (
          <div className="w-full max-w-2xl bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4 text-blue-700 text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 flex-shrink-0" />
            Simulation mode active — perfect for demo! (Mic was blocked)
          </div>
        )}

        {/* Big button */}
        <div className="flex flex-col items-center gap-4 my-6">
          <button
            onClick={isActive ? stopMonitoring : startMonitoring}
            className="relative group transition-all duration-300 hover:scale-105"
          >
            {isActive && (
              <div
                className="absolute inset-0 rounded-full bg-orange-200/50 animate-ping"
                style={{ animationDuration: "2s" }}
              />
            )}
            <div
              className={`relative w-40 h-40 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl ${
                isActive
                  ? "bg-orange-100 border-4 border-orange-400 shadow-orange-200/50"
                  : "bg-orange-50 border-2 border-orange-200 hover:bg-orange-100"
              }`}
            >
              {isActive ? (
                <MicOff className="w-16 h-16 text-orange-500" />
              ) : (
                <Shield className="w-16 h-16 text-orange-400" />
              )}
            </div>
          </button>

          <div className="text-center">
            <p className="text-sm font-semibold text-slate-700">
              {isActive ? `MONITORING — ${formatTime(elapsed)}` : "TAP TO START LIVE SHIELD"}
            </p>
            <div className="flex items-center justify-center gap-2 mt-1">
              <span className={`w-1.5 h-1.5 rounded-full ${statusConfig[status].dot}`} />
              <span className={`text-xs font-bold ${statusConfig[status].color}`}>
                {statusConfig[status].label}
              </span>
            </div>
          </div>

          {isActive && (
            <button
              onClick={stopMonitoring}
              className="flex items-center gap-2 text-xs text-slate-500 hover:text-slate-700 transition"
            >
              <RefreshCcw className="w-3 h-3" />
              Stop & Reset
            </button>
          )}
        </div>

        {/* Live Transcript */}
        {chunks.length > 0 && (
          <div className="w-full max-w-2xl bg-white border border-slate-200 rounded-2xl p-5 shadow-sm mt-2 max-h-64 overflow-y-auto">
            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-3">
              <span
                className={`w-2 h-2 rounded-full ${isActive ? "bg-red-400 animate-pulse" : "bg-slate-300"}`}
              />
              {isSimulation ? "SIMULATION TRANSCRIPT" : "LIVE TRANSCRIPT"}
            </div>
            <div className="space-y-2 font-mono text-xs">
              {chunks.map((line, i) => (
                <div
                  key={i}
                  className={`flex gap-3 pb-1.5 border-b border-slate-50 ${
                    line.isAlert
                      ? "bg-red-50 -mx-2 px-2 py-1 rounded border border-red-200"
                      : line.isTactic
                      ? "bg-blue-50 -mx-2 px-2 py-1 rounded border border-blue-100"
                      : ""
                  }`}
                >
                  <span
                    className={`w-12 flex-shrink-0 ${
                      line.isAlert ? "text-red-500" : line.isTactic ? "text-blue-500" : "text-slate-400"
                    }`}
                  >
                    {line.time}
                  </span>
                  <span
                    className={
                      line.isAlert ? "text-red-700 font-bold" : line.isTactic ? "text-blue-700" : "text-slate-700"
                    }
                  >
                    {line.text}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Alert banner */}
        {status === "ALERT" && (
          <div className="w-full max-w-2xl mt-4 bg-red-500 text-white rounded-2xl p-5 text-center animate-pulse">
            <p className="font-display font-bold text-lg">🚨 SCAM DETECTED</p>
            <p className="text-sm mt-1 opacity-90">
              Hang up immediately. Do not share any personal or financial information.
            </p>
            <a
              href="https://cybercrime.gov.in"
              target="_blank"
              rel="noreferrer"
              className="inline-block mt-3 px-4 py-2 bg-white text-red-500 text-xs font-bold rounded-xl hover:bg-red-50 transition"
            >
              Report to Cybercrime Portal →
            </a>
          </div>
        )}

        {/* Feature cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mt-10">
          {[
            {
              icon: <Phone className="w-5 h-5" />,
              title: "Works During Calls",
              desc: "Put the call on speakerphone. Shield listens to your voice in real time.",
            },
            {
              icon: <Lock className="w-5 h-5" />,
              title: "Privacy First",
              desc: "Only your voice is processed. The other party is never recorded.",
            },
            {
              icon: <Zap className="w-5 h-5" />,
              title: "AI-Powered Detection",
              desc: "Groq Llama 3.3 analyzes your speech patterns instantly — no delays.",
            },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-500 mx-auto mb-3">
                {item.icon}
              </div>
              <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Notification status */}
        <div className="mt-8 text-[10px] text-slate-400">
          {("Notification" in window && Notification.permission === "granted") ? (
            <span>🔔 Notifications enabled</span>
          ) : ("Notification" in window && Notification.permission === "denied") ? (
            <span>🔕 Notifications blocked — enable in browser settings</span>
          ) : (
            <span>🔔 Click "Start" to enable scam alerts</span>
          )}
        </div>

        {/* Language hint */}
        <div className="mt-2 text-[10px] text-slate-400">
          🌐 Transcribes Hinglish & Indian English in Roman/Latin script
        </div>
      </div>
    </div>
  )
}