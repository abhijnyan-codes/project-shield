import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Shield, X, MapPin } from "lucide-react"

// ─── Complete State Data (All 36 States/UTs - NCRB 2023) ──────────────────────────────────────
const stateData = [
  // Union Territories
  { id: "DL", name: "Delhi", cases: 5842, topScam: "Digital Arrest" },
  { id: "PY", name: "Puducherry", cases: 127, topScam: "UPI Fraud" },
  { id: "CH", name: "Chandigarh", cases: 234, topScam: "Investment Scam" },
  { id: "AN", name: "Andaman and Nicobar Islands", cases: 18, topScam: "Lottery Scam" },
  { id: "DN", name: "Dadra and Nagar Haveli and Daman and Diu", cases: 45, topScam: "KYC Fraud" },
  { id: "JK", name: "Jammu and Kashmir", cases: 312, topScam: "Digital Arrest" },
  { id: "LA", name: "Ladakh", cases: 12, topScam: "Job Fraud" },
  { id: "LD", name: "Lakshadweep", cases: 3, topScam: "Romance Scam" },

  // States - High Cybercrime
  { id: "KA", name: "Karnataka", cases: 21889, topScam: "Cheating by Personation" },
  { id: "TG", name: "Telangana", cases: 18236, topScam: "Investment Scam" },
  { id: "UP", name: "Uttar Pradesh", cases: 10794, topScam: "Digital Arrest" },
  { id: "MH", name: "Maharashtra", cases: 8103, topScam: "UPI Fraud" },
  { id: "TN", name: "Tamil Nadu", cases: 4121, topScam: "Job Fraud" },
  { id: "BR", name: "Bihar", cases: 4450, topScam: "Lottery Scam" },
  { id: "KL", name: "Kerala", cases: 3295, topScam: "Romance Scam" },
  { id: "RJ", name: "Rajasthan", cases: 2435, topScam: "KYC Fraud" },
  { id: "OD", name: "Odisha", cases: 2348, topScam: "Loan Fraud" },
  { id: "AP", name: "Andhra Pradesh", cases: 2341, topScam: "Investment Scam" },
  { id: "GJ", name: "Gujarat", cases: 1995, topScam: "Digital Arrest" },
  { id: "HR", name: "Haryana", cases: 751, topScam: "KYC Fraud" },
  { id: "MP", name: "Madhya Pradesh", cases: 685, topScam: "UPI Fraud" },
  { id: "PB", name: "Punjab", cases: 511, topScam: "Digital Arrest" },
  { id: "WB", name: "West Bengal", cases: 309, topScam: "Investment Scam" },
  
  // States - Medium/Low Cybercrime
  { id: "JH", name: "Jharkhand", cases: 287, topScam: "Job Fraud" },
  { id: "AS", name: "Assam", cases: 264, topScam: "Lottery Scam" },
  { id: "CT", name: "Chhattisgarh", cases: 243, topScam: "KYC Fraud" },
  { id: "UK", name: "Uttarakhand", cases: 198, topScam: "Digital Arrest" },
  { id: "HP", name: "Himachal Pradesh", cases: 176, topScam: "Investment Scam" },
  { id: "GA", name: "Goa", cases: 142, topScam: "Romance Scam" },
  { id: "TR", name: "Tripura", cases: 89, topScam: "UPI Fraud" },
  { id: "MN", name: "Manipur", cases: 67, topScam: "Job Fraud" },
  { id: "NL", name: "Nagaland", cases: 54, topScam: "Lottery Scam" },
  { id: "MZ", name: "Mizoram", cases: 48, topScam: "Investment Scam" },
  { id: "AR", name: "Arunachal Pradesh", cases: 42, topScam: "Digital Arrest" },
  { id: "ML", name: "Meghalaya", cases: 38, topScam: "KYC Fraud" },
  { id: "SK", name: "Sikkim", cases: 29, topScam: "Romance Scam" },
]

