'use client'

import { useEffect, useRef } from 'react'

function RevealCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            el.classList.add('opacity-100', 'translate-y-0')
          }, delay)
        }
      },
      { threshold: 0.1 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [delay])

  return (
    <div ref={ref} className="opacity-0 translate-y-10 transition-all duration-500 ease-out">
      {children}
    </div>
  )
}

export default function Tokenomics() {
  return (
    <section className="relative z-10 px-6 md:px-10 py-24 text-center bg-[var(--bg)]">
      <div className="max-w-5xl mx-auto">
        <RevealCard>
          <div className="inline-block bg-[var(--green)] text-black font-black uppercase tracking-widest px-6 py-2 mb-8 shadow-[4px_4px_0_0_white] rotate-1">
            Tokenomics
          </div>
          <h2
            className="font-display font-black tracking-tighter uppercase mb-16 text-white"
            style={{ fontSize: 'clamp(36px,5vw,64px)' }}
          >
            Fair <span className="text-[var(--green)] drop-shadow-[2px_2px_0_var(--green-dark)]">Distribution</span>
          </h2>
        </RevealCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { title: 'Total Supply', value: '1,000,000,000' },
            { title: 'Tax', value: '0%' },
            { title: 'Liquidity', value: 'Burned' },
            { title: 'Contract', value: 'Renounced' },
          ].map((stat, i) => (
            <RevealCard key={stat.title} delay={i * 100}>
              <div className="bg-[var(--bg2)] border-4 border-[#27272a] p-6 shadow-[6px_6px_0_0_#27272a] hover:border-[var(--green)] hover:shadow-[6px_6px_0_0_var(--green)] hover:-translate-y-2 transition-all duration-200">
                <div className="text-[#a1a1aa] font-black uppercase tracking-widest text-xs mb-2">
                  {stat.title}
                </div>
                <div className="font-display font-black text-2xl text-[var(--green)]">
                  {stat.value}
                </div>
              </div>
            </RevealCard>
          ))}
        </div>
      </div>
    </section>
  )
}
