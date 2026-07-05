import { Link } from 'react-router-dom'
import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-white py-4">
      <div className="max-w-7xl mx-auto px-6">
        {/* Links — single row */}
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs text-[var(--color-muted)]">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[var(--color-danger)]" strokeWidth={2.5} />
            <span className="font-display font-semibold text-sm text-[var(--color-text)]">
              Project Shield
            </span>
          </div>

          <span className="w-px h-3 bg-[var(--color-border)]" />

          <a 
            href="https://cybercrime.gov.in" 
            target="_blank" 
            rel="noreferrer"
            className="hover:text-[var(--color-danger)] transition"
          >
            Official Cybercrime Portal
          </a>

          <span className="w-px h-3 bg-[var(--color-border)]" />

          <Link to="/cybersafe" className="hover:text-[var(--color-danger)] transition">
            Safety Tips
          </Link>

          <span className="w-px h-3 bg-[var(--color-border)]" />

          <Link to="/analyze" className="hover:text-[var(--color-danger)] transition">
            Report Fraud
          </Link>

          <span className="w-px h-3 bg-[var(--color-border)]" />

          <Link to="/" className="hover:text-[var(--color-danger)] transition">
            Privacy Policy
          </Link>
        </div>

        {/* Copyright — smaller */}
        <div className="text-center text-[10px] text-[var(--color-muted)] mt-2">
          © 2026 Project Shield. All rights reserved.
        </div>
      </div>
    </footer>
  )
}