import { useEffect, useRef, useState } from "react"
import * as d3 from "d3"
import { Shield, X } from "lucide-react"

// ─── Mock Data ──────────────────────────────────────────────────
const mockData = {
  nodes: [
    // Scammers (red)
    { id: "s1", type: "scammer", label: "Scammer A", phone: "+91 98765 43210" },
    { id: "s2", type: "scammer", label: "Scammer B", phone: "+91 87654 32109" },
    { id: "s3", type: "scammer", label: "Scammer C", phone: "+91 76543 21098" },
    { id: "s4", type: "scammer", label: "Scammer D", phone: "+91 65432 10987" },
    // Mules (amber)
    { id: "m1", type: "mule", label: "Mule Account 1", account: "XXXX1234" },
    { id: "m2", type: "mule", label: "Mule Account 2", account: "XXXX5678" },
    { id: "m3", type: "mule", label: "Mule Account 3", account: "XXXX9012" },
    { id: "m4", type: "mule", label: "Mule Account 4", account: "XXXX3456" },
    { id: "m5", type: "mule", label: "Mule Account 5", account: "XXXX7890" },
    { id: "m6", type: "mule", label: "Mule Account 6", account: "XXXX2345" },
    // Victims (blue)
    { id: "v1", type: "victim", label: "Victim A", location: "Mumbai" },
    { id: "v2", type: "victim", label: "Victim B", location: "Delhi" },
    { id: "v3", type: "victim", label: "Victim C", location: "Bangalore" },
    { id: "v4", type: "victim", label: "Victim D", location: "Chennai" },
    { id: "v5", type: "victim", label: "Victim E", location: "Hyderabad" },
    { id: "v6", type: "victim", label: "Victim F", location: "Kolkata" },
    { id: "v7", type: "victim", label: "Victim G", location: "Pune" },
    { id: "v8", type: "victim", label: "Victim H", location: "Ahmedabad" },
    { id: "v9", type: "victim", label: "Victim I", location: "Jaipur" },
    { id: "v10", type: "victim", label: "Victim J", location: "Lucknow" },
  ],
  links: [
    { source: "s1", target: "m1" },
    { source: "s1", target: "m2" },
    { source: "s2", target: "m3" },
    { source: "s3", target: "m4" },
    { source: "s3", target: "m5" },
    { source: "s4", target: "m6" },
    { source: "m1", target: "v1" },
    { source: "m1", target: "v2" },
    { source: "m2", target: "v3" },
    { source: "m2", target: "v4" },
    { source: "m3", target: "v5" },
    { source: "m3", target: "v6" },
    { source: "m4", target: "v7" },
    { source: "m4", target: "v8" },
    { source: "m5", target: "v9" },
    { source: "m5", target: "v10" },
    { source: "m6", target: "v1" },
    { source: "m6", target: "v3" },
    { source: "s2", target: "m5" },
    { source: "s4", target: "m2" },
  ],
}

// ─── Campaign Data ─────────────────────────────────────────────
const campaigns = [
  {
    id: "campaign1",
    name: "Digital Arrest Network",
    nodes: ["s1", "s2", "m1", "m2", "m3", "v1", "v2", "v3", "v4", "v5"],
    color: "#E8431A",
    description: "CBI/ED impersonation scams targeting senior citizens",
  },
  {
    id: "campaign2",
    name: "FedEx Parcel Ring",
    nodes: ["s3", "m4", "m5", "v6", "v7", "v8", "v9"],
    color: "#E8A317",
    description: "Customs clearance fraud with fake parcel notifications",
  },
  {
    id: "campaign3",
    name: "UPI Refund Scam",
    nodes: ["s4", "m6", "v1", "v3", "v10"],
    color: "#2D6BE4",
    description: "Fake bank representatives tricking victims into sending money",
  },
]

