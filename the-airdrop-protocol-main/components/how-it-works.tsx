'use client'

import { useEffect, useRef } from 'react'

const steps = [
  {
    num: '01',
    title: 'Buy $IPR',
    desc: 'Get $IPR on Pump.fun. No minimum, no complicated setup — just buy and hold.',
  },
  {
    num: '02',
    title: 'Hold & Earn',
    desc: 'Rewards in $PUMP are distributed to all holders every 30 seconds — fully automatic.',
  },
  {
    num: '03',
    title: 'Watch Live',
    desc: 'All payments are visible on-chain with full transparency. See every transfer in real time.',
  },
]

function TiltCard({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const x = (e.clientX - r.left) / r.width - 0.5
    const y = (e.clientY - r.top) / r.height - 0.5
    el.style.transform = `perspective(600px) rotateY(${x * 12}deg) rotateX(${-y * 12}deg) translateY(-8px)`
  }
  const onLeave = () => {
    if (ref.current) ref.current.style.transform = ''
  }

  return (
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave}>
      {children}
    </div>
  )
}

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

export default function HowItWorks() {
  return (
    <section id="how" className="relative z-10 px-10 py-24 text-center">
      <RevealCard>
        <div className="inline-block text-[13px] text-[var(--green)] font-semibold uppercase tracking-[3px] mb-4 border border-[rgba(47,121,202,.25)] bg-[rgba(47,121,202,.08)] px-5 py-1.5 rounded-full">
          How It Works
        </div>
        <h2
          className="font-display font-extrabold tracking-tight mb-16"
          style={{ fontSize: 'clamp(36px,5vw,64px)', letterSpacing: '-2px' }}
        >
          Simple. Transparent.{' '}
          <span className="text-[var(--green)]">Automatic.</span>
        </h2>
      </RevealCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        {steps.map((s) => (
          <RevealCard key={s.num}>
            <TiltCard>
              <div className="group bg-gradient-to-br from-[rgba(255,255,255,.82)] to-[rgba(232,240,251,.65)] border border-[rgba(47,121,202,.18)] rounded-2xl p-10 text-left hover:border-[var(--green)] hover:shadow-[0_20px_60px_rgba(47,121,202,.14)] transition-all duration-400 relative overflow-hidden">
                <div
                  className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[var(--green)] to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
                  aria-hidden
                />
                <div className="font-display text-5xl font-black text-[rgba(47,121,202,.28)] mb-4">
                  {s.num}
                </div>
                <h3 className="font-display text-xl font-bold mb-3 text-[var(--text)]">
                  {s.title}
                </h3>
                <p className="text-[var(--text-dim)] text-[15px] leading-relaxed">
                  {s.desc}
                </p>
              </div>
            </TiltCard>
          </RevealCard>
        ))}
      </div>
    </section>
  )
}
