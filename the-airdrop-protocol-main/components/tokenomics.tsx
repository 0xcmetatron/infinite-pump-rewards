'use client'

import { useEffect, useRef } from 'react'

const cards = [
  { val: '30s', label: 'Reward Interval' },
  { val: '$PUMP', label: 'Reward Token' },
  { val: '20K', label: 'DEX Target' },
  { val: '100%', label: 'Transparent' },
]

function RevealCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('opacity-100', 'translate-y-0') },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return (
    <div ref={ref} className="opacity-0 translate-y-10 transition-all duration-700 ease-out">
      {children}
    </div>
  )
}

export default function Tokenomics() {
  return (
    <section id="tokenomics" className="relative z-10 px-10 py-24 text-center">
      <RevealCard>
        <div className="inline-block text-[13px] text-[var(--green)] font-semibold uppercase tracking-[3px] mb-4 border border-[rgba(84,213,146,.2)] px-5 py-1.5 rounded-full">
          Tokenomics
        </div>
        <h2
          className="font-display font-extrabold tracking-tight mb-16"
          style={{ fontSize: 'clamp(36px,5vw,64px)', letterSpacing: '-2px' }}
        >
          Built for <span className="text-[var(--green)]">Holders</span>
        </h2>
      </RevealCard>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 max-w-4xl mx-auto">
        {cards.map((c) => (
          <RevealCard key={c.label}>
            <div className="group bg-[rgba(84,213,146,.04)] border border-[rgba(84,213,146,.1)] rounded-2xl p-8 hover:border-[var(--green)] hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(84,213,146,.1)] transition-all duration-400">
              <div className="font-display text-4xl font-extrabold text-[var(--green)] mb-2">
                {c.val}
              </div>
              <div className="text-[var(--text-dim)] text-sm font-medium">{c.label}</div>
            </div>
          </RevealCard>
        ))}
      </div>
    </section>
  )
}