export default function NetworkMap() {
  const svgRef = useRef(null)
  const containerRef = useRef(null)
  const [selectedNode, setSelectedNode] = useState(null)
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })

  // ─── Responsive sizing ──────────────────────────────────────────
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect()
        setDimensions({
          width: rect.width || 800,
          height: Math.max(400, window.innerHeight - 300),
        })
      }
    }

    updateDimensions()
    window.addEventListener("resize", updateDimensions)
    return () => window.removeEventListener("resize", updateDimensions)
  }, [])

  // ─── D3 Graph ───────────────────────────────────────────────────
  useEffect(() => {
    if (!svgRef.current || dimensions.width === 0) return

    const { width, height } = dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 }
    const innerWidth = width - margin.left - margin.right
    const innerHeight = height - margin.top - margin.bottom

    d3.select(svgRef.current).selectAll("*").remove()

    const svg = d3
      .select(svgRef.current)
      .attr("width", width)
      .attr("height", height)
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`)

    // ─── Color mapping ─────────────────────────────────────────────
    const colorMap = {
      scammer: "#E8431A",
      mule: "#E8A317",
      victim: "#2D6BE4",
    }

    const sizeMap = {
      scammer: 14,
      mule: 10,
      victim: 8,
    }

    // ─── Simulation ───────────────────────────────────────────────
    const simulation = d3
      .forceSimulation(mockData.nodes)
      .force(
        "link",
        d3
          .forceLink(mockData.links)
          .id((d) => d.id)
          .distance(100)
      )
      .force("charge", d3.forceManyBody().strength(-300))
      .force("center", d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force("collision", d3.forceCollide().radius(20))

    // ─── Links ─────────────────────────────────────────────────────
    const link = svg
      .append("g")
      .selectAll("line")
      .data(mockData.links)
      .enter()
      .append("line")
      .attr("stroke", "#CBD5E1")
      .attr("stroke-width", 1.5)
      .attr("stroke-opacity", 0.6)

    // ─── Nodes ─────────────────────────────────────────────────────
    const node = svg
      .append("g")
      .selectAll("circle")
      .data(mockData.nodes)
      .enter()
      .append("circle")
      .attr("r", (d) => sizeMap[d.type] || 8)
      .attr("fill", (d) => colorMap[d.type] || "#94A3B8")
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", 2)
      .attr("cursor", "pointer")
      .on("click", (event, d) => {
        setSelectedNode(d)
      })
      .on("mouseenter", function () {
        d3.select(this).attr("stroke-width", 4)
      })
      .on("mouseleave", function () {
        d3.select(this).attr("stroke-width", 2)
      })

    // ─── Labels ────────────────────────────────────────────────────
    const label = svg
      .append("g")
      .selectAll("text")
      .data(mockData.nodes)
      .enter()
      .append("text")
      .text((d) => d.label)
      .attr("font-size", "8px")
      .attr("fill", "#1A1A18") // ✅ Light mode text color
      .attr("text-anchor", "middle")
      .attr("dy", -12)
      .attr("font-weight", 500)

    // ─── Tooltips ──────────────────────────────────────────────────
    const tooltip = d3
      .select("body")
      .append("div")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #E8E4DE")
      .style("border-radius", "8px")
      .style("padding", "8px 12px")
      .style("font-size", "11px")
      .style("box-shadow", "0 4px 12px rgba(0,0,0,0.1)")
      .style("pointer-events", "none")
      .style("opacity", 0)
      .style("transition", "opacity 0.2s")
      .style("z-index", 100)
      .style("color", "#1A1A18")

    node
      .on("mouseenter", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `<strong>${d.label}</strong><br/>Type: ${
              d.type.charAt(0).toUpperCase() + d.type.slice(1)
            }<br/>${d.phone ? `Phone: ${d.phone}` : ""}${
              d.account ? `Account: ${d.account}` : ""
            }${d.location ? `Location: ${d.location}` : ""}`
          )
          .style("left", event.pageX + 12 + "px")
          .style("top", event.pageY - 10 + "px")
      })
      .on("mouseleave", () => {
        tooltip.style("opacity", 0)
      })

    // ─── Update positions ─────────────────────────────────────────
    simulation.on("tick", () => {
      link
        .attr("x1", (d) => d.source.x)
        .attr("y1", (d) => d.source.y)
        .attr("x2", (d) => d.target.x)
        .attr("y2", (d) => d.target.y)

      node
        .attr("cx", (d) => {
          const x = Math.max(10, Math.min(innerWidth - 10, d.x))
          d.x = x
          return x
        })
        .attr("cy", (d) => {
          const y = Math.max(10, Math.min(innerHeight - 10, d.y))
          d.y = y
          return y
        })

      label
        .attr("x", (d) => d.x)
        .attr("y", (d) => d.y - 14)
    })

    // ─── Zoom ──────────────────────────────────────────────────────
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 2])
      .on("zoom", (event) => {
        svg.attr("transform", event.transform)
      })

    d3.select(svgRef.current).call(zoom)

    return () => {
      simulation.stop()
      tooltip.remove()
    }
  }, [dimensions])

  // ─── Node Detail Sidebar ────────────────────────────────────────
  const NodeDetailPanel = ({ node, onClose }) => {
    if (!node) return null

    const typeLabels = {
      scammer: "🔴 Scammer",
      mule: "🟡 Mule Account",
      victim: "🔵 Victim",
    }

    return (
      <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-[var(--color-border)] shadow-xl p-6 overflow-y-auto z-50 animate-in slide-in-from-right duration-300">
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-display font-bold text-lg text-[var(--color-text)]">
            Node Details
          </h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-[var(--color-bg)] rounded-lg transition"
          >
            <X className="w-5 h-5 text-[var(--color-muted)]" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">
              Label
            </p>
            <p className="text-sm font-semibold text-[var(--color-text)]">{node.label}</p>
          </div>

          <div>
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">
              Type
            </p>
            <p className="text-sm text-[var(--color-text)]">{typeLabels[node.type] || node.type}</p>
          </div>

          {node.phone && (
            <div>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">
                Phone
              </p>
              <p className="text-sm font-mono text-[var(--color-text)]">{node.phone}</p>
            </div>
          )}

          {node.account && (
            <div>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">
                Account
              </p>
              <p className="text-sm font-mono text-[var(--color-text)]">{node.account}</p>
            </div>
          )}

          {node.location && (
            <div>
              <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">
                Location
              </p>
              <p className="text-sm text-[var(--color-text)]">{node.location}</p>
            </div>
          )}

          <div className="pt-4 border-t border-[var(--color-border)]">
            <p className="text-xs text-[var(--color-muted)] uppercase tracking-wider font-semibold">
              Connected Nodes
            </p>
            <p className="text-sm text-[var(--color-text)]">
              {mockData.links.filter(
                (l) => l.source.id === node.id || l.target.id === node.id
              ).length || 0}{" "}
              connections
            </p>
          </div>

          <button
            onClick={() => {
              const report = {
                node: node.label,
                type: node.type,
                ...(node.phone && { phone: node.phone }),
                ...(node.account && { account: node.account }),
                ...(node.location && { location: node.location }),
                timestamp: new Date().toISOString(),
              }
              const blob = new Blob([JSON.stringify(report, null, 2)], {
                type: "application/json",
              })
              const url = URL.createObjectURL(blob)
              const a = document.createElement("a")
              a.href = url
              a.download = `intel-${node.id}-${Date.now()}.json`
              a.click()
              URL.revokeObjectURL(url)
            }}
            className="w-full mt-4 px-4 py-2 bg-[var(--color-text)] text-white text-xs font-semibold rounded-xl hover:opacity-90 transition"
          >
            Export Intelligence
          </button>
        </div>
      </div>
    )
  }

  // ─── Counts ──────────────────────────────────────────────────────
  const counts = {
    scammer: mockData.nodes.filter((n) => n.type === "scammer").length,
    mule: mockData.nodes.filter((n) => n.type === "mule").length,
    victim: mockData.nodes.filter((n) => n.type === "victim").length,
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* ─── Header ───────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-display font-bold text-[var(--color-text)]">
              Network Map
            </h1>
            <p className="text-[var(--color-muted)] text-sm">
              Detected Campaign: Digital Arrest Network —{" "}
              <span className="text-[var(--color-text)] font-semibold">
                {mockData.nodes.length} nodes identified
              </span>
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs text-[var(--color-text)] font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E8431A]" />
              Scammer ({counts.scammer})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#E8A317]" />
              Mule ({counts.mule})
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-full bg-[#2D6BE4]" />
              Victim ({counts.victim})
            </span>
          </div>
        </div>

        {/* ─── Campaign Cards ──────────────────────────────────────── */}
        <div className="flex flex-wrap gap-3 mb-4">
          {campaigns.map((campaign) => (
            <div
              key={campaign.id}
              className="bg-white border border-[var(--color-border)] rounded-xl px-4 py-2 flex items-center gap-3 shadow-sm"
            >
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: campaign.color }}
              />
              <div>
                <p className="text-xs font-semibold text-[var(--color-text)]">
                  {campaign.name}
                </p>
                <p className="text-[10px] text-[var(--color-muted)]">
                  {campaign.nodes.length} nodes · {campaign.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* ─── Graph Container ─────────────────────────────────────── */}
        <div
          ref={containerRef}
          className="bg-white border border-[var(--color-border)] rounded-2xl overflow-hidden relative shadow-sm"
          style={{ height: dimensions.height }}
        >
          <svg ref={svgRef} className="w-full h-full" />

          {/* Trust Badge */}
          <div className="absolute bottom-4 right-4 text-[10px] text-[var(--color-muted)] bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-[var(--color-border)] shadow-sm">
            🔒 Encrypted Intelligence
          </div>
        </div>

        {/* ─── Footer Stats ────────────────────────────────────────── */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-[var(--color-muted)]">
          <div className="flex items-center gap-4">
            <span>Last updated: just now</span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
            <span>Data source: Project Shield Intelligence</span>
          </div>
          <div className="flex items-center gap-2">
            <Shield className="w-3 h-3 text-[var(--color-danger)]" />
            <span>Click any node for intelligence details</span>
          </div>
        </div>
      </div>

      {/* ─── Node Detail Sidebar ──────────────────────────────────── */}
      {selectedNode && (
        <NodeDetailPanel
          node={selectedNode}
          onClose={() => setSelectedNode(null)}
        />
      )}
    </div>
  )
}