// ─── Name → ID mapping for fallback matching (All 36 States/UTs) ─────────────────────
const NAME_TO_ID = {
  // States
  "Karnataka": "KA", "Telangana": "TG", "Uttar Pradesh": "UP",
  "Maharashtra": "MH", "Tamil Nadu": "TN", "Kerala": "KL",
  "Rajasthan": "RJ", "Odisha": "OD", "Andhra Pradesh": "AP",
  "Gujarat": "GJ", "Bihar": "BR", "Haryana": "HR",
  "Madhya Pradesh": "MP", "Punjab": "PB", "West Bengal": "WB",
  "Jharkhand": "JH", "Assam": "AS", "Chhattisgarh": "CT",
  "Uttarakhand": "UK", "Himachal Pradesh": "HP", "Goa": "GA",
  "Tripura": "TR", "Manipur": "MN", "Nagaland": "NL",
  "Mizoram": "MZ", "Arunachal Pradesh": "AR", "Meghalaya": "ML",
  "Sikkim": "SK",
  
  // Union Territories
  "Delhi": "DL", "Puducherry": "PY", "Chandigarh": "CH",
  "Andaman and Nicobar Islands": "AN", "Dadra and Nagar Haveli and Daman and Diu": "DN",
  "Jammu and Kashmir": "JK", "Ladakh": "LA", "Lakshadweep": "LD",
  
  // Alternate names
  "Andhra": "AP", "Orissa": "OD", "Uttaranchal": "UK",
  "Daman and Diu": "DN", "Dadra and Nagar Haveli": "DN",
  "Pondicherry": "PY",
}

// ─── Top Stats ──────────────────────────────────────────────────
const topStats = [
  { label: "Total Cybercrime Cases 2023", value: "86,420", source: "NCRB Crime in India 2023", color: "text-red-500" },
  { label: "Highest Crime State", value: "Karnataka", source: "21,889 cases (NCRB)", color: "text-orange-500" },
  { label: "Most Common Scam Type", value: "Fraud (Cheating)", source: "19,466 cases (22.5%)", color: "text-amber-500" },
  { label: "Money Lost to Cyber Fraud 2024", value: "₹22,845 Cr", source: "MHA Lok Sabha Dec 2025", color: "text-blue-500" },
]

// ─── Mock Network Data ──────────────────────────────────────────
const mockData = {
  nodes: [
    { id: "s1", type: "scammer", label: "Scammer Network A", location: "Cambodia/Myanmar" },
    { id: "s2", type: "scammer", label: "Scammer Network B", location: "Laos SEZ" },
    { id: "s3", type: "scammer", label: "Digital Arrest Ring", location: "Dubai-UAE" },
    { id: "s4", type: "scammer", label: "Investment Scam Hub", location: "Thailand" },
    { id: "m1", type: "mule", label: "Mule Cluster 1", account: "Shell Company Network" },
    { id: "m2", type: "mule", label: "Mule Cluster 2", account: "Payment Gateway Abuse" },
    { id: "m3", type: "mule", label: "Mule Cluster 3", account: "Crypto-Hawala Route" },
    { id: "m4", type: "mule", label: "Mule Cluster 4", account: "Merchant Category Fraud" },
    { id: "m5", type: "mule", label: "Mule Cluster 5", account: "Layer-1 Mule Network" },
    { id: "m6", type: "mule", label: "Mule Cluster 6", account: "Crypto Exchange Route" },
    { id: "v1", type: "victim", label: "Victim Group A", location: "Mumbai, MH" },
    { id: "v2", type: "victim", label: "Victim Group B", location: "Delhi" },
    { id: "v3", type: "victim", label: "Victim Group C", location: "Bangalore, KA" },
    { id: "v4", type: "victim", label: "Victim Group D", location: "Chennai, TN" },
    { id: "v5", type: "victim", label: "Victim Group E", location: "Hyderabad, TG" },
    { id: "v6", type: "victim", label: "Victim Group F", location: "Kolkata, WB" },
    { id: "v7", type: "victim", label: "Victim Group G", location: "Pune, MH" },
    { id: "v8", type: "victim", label: "Victim Group H", location: "Ahmedabad, GJ" },
    { id: "v9", type: "victim", label: "Victim Group I", location: "Jaipur, RJ" },
    { id: "v10", type: "victim", label: "Victim Group J", location: "Lucknow, UP" },
  ],
  links: [
    { source: "s1", target: "m1" }, { source: "s1", target: "m2" }, { source: "s1", target: "m6" },
    { source: "s2", target: "m3" }, { source: "s2", target: "m5" },
    { source: "s3", target: "m4" }, { source: "s3", target: "m5" }, { source: "s3", target: "m1" },
    { source: "s4", target: "m6" }, { source: "s4", target: "m2" }, { source: "s4", target: "m3" },
    { source: "m1", target: "v1" }, { source: "m1", target: "v2" }, { source: "m1", target: "v7" },
    { source: "m2", target: "v3" }, { source: "m2", target: "v4" }, { source: "m2", target: "v8" },
    { source: "m3", target: "v5" }, { source: "m3", target: "v6" },
    { source: "m4", target: "v7" }, { source: "m4", target: "v8" }, { source: "m4", target: "v9" },
    { source: "m5", target: "v9" }, { source: "m5", target: "v10" }, { source: "m5", target: "v1" },
    { source: "m6", target: "v1" }, { source: "m6", target: "v3" }, { source: "m6", target: "v5" },
    { source: "m1", target: "m3" }, { source: "m2", target: "m6" }, { source: "m4", target: "m5" },
  ],
}

