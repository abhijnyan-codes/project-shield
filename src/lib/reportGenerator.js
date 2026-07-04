import jsPDF from "jspdf"

/**
 * Generate a PDF incident report for scam detection
 * @param {Object} data - The scam analysis result
 * @param {string} data.riskLevel - "HIGH" | "MEDIUM" | "LOW"
 * @param {string} data.summary - Summary of the scam
 * @param {Array} data.redFlags - Array of red flag objects
 * @param {Array} data.flaggedPhrases - Array of flagged phrases
 * @param {string} data.advice - Recommended next steps
 * @param {string} data.transcript - Original user input
 * @param {string} data.timestamp - ISO timestamp
 */
export function generateIncidentReport(data) {
  const doc = new jsPDF("p", "mm", "a4")
  const pageWidth = 210
  const margin = 20
  let y = 20

  // ─── Header ──────────────────────────────────────────────────────
  doc.setFont("helvetica", "bold")
  doc.setFontSize(22)
  doc.setTextColor(232, 67, 26) // #E8431A
  doc.text("PROJECT SHIELD", pageWidth / 2, y, { align: "center" })
  y += 8

  doc.setFontSize(12)
  doc.setTextColor(100)
  doc.setFont("helvetica", "normal")
  doc.text("AI-Powered Incident Report", pageWidth / 2, y, { align: "center" })
  y += 12

  // ─── Divider ─────────────────────────────────────────────────────
  doc.setDrawColor(200)
  doc.line(margin, y, pageWidth - margin, y)
  y += 8

  // ─── Report ID & Timestamp ──────────────────────────────────────
  doc.setFont("helvetica", "bold")
  doc.setFontSize(10)
  doc.setTextColor(50)
  const reportId = `SHIELD-${Date.now().toString().slice(-8)}`
  doc.text(`Report ID: ${reportId}`, margin, y)
  doc.text(`Date: ${new Date(data.timestamp).toLocaleString("en-IN")}`, pageWidth - margin, y, { align: "right" })
  y += 10

  // ─── Risk Level ─────────────────────────────────────────────────
  doc.setFont("helvetica", "bold")
  doc.setFontSize(14)
  
  const riskColors = {
    HIGH: [232, 67, 26],
    MEDIUM: [245, 158, 11],
    LOW: [26, 158, 107],
  }
  const riskColor = riskColors[data.riskLevel] || [100, 100, 100]
  doc.setTextColor(riskColor[0], riskColor[1], riskColor[2])
  doc.text(`RISK LEVEL: ${data.riskLevel}`, margin, y)
  y += 10

  // ─── Summary ─────────────────────────────────────────────────────
  doc.setTextColor(50)
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.text("Summary", margin, y)
  y += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  const summaryLines = doc.splitTextToSize(data.summary || "No summary available.", pageWidth - 2 * margin)
  doc.text(summaryLines, margin, y)
  y += summaryLines.length * 6 + 6

  // ─── Red Flags ──────────────────────────────────────────────────
  if (data.redFlags && data.redFlags.length > 0) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(232, 67, 26)
    doc.text("Red Flags Detected", margin, y)
    y += 6
    doc.setTextColor(50)
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)

    data.redFlags.forEach((flag, i) => {
      const prefix = `${i + 1}. ${flag.type}: `
      const text = flag.detail || ""
      const fullText = prefix + text
      const lines = doc.splitTextToSize(fullText, pageWidth - 2 * margin)
      doc.text(lines, margin, y)
      y += lines.length * 6 + 2
    })
    y += 4
  }

  // ─── Flagged Phrases ────────────────────────────────────────────
  if (data.flaggedPhrases && data.flaggedPhrases.length > 0) {
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(50)
    doc.text("Flagged Phrases", margin, y)
    y += 6
    doc.setFont("helvetica", "normal")
    doc.setFontSize(10)
    doc.setTextColor(80)
    const phrases = data.flaggedPhrases.map(p => `"${p}"`).join(" · ")
    const phraseLines = doc.splitTextToSize(phrases, pageWidth - 2 * margin)
    doc.text(phraseLines, margin, y)
    y += phraseLines.length * 6 + 6
  }

  // ─── Next Steps ──────────────────────────────────────────────────
  doc.setFont("helvetica", "bold")
  doc.setFontSize(11)
  doc.setTextColor(50)
  doc.text("Recommended Actions", margin, y)
  y += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(10)
  const adviceLines = doc.splitTextToSize(data.advice || "No specific advice available.", pageWidth - 2 * margin)
  doc.text(adviceLines, margin, y)
  y += adviceLines.length * 6 + 6

  // ─── Transcript (if available) ──────────────────────────────────
  if (data.transcript) {
    doc.addPage()
    y = 20
    doc.setFont("helvetica", "bold")
    doc.setFontSize(11)
    doc.setTextColor(50)
    doc.text("Original Message / Transcript", margin, y)
    y += 6
    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.setTextColor(80)
    const transcriptLines = doc.splitTextToSize(data.transcript, pageWidth - 2 * margin)
    doc.text(transcriptLines, margin, y)
    y += transcriptLines.length * 5 + 10
  }

  // ─── Footer ──────────────────────────────────────────────────────
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFont("helvetica", "italic")
    doc.setFontSize(8)
    doc.setTextColor(150)
    doc.text(
      `Generated by Project Shield · ${reportId} · Page ${i} of ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.height - 10,
      { align: "center" }
    )
  }

  // ─── Save ────────────────────────────────────────────────────────
  doc.save(`ProjectShield_IncidentReport_${reportId}.pdf`)
}

/**
 * Generate a JSON report for digital submission
 */
export function generateJSONReport(data) {
  const report = {
    reportId: `SHIELD-${Date.now().toString().slice(-8)}`,
    timestamp: data.timestamp || new Date().toISOString(),
    riskLevel: data.riskLevel,
    summary: data.summary,
    redFlags: data.redFlags || [],
    flaggedPhrases: data.flaggedPhrases || [],
    advice: data.advice,
    transcript: data.transcript || "",
    generatedBy: "Project Shield v1.0",
    disclaimer: "This report is AI-generated and should be verified by appropriate authorities.",
  }
  return report
}