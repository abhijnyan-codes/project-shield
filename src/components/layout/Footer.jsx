import { Shield } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="border-t border-[var(--color-border)] bg-[var(--color-bg)] py-6">
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between text-sm text-[var(--color-muted)]">
        <div className="flex items-center gap-2 font-display font-bold text-[var(--color-text)]">
          <Shield className="w-4 h-4 text-[var(--color-danger)]" />
          Project Shield
        </div>
        <div className="flex gap-6">
          <a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="hover:underline">Official Cybercrime Portal</a>
          <a href="#" className="hover:underline">Safety Tips</a>
          <a href="#" className="hover:underline">Report Fraud</a>
          <a href="#" className="hover:underline">Privacy Policy</a>
        </div>
        <div>© 2026 Project Shield. All rights reserved.</div>
      </div>
    </footer>
  )
}