// ─── Campaigns ──────────────────────────────────────────────────
const campaigns = [
  { id: "c1", name: "Digital Arrest Network", nodes: ["s1","s3","m1","m2","m4","v1","v2","v7","v10"], color: "#E8431A", description: "CBI/ED/Bank impersonation — 31.2% rise in 2023 (NCRB)" },
  { id: "c2", name: "Investment/Ponzi Scam Ring", nodes: ["s2","s4","m3","m5","m6","v3","v5","v6"], color: "#E8A317", description: "OctaFX, Mahadev App — ₹34,855 Cr identified (ED Feb 2026)" },
  { id: "c3", name: "UPI & Payment Gateway Fraud", nodes: ["s1","s2","m1","m2","v4","v8","v9"], color: "#2D6BE4", description: "Merchant category fraud — ₹1,776 Cr (Jan–Sep 2024)" },
]

// ─── Helpers ────────────────────────────────────────────────────
const MAX_CASES = Math.max(...stateData.map(s => s.cases))

function getColor(cases) {
  if (!cases) return "#e2e8f0"
  const intensity = cases / MAX_CASES
  if (intensity > 0.8) return "#7f1d1d"
  if (intensity > 0.6) return "#b91c1c"
  if (intensity > 0.4) return "#ef4444"
  if (intensity > 0.2) return "#fca5a5"
  return "#fee2e2"
}

// ─── Improved getStateName with more property keys ──────────────
function getStateName(properties) {
  if (!properties) return ""
  
  const keys = [
    "NAME_1", "name", "ST_NM", "STATE", "statename", "state", "NAME",
    "district", "ENGTYPE_1", "NL_NAME_1", "VARNAME_1", "id",
  ]
  
  for (const key of keys) {
    if (properties[key] && typeof properties[key] === "string" && properties[key].trim()) {
      return properties[key].trim()
    }
  }
  
  return ""
}

// ─── Robust state matching ──────────────────────────────────────
function findStateData(properties) {
  if (!properties) return null

  const rawName = getStateName(properties)
  if (!rawName) return null
  
  const cleanName = rawName.trim()
  const lowerName = cleanName.toLowerCase()

  let found = stateData.find(s => s.name === cleanName)
  if (found) return found

  found = stateData.find(s => s.name.toLowerCase() === lowerName)
  if (found) return found

  const code = properties.ST_CODE || properties.state_code || properties.code || ""
  if (code) {
    const upperCode = code.toUpperCase().trim()
    found = stateData.find(s => s.id === upperCode)
    if (found) return found
  }

  for (const s of stateData) {
    const sLower = s.name.toLowerCase()
    if (lowerName.includes(sLower) || sLower.includes(lowerName)) {
      return s
    }
  }

  for (const [key, value] of Object.entries(NAME_TO_ID)) {
    const keyLower = key.toLowerCase()
    if (lowerName.includes(keyLower) || keyLower.includes(lowerName)) {
      return stateData.find(s => s.id === value)
    }
  }

  const cleaned = cleanName
    .replace(/^(State of|Union Territory of|UT of)\s*/i, "")
    .replace(/\s*(State|UT|Union Territory)$/i, "")
    .trim()
  
  if (cleaned !== cleanName) {
    return findStateData({ ...properties, name: cleaned })
  }

  return null
}

