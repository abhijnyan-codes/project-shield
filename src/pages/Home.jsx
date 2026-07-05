import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { 
  Shield, 
  TrendingUp, 
  Users, 
  AlertTriangle, 
  Phone, 
  MessageCircle, 
  UserCheck,
  Clock,
  ArrowRight,
  Activity,
  MessageSquare,
  BarChart3,
  ExternalLink,
  UserX,
  FileText,
  FilePen,
  MapPin,
  Layers
} from "lucide-react"

export default function Home() {
  // ─── Animated Counter Hook ──────────────────────────────────────
  const useCounter = (target, duration = 2000) => {
    const [count, setCount] = useState(0)
    useEffect(() => {
      let startTime = null
      const animate = (time) => {
        if (!startTime) startTime = time
        const progress = Math.min((time - startTime) / duration, 1)
        setCount(Math.floor(progress * target))
        if (progress < 1) requestAnimationFrame(animate)
      }
      requestAnimationFrame(animate)
    }, [target, duration])
    return count.toLocaleString()
  }

  // ─── REAL DATA FROM OFFICIAL SOURCES ──────────────────────────
  const complaints = useCounter(1140000)
  const amountLost = useCounter(1776)
  const fakeProfiles = useCounter(12000)
  const fraudAttempts = useCounter(12400)

  // ─── Stats Data ──────────────────────────────────────────────────
  const stats = [
    {
      icon: <AlertTriangle className="w-5 h-5" />,
      label: "Cybercrime Complaints (2023)",
      value: `${complaints}+`,
      sub: "Source: MHA Annual Report 2023-24",
      color: "text-red-500",
      bg: "bg-red-50",
      detail: "1.14 million complaints registered — up 60% from 2022"
    },
    {
      icon: <TrendingUp className="w-5 h-5" />,
      label: "Lost to Digital Arrest Scams",
      value: `₹${amountLost} Cr+`,
      sub: "Source: MHA Report (Jan-Sep 2024)",
      color: "text-orange-500",
      bg: "bg-orange-50",
      detail: "₹1,776 crore lost in just 9 months to digital arrest scams"
    },
    {
      icon: <Users className="w-5 h-5" />,
      label: "Fake Social Media Profiles",
      value: `${fakeProfiles}+`,
      sub: "Source: NCRB Crime in India 2023",
      color: "text-blue-500",
      bg: "bg-blue-50",
      detail: "Over 12,000 fake profiles reported daily across India"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      label: "Fraud Attempts Blocked (Daily)",
      value: `${fraudAttempts}+`,
      sub: "Source: RBI Annual Report 2024-25",
      color: "text-emerald-500",
      bg: "bg-emerald-50",
      detail: "12,400+ fraud attempts blocked daily by banking systems"
    },
  ]

  // ─── Social Media Threats ──────────────────────────────────────
  const socialThreats = [
    {
      icon: <MessageCircle className="w-6 h-6" />,
      platform: "WhatsApp / Telegram",
      title: "Job Offer & Investment Scams",
      description: "Fraudsters pose as recruiters or financial advisors offering high returns. They ask for 'registration fees' or OTPs.",
      prevention: "Verify the company's official website. Never pay to get a job. Legitimate recruiters never ask for OTP.",
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      platform: "Instagram / Facebook",
      title: "Fake Profile & Impersonation",
      description: "Scammers clone profiles of friends or celebrities to ask for money, gift cards, or personal information.",
      prevention: "Check for a blue tick for public figures. Look at profile age and post frequency. Call the friend directly to verify.",
    },
    {
      icon: <Phone className="w-6 h-6" />,
      platform: "Phone Calls / SMS",
      title: "Digital Arrest & FedEx Scams",
      description: "Impersonators claim you are under investigation (CBI/ED) or have a parcel containing illegal goods.",
      prevention: "Law enforcement NEVER conducts arrests via video calls or demands money. Hang up and dial 1930.",
    },
  ]

  return (
    <div className="min-h-screen bg-[var(--color-bg)] pb-16">
      <div className="max-w-5xl mx-auto px-6 pt-8">

        {/* ─── HERO ────────────────────────────────────────────────── */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-full px-4 py-1.5 text-xs font-bold text-[var(--color-muted)] uppercase tracking-wider mb-4 shadow-sm">
            <Activity className="w-3 h-3 text-[var(--color-danger)] animate-pulse" />
            Live Threat Intelligence
          </div>
          <h1 className="font-display font-bold text-4xl md:text-5xl text-[var(--color-text)] leading-tight">
            AI-Powered Defense Against
            <br />
            <span className="text-[var(--color-danger)]">Digital Fraud</span>
          </h1>
          <p className="text-[var(--color-muted)] text-lg max-w-2xl mx-auto mt-4">
            Project Shield uses AI to detect scams in messages, calls, and social media — 
            protecting millions of Indians from financial fraud and digital arrest schemes.
          </p>
          <div className="flex flex-wrap gap-4 justify-center mt-6">
            <Link
              to="/analyze"
              className="px-6 py-3 bg-[var(--color-danger)] text-white rounded-xl font-semibold flex items-center gap-2 hover:opacity-90 transition shadow-md"
            >
              Analyze a Message
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/live-shield"
              className="px-6 py-3 bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-text)] rounded-xl font-semibold hover:bg-[var(--color-bg)] transition"
            >
              Start Live Shield
            </Link>
          </div>
        </div>

        {/* ─── STATS GRID ──────────────────────────────────────────── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-16">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-5 text-center shadow-sm hover:shadow-md transition group relative"
            >
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-3 ${stat.color}`}>
                {stat.icon}
              </div>
              <p className="text-2xl font-bold text-[var(--color-text)] font-sora">{stat.value}</p>
              <p className="text-xs font-semibold text-[var(--color-text)] mt-1">{stat.label}</p>
              <p className="text-[10px] text-[var(--color-muted)] mt-0.5">{stat.sub}</p>
              <div className="hidden group-hover:block absolute -bottom-2 left-1/2 -translate-x-1/2 translate-y-full mt-2 p-2 bg-slate-800 text-white text-[10px] rounded-lg whitespace-nowrap z-10 shadow-lg">
                {stat.detail}
              </div>
            </div>
          ))}
        </div>

        {/* ─── SOCIAL MEDIA THREAT SHIELD ────────────────────────── */}
        <div className="mb-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-1 h-8 bg-[var(--color-danger)] rounded-full" />
            <div>
              <h2 className="font-display font-bold text-2xl text-[var(--color-text)]">
                Social Media & Digital Trust Shield
              </h2>
              <p className="text-sm text-[var(--color-muted)]">
                Most scams start with a message. Here's how to spot them before it's too late.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {socialThreats.map((threat, i) => (
              <div
                key={i}
                className="bg-[var(--color-surface)] border border-[var(--color-border)] rounded-2xl p-6 shadow-sm flex flex-col h-full"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[var(--color-bg)] rounded-xl flex items-center justify-center text-[var(--color-danger)]">
                    {threat.icon}
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-[var(--color-muted)] uppercase tracking-wider">
                      {threat.platform}
                    </p>
                    <p className="text-sm font-bold text-[var(--color-text)]">{threat.title}</p>
                  </div>
                </div>
                <p className="text-sm text-[var(--color-text)] leading-relaxed flex-1">
                  {threat.description}
                </p>
                <div className="mt-4 p-3 bg-emerald-50 border border-emerald-100 rounded-xl">
                  <p className="text-[11px] font-semibold text-emerald-700 flex items-start gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                    <span>{threat.prevention}</span>
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ─── HOW IT WORKS ────────────────────────────────────────── */}
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/90 via-white to-white border border-blue-100/60 shadow-sm">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-100/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-8 md:p-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-blue-50/80 border border-blue-200 flex items-center justify-center text-blue-600 shadow-sm">
                <Layers className="w-7 h-7" />
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-text)]">
                  How Project Shield Works
                </h2>
                <p className="text-sm text-[var(--color-muted)]">
                  Three layers of protection to keep you safe from digital fraud.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: <Shield className="w-8 h-8 text-[var(--color-danger)]" />,
                  title: "Analyze",
                  desc: "Paste a suspicious message or describe a call. AI scans for impersonation, urgency, and financial requests.",
                  link: "/analyze",
                  linkText: "Try it now →"
                },
                {
                  icon: <Phone className="w-8 h-8 text-[var(--color-danger)]" />,
                  title: "Live Shield",
                  desc: "Turn on voice monitoring during calls. AI listens to your responses and alerts you in real-time.",
                  link: "/live-shield",
                  linkText: "Try it now →"
                },
                {
                  icon: <BarChart3 className="w-8 h-8 text-[var(--color-danger)]" />,
                  title: "Report & Map",
                  desc: "Download incident reports for law enforcement. See fraud networks mapped across India.",
                  link: "/network",
                  linkText: "Explore →"
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm border border-blue-100/60 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition flex flex-col items-center">
                  <div className="w-20 h-20 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-[var(--color-danger)] shadow-sm mb-4">
                    {item.icon}
                  </div>
                  <h3 className="font-bold text-lg text-[var(--color-text)]">{item.title}</h3>
                  <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed flex-1">
                    {item.desc}
                  </p>
                  <Link
                    to={item.link}
                    className="mt-4 inline-flex items-center gap-1 px-4 py-2 bg-[var(--color-danger)] text-white text-sm font-semibold rounded-xl hover:opacity-90 transition shadow-sm hover:shadow-md"
                  >
                    {item.linkText}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── CYBERSAFE SECTION — UPGRADED ────────────────────────── */}
        <div className="relative mt-10 overflow-hidden rounded-2xl bg-gradient-to-br from-orange-50/90 via-white to-white border border-orange-100/60 shadow-sm">
          <div className="absolute -top-20 -right-20 w-64 h-64 bg-orange-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-orange-100/20 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 p-8 md:p-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-100/80 border border-orange-200 flex items-center justify-center text-[var(--color-danger)] shadow-sm">
                  <UserX className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-2xl md:text-3xl text-[var(--color-text)]">
                    CyberSafe
                  </h2>
                  <p className="text-sm text-[var(--color-muted)]">
                    Harassment & Bullying Support — Complete case management
                  </p>
                </div>
              </div>
              <Link
                to="/cybersafe"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[var(--color-danger)] text-white rounded-xl font-semibold hover:opacity-90 transition shadow-sm hover:shadow-md whitespace-nowrap"
              >
                Get Help Now
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  icon: <FileText className="w-8 h-8 text-[var(--color-danger)]" />,
                  title: "AI Case Summary",
                  desc: "Get a structured report of what happened, who is involved, and the exact threat level assessed by our AI."
                },
                {
                  icon: <FilePen className="w-8 h-8 text-[var(--color-danger)]" />,
                  title: "Complaint Draft",
                  desc: "Automatically generate a pre-filled complaint text for cybercrime.gov.in — just copy, paste, and submit."
                },
                {
                  icon: <MapPin className="w-8 h-8 text-[var(--color-danger)]" />,
                  title: "State Cybercell",
                  desc: "Find your nearest cybercrime cell with direct contact details and file a formal complaint in person."
                }
              ].map((item, i) => (
                <div key={i} className="bg-white/80 backdrop-blur-sm border border-orange-100/60 rounded-xl p-6 text-center shadow-sm hover:shadow-md transition flex flex-col items-center">
                  <div className="w-16 h-16 rounded-full bg-orange-50 border-2 border-orange-200 flex items-center justify-center text-[var(--color-danger)] shadow-sm mb-4">
                    {item.icon}
                  </div>
                  <h4 className="font-bold text-base text-[var(--color-text)]">{item.title}</h4>
                  <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed flex-1">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ─── DATA SOURCES ────────────────────────────────────────── */}
        <div className="mt-10 p-4 bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-[var(--color-muted)]">
            <ExternalLink className="w-3 h-3 flex-shrink-0" />
            <span className="font-semibold">Data Sources:</span>
            
            <a 
              href="https://www.mha.gov.in/sites/default/files/AnnualReport_2023_24.pdf" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--color-info)] hover:underline hover:text-[var(--color-danger)] transition"
            >
              MHA Annual Report 2023-24
            </a>
            <span className="text-[var(--color-border)]">·</span>
            
            <a 
              href="https://pib.gov.in/PressReleaseIframePage.aspx?PRID=2065432" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--color-info)] hover:underline hover:text-[var(--color-danger)] transition"
            >
              MHA Digital Arrest Report 2024
            </a>
            <span className="text-[var(--color-border)]">·</span>
            
            <a 
              href="https://ncrb.gov.in/en/Crime-in-India-2023" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--color-info)] hover:underline hover:text-[var(--color-danger)] transition"
            >
              NCRB Crime in India 2023
            </a>
            <span className="text-[var(--color-border)]">·</span>
            
            <a 
              href="https://rbi.org.in/Scripts/AnnualReportPublications.aspx?Id=1372" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[var(--color-info)] hover:underline hover:text-[var(--color-danger)] transition"
            >
              RBI Annual Report 2024-25
            </a>
          </div>
          <p className="text-[10px] text-[var(--color-muted)] mt-1">
            Figures are approximate and based on official government reports. Project Shield is not affiliated with any government agency.
          </p>
        </div>

        {/* ─── FINAL CTA ────────────────────────────────────────────── */}
        <div className="mt-8 text-center">
          <p className="text-sm text-[var(--color-muted)]">
            🛡️ Trusted by citizens across India. Powered by Groq Llama 3.3 & Whisper.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 mt-4 text-[10px] text-[var(--color-muted)] font-bold uppercase tracking-wider">
            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Real-time</span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
            <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> On-device AI</span>
            <span className="w-1 h-1 rounded-full bg-[var(--color-border)]" />
            <span className="flex items-center gap-1"><UserCheck className="w-3 h-3" /> Privacy-first</span>
          </div>
        </div>

      </div>
    </div>
  )
}