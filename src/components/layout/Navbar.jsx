import { NavLink } from 'react-router-dom'
import { Shield } from 'lucide-react'

const tabs = [
  { to: '/', label: 'Home' },              // ✅ Home is now the root
  { to: '/analyze', label: 'Analyze' },    // ✅ Analyze moved to /analyze
  { to: '/live-shield', label: 'Live Shield' },
  { to: '/network', label: 'Network Map' },
]

export default function Navbar() {
  return (
    <nav className="border-b border-[var(--color-border)] bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-[var(--color-danger)]" strokeWidth={2.5} />
          <span className="font-display font-bold text-lg text-[var(--color-text)]">
            Project Shield
          </span>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-8">
          {tabs.map((tab) => (
            <NavLink
              key={tab.to}
              to={tab.to}
              className={({ isActive }) =>
                `text-sm font-medium pb-1 border-b-2 transition-colors ${
                  isActive
                    ? 'text-[var(--color-danger)] border-[var(--color-danger)]'
                    : 'text-[var(--color-text)] border-transparent hover:text-[var(--color-danger)]'
                }`
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </div>

        {/* CTA Button */}
        <NavLink
          to="/analyze"
          className="px-4 py-2 rounded-full bg-[var(--color-danger)] text-white text-sm font-semibold hover:opacity-90 transition shadow-sm hover:shadow-md flex items-center gap-1"
        >
          Report a Scam →
        </NavLink>
      </div>
    </nav>
  )
}