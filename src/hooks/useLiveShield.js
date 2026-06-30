import { useState, useRef, useCallback } from "react"
import { analyzeLiveChunk, transcribeAudio, analyzeScam } from "../lib/groq"

export function useLiveShield() {
  const [isMonitoring, setIsMonitoring] = useState(false)
  const [transcript, setTranscript] = useState("")
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const intervalRef = useRef(null)

  // ── Live monitoring ──────────────────────────────────────────
  const startMonitoring = useCallback(async () => {
    setError(null)
    setTranscript("")
    setResult(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      chunksRef.current = []

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mediaRecorder.start(1000)
      setIsMonitoring(true)

      // analyze every 15 seconds
      intervalRef.current = setInterval(async () => {
        if (chunksRef.current.length === 0) return
        const blob = new Blob(chunksRef.current, { type: "audio/webm" })
        const file = new File([blob], "chunk.webm", { type: "audio/webm" })
        try {
          const text = await transcribeAudio(file)
          setTranscript((prev) => prev + " " + text)
          const analysis = await analyzeLiveChunk(transcript + " " + text)
          setResult(analysis)
        } catch (err) {
          console.error("Live analysis error:", err)
        }
      }, 15000)

    } catch (err) {
      setError("Microphone access denied. Please allow mic permissions.")
    }
  }, [transcript])

  const stopMonitoring = useCallback(() => {
    clearInterval(intervalRef.current)
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(t => t.stop())
    }
    setIsMonitoring(false)
  }, [])

  // ── Audio file upload ────────────────────────────────────────
  const analyzeUpload = useCallback(async (audioFile) => {
    setLoading(true)
    setError(null)
    setResult(null)
    try {
      const text = await transcribeAudio(audioFile)
      setTranscript(text)
      const analysis = await analyzeScam(text)
      setResult(analysis)
    } catch (err) {
      console.error(err)
      setError("Transcription failed. Check file format or API key.")
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    isMonitoring,
    transcript,
    result,
    loading,
    error,
    startMonitoring,
    stopMonitoring,
    analyzeUpload,
  }
}