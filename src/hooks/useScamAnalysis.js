import { useState } from "react"
import { analyzeScam } from "../lib/groq"

export function useScamAnalysis() {
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function analyze(text) {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    try {
      const data = await analyzeScam(text)
      setResult(data)
    } catch (err) {
      console.error(err)
      setError("Analysis failed. Check your API key or try again.")
    } finally {
      setLoading(false)
    }
  }

  return { result, loading, error, analyze }
}