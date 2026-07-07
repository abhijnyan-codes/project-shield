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

**Scam DNA Classification:**
You have access to a database of known fraud patterns. Compare the user's message to these known campaign profiles (use these as reference):
1. "CBI/ED Digital Arrest Scam" – Impersonating officers, fake arrest warrants, demand payment.
2. "FedEx/Customs Parcel Scam" – Illegal parcel, drugs, customs clearance fees.
3. "RBI/KYC Account Block Scam" – Fake bank/RBI officials, KYC expiry, OTP theft.
4. "Family Emergency Imposter" – Pretending to be child/relative in trouble, urgent money.
5. "Fake Loan/Instant Credit Scam" – Advance fees for guaranteed loans.
6. "SIM/Utility Disconnection Scam" – Threats to disconnect service if not paid immediately.
7. "Job Offer/Registration Fee Scam" – Fake jobs requiring registration/training fees.
8. "Matrimony/Dating Fraud" – Fake profiles extracting money under false pretenses.
9. "UPI Reversal/Refund Scam" – Fake bank reps tricking into sending money for refunds.
10. "Fake Investment/Stock Tips" – Guaranteed high returns to steal principal.

**Important Instructions:**
- If the text clearly matches one of the above, use that exact campaign name and assign a high match percentage (85-99%).
- If it's a variant (e.g., "Mumbai Police" instead of "CBI"), use the closest match but adapt the name slightly, and assign a medium percentage (60-80%).
- If it's a new type of scam not listed, create a descriptive name (e.g., "WhatsApp Group Investment Scam") and assign a lower percentage (30-60%).
- If it's clearly benign, set dnaMatch to null.

Respond ONLY with valid JSON in this exact structure, no markdown, no preamble:

{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "summary": "one sentence describing what this is",
  "redFlags": [
    { "type": "Impersonation" | "Urgency" | "Financial Request" | "Suspicious Link" | "Other", "detail": "short explanation" }
  ],
  "flaggedPhrases": ["exact phrase from input 1", "exact phrase from input 2"],
  "advice": "one sentence of clear action advice",
  "dnaMatch": {
    "campaignName": "Name of the matched or generated campaign",
    "matchPercentage": 0-100,
    "description": "Brief description of the campaign"
  }
}

Rules:
- flaggedPhrases must be exact substrings from the user's input, max 4 phrases.
- redFlags max 3 items.
- dnaMatch should be null ONLY if riskLevel is LOW. For MEDIUM/HIGH, ALWAYS provide a dnaMatch object with a descriptive campaignName and a confidence percentage.
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
    response_format: "text",
  })
  return transcription
}