// ─── India Map Component ──────────────────────────────────────
function IndiaMap({ onStateClick, selectedState }) {
  const svgRef = useRef(null)
  const [tooltip, setTooltip] = useState(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl) return

    const width = svgEl.parentElement?.clientWidth || 700
    const height = 520

    d3.select(svgEl).selectAll("*").remove()
    d3.select(svgEl)
      .attr("width", width)
      .attr("height", height)

    const projection = d3.geoMercator()
      .center([82, 23])
      .scale(Math.min(width, height) * 1.3)
      .translate([width / 2, height / 2])

    const path = d3.geoPath().projection(projection)
    const svg = d3.select(svgEl)

    const GEO_URL = "/india-states.geo.json"

    d3.json(GEO_URL)
      .then(data => {
        if (!data?.features?.length) {
          console.error("No features found in GeoJSON")
          setMapError(true)
          return
        }

        console.log("Sample GeoJSON properties:", data.features[0].properties)
        console.log("Available state names:", stateData.map(s => s.name))

        svg.selectAll("path")
          .data(data.features)
          .enter()
          .append("path")
          .attr("d", path)
          .attr("fill", d => {
            const matched = findStateData(d.properties)
            return getColor(matched?.cases)
          })
          .attr("stroke", "#ffffff")
          .attr("stroke-width", 0.8)
          .attr("cursor", "pointer")
          .on("mouseover", function(event, d) {
            d3.select(this).attr("stroke-width", 2).attr("stroke", "#1e293b")
            const matched = findStateData(d.properties)
            const name = getStateName(d.properties) || "Unknown"
            const rect = svgEl.getBoundingClientRect()
            setTooltip({
              name,
              state: matched,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            })
          })
          .on("mousemove", function(event) {
            const rect = svgEl.getBoundingClientRect()
            setTooltip(prev => prev ? {
              ...prev,
              x: event.clientX - rect.left,
              y: event.clientY - rect.top
            } : null)
          })
          .on("mouseout", function() {
            d3.select(this).attr("stroke-width", 0.8).attr("stroke", "#ffffff")
            setTooltip(null)
          })
          .on("click", (event, d) => {
            const matched = findStateData(d.properties)
            if (matched) onStateClick(matched)
          })
      })
      .catch((err) => {
        console.error("Map load error:", err)
        setMapError(true)
      })
  }, [onStateClick])

  if (mapError) return (
    <div className="flex items-center justify-center h-64 text-slate-400 text-sm">
      Map failed to load. Check console for details.
    </div>
  )

  return (
    <div className="relative w-full">
      <svg ref={svgRef} className="w-full" />
      {tooltip && (
        <div
          className="absolute bg-white border border-slate-200 rounded-xl shadow-lg px-3 py-2 text-xs pointer-events-none z-10"
          style={{ left: tooltip.x + 12, top: tooltip.y - 10 }}
        >
          <p className="font-bold text-slate-900">{tooltip.name || "Unknown"}</p>
          {tooltip.state ? (
            <>
              <p className="text-slate-500 mt-0.5">{tooltip.state.cases.toLocaleString("en-IN")} cases</p>
              <p className="text-slate-500">Top: {tooltip.state.topScam}</p>
            </>
          ) : (
            <p className="text-slate-400">No data available</p>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Network Graph Component ──────────────────────────────────
function NetworkGraph({ onNodeClick }) {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 450 })

  useEffect(() => {
    const update = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({ width: rect.width || 800, height: 450 })
      }
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return
    const { width, height } = dimensions
    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3.select(svgRef.current)
      .attr("width", width).attr("height", height)
      .append("g")

    const colorMap = { scammer: "#E8431A", mule: "#E8A317", victim: "#2D6BE4" }
    const sizeMap = { scammer: 16, mule: 11, victim: 8 }

    const nodes = mockData.nodes.map(d => ({ ...d }))
    const links = mockData.links.map(d => ({ ...d }))

    const simulation = d3.forceSimulation(nodes)
      .force("link", d3.forceLink(links).id(d => d.id).distance(70))
      .force("charge", d3.forceManyBody().strength(-180))
      .force("center", d3.forceCenter(width / 2, height / 2))
      .force("collision", d3.forceCollide().radius(22))

    const link = svg.append("g").selectAll("line")
      .data(links).enter().append("line")
      .attr("stroke", "#CBD5E1").attr("stroke-width", 1.5).attr("stroke-opacity", 0.6)

    const node = svg.append("g").selectAll("circle")
      .data(nodes).enter().append("circle")
      .attr("r", d => sizeMap[d.type] || 8)
      .attr("fill", d => colorMap[d.type] || "#94A3B8")
      .attr("stroke", "#FFFFFF").attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .on("click", (event, d) => onNodeClick(d))
      .on("mouseenter", function() { d3.select(this).attr("stroke-width", 4) })
      .on("mouseleave", function() { d3.select(this).attr("stroke-width", 2) })

    const label = svg.append("g").selectAll("text")
      .data(nodes).enter().append("text")
      .text(d => d.label)
      .attr("font-size", "7.5px").attr("fill", "#334155")
      .attr("text-anchor", "middle").attr("dy", -14).attr("font-weight", 500)

    simulation.on("tick", () => {
      link
        .attr("x1", d => d.source.x).attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x).attr("y2", d => d.target.y)
      node
        .attr("cx", d => { d.x = Math.max(14, Math.min(width - 14, d.x)); return d.x })
        .attr("cy", d => { d.y = Math.max(14, Math.min(height - 14, d.y)); return d.y })
      label.attr("x", d => d.x).attr("y", d => d.y - 16)
    })

    const zoom = d3.zoom().scaleExtent([0.4, 3])
      .on("zoom", (event) => svg.attr("transform", event.transform))
    d3.select(svgRef.current).call(zoom)

    return () => simulation.stop()
  }, [dimensions, onNodeClick])

  return (
    <div ref={containerRef} className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm relative" style={{ height: 450 }}>
      <svg ref={svgRef} className="w-full h-full" />
      <div className="absolute bottom-4 right-4 text-[10px] text-slate-400 bg-white/80 px-3 py-1.5 rounded-full border border-slate-100">
        🔒 ED/CBI Intelligence · Scroll to zoom
      </div>
    </div>
  )
}

// ─── Main Page ──────────────────────────────────────────────────
export default function NetworkMap() {
  const [selectedState, setSelectedState] = useState(null)
  const [selectedNode, setSelectedNode] = useState(null)

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col gap-8">

        <div>
          <h1 className="font-display font-bold text-3xl text-slate-900">Crime Intelligence Map</h1>
          <p className="text-slate-500 text-sm mt-1">NCRB 2023 + MHA/ED 2024–26 — real cybercrime patterns across India</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {topStats.map((stat, i) => (
            <div key={i} className="bg-white border border-slate-100 rounded-2xl p-4 shadow-sm">
              <p className={`font-display font-extrabold text-xl ${stat.color}`}>{stat.value}</p>
              <p className="text-xs font-semibold text-slate-700 mt-1">{stat.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{stat.source}</p>
            </div>
          ))}
        </div>

        {/* India Map */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">India Cybercrime Heatmap</h2>
              <p className="text-xs text-slate-500 mt-1">NCRB 2023 — hover or click any state for details</p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-500">
              {[["bg-red-100", "Low"], ["bg-red-400", "Medium"], ["bg-red-900", "High"]].map(([bg, label]) => (
                <span key={label} className="flex items-center gap-1.5">
                  <span className={`w-3 h-3 rounded ${bg}`} />
                  {label}
                </span>
              ))}
            </div>
          </div>

          <IndiaMap onStateClick={setSelectedState} selectedState={selectedState} />

          {selectedState && (
            <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: getColor(selectedState.cases) }}>
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedState.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{selectedState.cases.toLocaleString("en-IN")} reported cases in 2023</p>
                  <p className="text-xs text-slate-600 mt-1"><span className="font-semibold">Top scam:</span> {selectedState.topScam}</p>
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-xs text-slate-400">Risk Level</p>
                <p className="text-sm font-bold text-red-500 mt-0.5">
                  {selectedState.cases > 10000 ? "Critical" : selectedState.cases > 7000 ? "High" : selectedState.cases > 4000 ? "Medium" : "Low"}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Network Graph */}
        <div>
          <div className="mb-4">
            <h2 className="font-display font-bold text-xl text-slate-900">Fraud Network Graph</h2>
            <p className="text-xs text-slate-500 mt-1">ED Operation Mule Hunt 2.0 — scammers, mule accounts, and victims (₹34,855 Cr identified)</p>
          </div>

          <div className="flex flex-wrap gap-3 mb-4">
            {campaigns.map(c => (
              <div key={c.id} className="bg-white border border-slate-100 rounded-xl px-4 py-2 flex items-center gap-2 shadow-sm">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                <div>
                  <p className="text-xs font-semibold text-slate-800">{c.name}</p>
                  <p className="text-[10px] text-slate-400">{c.nodes.length} nodes · {c.description}</p>
                </div>
              </div>
            ))}
          </div>

          <NetworkGraph onNodeClick={setSelectedNode} />

          <div className="flex items-center gap-6 mt-3 text-xs text-slate-500 flex-wrap">
            {[["#E8431A", "Scammer (SE Asia/Dubai)"], ["#E8A317", "Mule Account (Shell Cos.)"], ["#2D6BE4", "Victim (22.68L complaints)"]].map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
            <span className="ml-auto text-[10px]">Data: MHA/I4C, ED, NCRB 2023–26</span>
          </div>
        </div>

      </div>

      {/* Node Sidebar */}
      {selectedNode && (
        <div className="fixed right-0 top-0 h-full w-72 bg-white border-l border-slate-100 shadow-xl p-6 overflow-y-auto z-50">
          <div className="flex justify-between items-start mb-4">
            <h3 className="font-display font-bold text-lg text-slate-900">Node Details</h3>
            <button onClick={() => setSelectedNode(null)} className="p-1 hover:bg-slate-100 rounded-lg">
              <X className="w-5 h-5 text-slate-400" />
            </button>
          </div>
          <div className="space-y-3 text-sm">
            <div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Label</p><p className="font-semibold text-slate-900">{selectedNode.label}</p></div>
            <div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Type</p><p className="text-slate-700 capitalize">{selectedNode.type}</p></div>
            {selectedNode.location && <div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Location</p><p className="text-slate-700">{selectedNode.location}</p></div>}
            {selectedNode.account && <div><p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Account Type</p><p className="font-mono text-slate-700">{selectedNode.account}</p></div>}
            <div className="pt-3 border-t border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Intelligence Source</p>
              <p className="text-slate-600 text-xs leading-relaxed">
                {selectedNode.type === "scammer" && "ED: Scammers operate from Cambodia, Myanmar, Laos, Dubai, Thailand"}
                {selectedNode.type === "mule" && "ED: 2.96 lakh IMEIs, 11.14 lakh SIMs blocked; 1.05 lakh mule accounts identified"}
                {selectedNode.type === "victim" && "NCCRP: 22.68 lakh complaints in 2024 — 42% increase from 2023"}
              </p>
            </div>
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify({ ...selectedNode, timestamp: new Date().toISOString(), source: "MHA/I4C, ED, NCRB 2023-26" }, null, 2)], { type: "application/json" })
                const url = URL.createObjectURL(blob)
                const a = document.createElement("a")
                a.href = url; a.download = `intel-${selectedNode.id}.json`; a.click()
                URL.revokeObjectURL(url)
              }}
              className="w-full mt-2 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl hover:opacity-90 transition"
            >
              Export Intelligence
            </button>
          </div>
        </div>
      )}
    </div>
  )
}