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
    <div ref={ref} onMouseMove={onMove} onMouseLeave={onLeave} className="transition-transform duration-200 ease-out">
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
    <div ref={ref} className="opacity-0 translate-y-10 transition-all duration-500 ease-out">
      {children}
    </div>
  )
}

export default function HowItWorks() {
  return (
    <section id="how" className="relative z-10 px-6 md:px-10 py-24 text-center bg-[var(--bg)] border-t-4 border-[var(--green)]">
      <RevealCard>
        <div className="inline-block bg-[var(--green)] text-black font-black uppercase tracking-widest px-6 py-2 mb-8 shadow-[4px_4px_0_0_white] transform -rotate-2">
          How It Works
        </div>
        <h2
          className="font-display font-black tracking-tighter uppercase mb-16 text-white"
          style={{ fontSize: 'clamp(36px,5vw,64px)' }}
        >
          Simple. Transparent.{' '}
          <span className="text-[var(--green)] drop-shadow-[2px_2px_0_var(--green-dark)]">Automatic.</span>
        </h2>
      </RevealCard>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {steps.map((s) => (
          <RevealCard key={s.num}>
            <TiltCard>
              <div className="group bg-[var(--bg2)] border-4 border-[var(--green)] p-8 text-left shadow-[8px_8px_0_0_var(--green)] hover:shadow-[12px_12px_0_0_var(--green)] hover:-translate-y-2 transition-all duration-200 relative overflow-hidden h-full flex flex-col">
                <div className="font-display text-6xl font-black text-[var(--green)] mb-6 drop-shadow-[2px_2px_0_white]">
                  {s.num}
                </div>
                <h3 className="font-display text-2xl font-black uppercase tracking-wide mb-4 text-white">
                  {s.title}
                </h3>
                <p className="text-[var(--text-dim)] font-bold text-sm leading-relaxed uppercase">
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
