import Groq from "groq-sdk"

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
  dangerouslyAllowBrowser: true,
})

// ── Scam Detector (text analysis) ──────────────────────────────
export const SCAM_DETECTOR_SYSTEM_PROMPT = `You are Project Shield's scam detection engine, built for Indian citizens.

Analyze the user's pasted message/transcript for scam indicators, especially:
- Impersonation of authorities (CBI, ED, Customs, Police, RBI, courts)
- Urgency/fear tactics ("immediate arrest", "warrant issued", "do not tell anyone")
- Requests for money, gift cards, UPI transfers, or "verification" payments
- "Digital arrest" patterns (forced video calls, threats of legal action)
- Suspicious links, fake portals, OTP requests

Respond ONLY with valid JSON in this exact structure, no markdown, no preamble:

{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "summary": "one sentence describing what this is",
  "redFlags": [
    { "type": "Impersonation" | "Urgency" | "Financial Request" | "Suspicious Link" | "Other", "detail": "short explanation" }
  ],
  "flaggedPhrases": ["exact phrase from input 1", "exact phrase from input 2"],
  "advice": "one sentence of clear action advice"
}

Rules:
- flaggedPhrases must be exact substrings copied from the user's input, max 4 phrases.
- redFlags max 3 items.
- If the message is clearly benign, riskLevel is LOW and redFlags/flaggedPhrases can be empty arrays.
- Be decisive. Do not hedge.`

export async function analyzeScam(inputText) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: SCAM_DETECTOR_SYSTEM_PROMPT },
      { role: "user", content: inputText },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  })
  return JSON.parse(completion.choices[0].message.content)
}

// ── Live Shield (victim-side voice inference) ───────────────────
export const LIVE_SHIELD_SYSTEM_PROMPT = `You are Project Shield's live call monitor. You hear ONLY the victim's side of a phone call.

Your job: infer what the OTHER person (potential scammer) is saying based on the victim's responses, and assess scam risk in real time.

Examples of what to detect:
- Victim says "okay I won't hang up" → infer caller told them not to hang up (isolation tactic)
- Victim says "but I haven't done anything illegal" → infer caller accused them of a crime
- Victim says "you want my Aadhaar number?" → infer caller is extracting identity
- Victim says "how much should I transfer?" → infer caller is requesting money
- Victim says "I won't tell my family" → infer isolation/secrecy tactic

Respond ONLY with valid JSON, no markdown, no preamble:

{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "inferredTactics": ["tactic 1", "tactic 2"],
  "liveWarning": "one urgent sentence warning the victim what is happening",
  "shouldEndCall": true | false
}

Rules:
- Be fast and decisive — this is real time.
- If uncertain, lean toward HIGH risk. False positives are safer than false negatives.
- shouldEndCall is true only for HIGH risk with clear scam patterns.`

export async function analyzeLiveChunk(transcript) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: LIVE_SHIELD_SYSTEM_PROMPT },
      { role: "user", content: `Victim's words so far:\n${transcript}` },
    ],
    temperature: 0.1,
    response_format: { type: "json_object" },
  })
  return JSON.parse(completion.choices[0].message.content)
}

// ── Whisper transcription (audio upload) ───────────────────────
export async function transcribeAudio(audioFile) {
  const transcription = await groq.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-large-v3",
    language: "en",
    response_format: "text",
  })
  return transcription
}

export default groq