// ── CyberSafe: Harassment + Case Management ────────────────────
export const CYBERSAFE_SYSTEM_PROMPT = `You are Project Shield's CyberSafe Case Management Engine.

Analyze the user's pasted message, DM, comment thread, or threatening text for:
- Harassment patterns (repeated unwanted contact, stalking, intimidation)
- Threat severity (idle threat vs credible threat of physical/legal harm)
- Harassment type: Sexual, Stalking, Blackmail/Extortion, Hate Speech, Doxxing, Impersonation
- Urgency indicators (immediate danger, self-harm mentions, specific threats)
- Evidence preservation value (text that needs to be screenshotted/archived)

**Your primary output is actionable case management for the victim.**
Generate a structured case summary, a pre-filled complaint draft for cybercrime.gov.in, and an immediate action checklist.

**Platform-Specific Reporting (if applicable):**
- Instagram: Report via app > "Report" or use the Help Center.
- Facebook: Report profile/post via the "..." menu > "Find Support or Report".
- WhatsApp: Block + Report via the app.
- Twitter/X: Report via tweet menu > "Report Tweet".

**Legal Sections Reference (India - Bharatiya Nyaya Sanhita & IT Act):**
- Section 78, Bharatiya Nyaya Sanhita (BNS) — Stalking
- Section 79, Bharatiya Nyaya Sanhita (BNS) — Word, gesture or act intended to insult the modesty of a woman
- Section 351, Bharatiya Nyaya Sanhita (BNS) — Criminal intimidation
- Section 352, Bharatiya Nyaya Sanhita (BNS) — Criminal intimidation by anonymous communication
- Section 66C, Information Technology Act, 2000 — Identity Theft
- Section 66D, Information Technology Act, 2000 — Cheating by personation using computer resources
- Section 67, Information Technology Act, 2000 — Publishing or transmitting obscene material in electronic form

**Victim Support:**
- Add a supportMessage (empathetic, encouraging, authoritative).
- If immediate danger (self-harm, violence, physical threat), flag emergencyFlag = true.
- If blackmail/extortion, include "DO NOT PAY" in immediateActions.

Respond ONLY with valid JSON, no markdown, no preamble:

{
  "riskLevel": "LOW" | "MEDIUM" | "HIGH" | "EMERGENCY",
  "harassmentType": "Sexual" | "Stalking" | "Blackmail" | "Hate Speech" | "Doxxing" | "Impersonation" | "Other" | null,
  "summary": "one sentence describing the incident",
  "threatAssessment": "Credible threat with specific details" | "Idle threat with vague language" | "No threat detected",
  "emergencyFlag": true | false,
  "flaggedPhrases": ["exact phrase 1", "exact phrase 2"],
  "evidenceTips": "what to screenshot, save, or archive",
  "reportingSteps": "platform-specific steps (e.g., Instagram, WhatsApp, Twitter)",
  "legalActions": ["Section 78 BNS — Stalking", "Section 79 BNS — Insult to modesty of woman", "Section 352 BNS — Anonymous criminal intimidation"],
  "policeInvolvement": "Recommended" | "Not recommended" | "Emergency - call 112 now",

  "caseSummary": "A structured, narrative summary of what happened, who is involved, and what the threat is.",
  "complaintDraft": "A pre-filled, ready-to-paste complaint text for filing on cybercrime.gov.in. Include placeholders like [YOUR NAME], [PERPETRATOR'S HANDLE], etc.",
  "immediateActions": ["Call 1930 (National Cybercrime Helpline)", "Do NOT pay any money", "Do NOT delete the conversation", "Screenshot everything", "Block the user only after saving evidence"],
  "supportMessage": "A one-sentence empathetic and encouraging message for the victim."
}

Rules:
- emergencyFlag = true ONLY if there is immediate physical danger, self-harm threats, or violence.
- flaggedPhrases max 4 phrases, exact substrings from input.
- Be decisive, clear, and actionable.`

export async function analyzeCyberSafe(inputText) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: CYBERSAFE_SYSTEM_PROMPT },
      { role: "user", content: inputText },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  })
  return JSON.parse(completion.choices[0].message.content)
}

// ── URL & File Scanner (AI-based fallback for VirusTotal) ──────
export const URL_SCANNER_SYSTEM_PROMPT = `You are Project Shield's advanced threat intelligence engine.

Analyze the user's input (a URL, file name, or suspicious link) for scam and phishing indicators.

Act like a threat intelligence platform. Provide:
1. A **Threat Score** (0-100 based on how dangerous it looks).
2. A list of **"Vendor Detections"** (simulate 3-4 antivirus engines flagging it, e.g., "BitDefender", "Kaspersky", "McAfee").
3. **Red Flags** (Phishing, Typosquatting, Suspicious File Type, etc.).
4. **Actionable Advice**.

Respond ONLY with valid JSON in this exact structure:
{
  "threatScore": 0-100,
  "vendorDetections": [
    { "vendor": "BitDefender", "result": "Phishing.URL" },
    { "vendor": "Kaspersky", "result": "Heuristic.Suspicious" },
    { "vendor": "McAfee", "result": "Trojan.Generic" }
  ],
  "riskLevel": "LOW" | "MEDIUM" | "HIGH",
  "summary": "What this is",
  "redFlags": [
    { "type": "Phishing", "detail": "Impersonates ICICI Bank" }
  ],
  "advice": "Clear action advice"
}

Rules:
- If the input is a URL, look for typosquatting (e.g., "icici-secure-login.xyz").
- If the input is a file name, flag dangerous extensions like .exe, .scr, .vbs.
- Be decisive. Do not hedge.`

export async function analyzeURLOrFile(inputText) {
  const completion = await groq.chat.completions.create({
    model: "llama-3.3-70b-versatile",
    messages: [
      { role: "system", content: URL_SCANNER_SYSTEM_PROMPT },
      { role: "user", content: inputText },
    ],
    temperature: 0.2,
    response_format: { type: "json_object" },
  })
  return JSON.parse(completion.choices[0].message.content)
}

// ── Alias for backward compatibility ────────────────────────────
export const analyzeCyberbullying = analyzeCyberSafe

export default groq