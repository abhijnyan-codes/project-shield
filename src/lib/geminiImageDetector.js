// ─── Gemini Image Detector ──────────────────────────────────────

import { GoogleGenerativeAI } from "@google/generative-ai"

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

// Check if API key is set
if (!API_KEY || API_KEY === "undefined") {
  console.error("VITE_GEMINI_API_KEY is not set in .env file")
}

const genAI = new GoogleGenerativeAI(API_KEY)

// ─── The Prompt ──────────────────────────────────────────────────
const DETECTION_PROMPT = `You are a forensic image analyst specializing in detecting AI-generated images.

Analyze this image for signs of AI generation. Look for:

**Visual Artifacts:**
- Blurry or unnatural backgrounds (oversmoothed, inconsistent bokeh)
- Warped or nonsensical text/symbols
- Extra fingers, missing limbs, or distorted anatomy
- Plastic/smooth skin texture with no pores
- Inconsistent lighting and shadows
- Same eye reflection pattern (classic AI giveaway)
- Strange color palettes (oversaturated or flat)

**AI Model Signature Patterns:**
- DALL-E: glossy textures, hyper-realistic but with subtle distortions
- Midjourney: painterly style, soft edges, dreamy lighting
- Stable Diffusion: varied, often has background artifacts
- Deepfake: facial inconsistencies, unnatural eye movements

**Respond with a JSON object in this exact format:**
{
  "isAIGenerated": true/false,
  "confidence": 0-100,
  "aiModel": "DALL-E" | "Midjourney" | "Stable Diffusion" | "Deepfake" | "Unknown" | null,
  "redFlags": ["flag 1", "flag 2", "flag 3"],
  "explanation": "brief forensic explanation",
  "advice": "actionable advice for the user"
}

Be decisive. If uncertain, lean toward HIGH risk.`

// ─── Try different models in order ──────────────────────────────
// Updated for 2026 active production models
const MODEL_OPTIONS = [
  "gemini-3.5-flash",       // ✅ Current generation: fast, cheap, and widely available
  "gemini-2.5-flash",       // ✅ Solid, highly reliable fallback
  "gemini-3.1-flash-lite",  // ✅ Ultra-fast fallback for high-volume requests
]

/**
 * Detect if an image is AI-generated using Gemini Vision
 * @param {string} imageBase64 - Base64 encoded image (with data:image/... prefix)
 * @param {string} mimeType - e.g., "image/png", "image/jpeg"
 * @returns {Promise<Object>} Detection result
 */
export async function detectAIImageWithGemini(imageBase64, mimeType = "image/png") {
  // Check API key first
  if (!API_KEY || API_KEY === "undefined") {
    return {
      riskLevel: "MEDIUM",
      summary: "⚠️ Gemini API key is missing. Please add VITE_GEMINI_API_KEY to your .env file.",
      redFlags: [{ type: "API Key Missing", detail: "Add your Gemini API key to .env" }],
      flaggedPhrases: [],
      advice: "Please set up your Gemini API key in the .env file and restart the dev server.",
      confidence: 50,
      isAIGenerated: true,
      model: "Unknown",
      isFallback: true,
    }
  }

  // Try each model until one works
  let lastError = null

  for (const modelName of MODEL_OPTIONS) {
    try {
      console.log(`🔍 Trying Gemini model: ${modelName}...`)
      
      // Initialize Gemini model
      const geminiModel = genAI.getGenerativeModel({ 
        model: modelName,
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
        }
      })

      // Prepare the image data
      const base64Data = imageBase64.includes("base64,") 
        ? imageBase64.split("base64,")[1] 
        : imageBase64

      // Build the request
      const result = await geminiModel.generateContent([
        { text: DETECTION_PROMPT },
        {
          inlineData: {
            mimeType: mimeType,
            data: base64Data,
          },
        },
      ])

      const responseText = result.response.text()
      console.log(`✅ Gemini ${modelName} responded successfully`)
      
      // Parse the JSON response
      let data
      try {
        data = JSON.parse(responseText)
      } catch (parseError) {
        console.error("Failed to parse Gemini response:", responseText)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/)
        if (jsonMatch) {
          data = JSON.parse(jsonMatch[0])
        } else {
          throw new Error("Invalid JSON response from Gemini")
        }
      }

      // Format the result
      const isAIGenerated = data.isAIGenerated || false
      const confidence = data.confidence || 0
      const detectedModel = data.aiModel || "Unknown"

      const redFlags = []
      if (isAIGenerated) {
        redFlags.push({ 
          type: "AI-Generated Image", 
          detail: `${confidence}% probability — ${detectedModel} detected` 
        })
      }
      if (data.redFlags && data.redFlags.length > 0) {
        data.redFlags.forEach(flag => {
          redFlags.push({ 
            type: "Artifact Detected", 
            detail: flag 
          })
        })
      }

      let riskLevel = "LOW"
      if (isAIGenerated && confidence > 80) riskLevel = "HIGH"
      else if (isAIGenerated && confidence > 50) riskLevel = "MEDIUM"

      return {
        riskLevel,
        summary: data.explanation || (isAIGenerated 
          ? `⚠️ AI-generated image detected (${confidence}%)` 
          : `✅ Image appears authentic (${confidence}% AI)`),
        redFlags,
        flaggedPhrases: [],
        advice: data.advice || (isAIGenerated
          ? "This image is likely AI-generated. Be cautious — it may be a fake profile, document, or scam visual."
          : "This image appears authentic. No significant AI artifacts detected."),
        confidence,
        isAIGenerated,
        model: detectedModel,
        rawResponse: data,
      }
    } catch (error) {
      console.warn(`❌ Model ${modelName} failed:`, error.message)
      lastError = error
      // Continue to next model
    }
  }

  // ─── All models failed ──────────────────────────────────────────
  console.error("All Gemini models failed:", lastError)
  
  return {
    riskLevel: "MEDIUM",
    summary: "⚠️ AI image detection unavailable — using fallback analysis",
    redFlags: [
      { type: "API Fallback", detail: "Gemini service temporarily unavailable. Check your API key." },
    ],
    flaggedPhrases: [],
    advice: "Proceed with caution. The image may be AI-generated.",
    confidence: 60,
    isAIGenerated: true,
    model: "Unknown",
    isFallback: true,
  }
}

/**
 * Detect an image by uploading the file directly
 * @param {File} file - The image file to upload
 * @returns {Promise<Object>} Detection result
 */
export async function detectAIImageFromFile(file) {
  const base64 = await fileToBase64(file)
  return detectAIImageWithGemini(base64, file.type)
}

// ─── Helper: Convert File to base64 ──────────────────────────────
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.readAsDataURL(file)
    reader.onload = () => resolve(reader.result)
    reader.onerror = (error) => reject(error)
  })
}