'use client'

import { useEffect, useRef, useState } from 'react'

interface CoinMeta {
  ticker: string
  pumpUrl: string
}

function RevealSection({ children }: { children: React.ReactNode }) {
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

const TwitterIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
  </svg>
)

const TelegramIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28" aria-hidden>
    <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0h-.056zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.479.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
  </svg>
)

const PumpFunIcon = () => (
  <svg viewBox="0 0 40 40" fill="none" width="32" height="32" aria-hidden>
    <rect width="40" height="40" rx="10" fill="currentColor" fillOpacity="0.12" />
    <text
      x="50%"
      y="54%"
      dominantBaseline="middle"
      textAnchor="middle"
      fill="currentColor"
      fontSize="20"
      fontWeight="900"
      fontFamily="'Space Grotesk', sans-serif"
    >
      pump
    </text>
  </svg>
)

export default function SocialsFooter() {
  const [coin, setCoin] = useState<CoinMeta>({ ticker: '…', pumpUrl: 'https://pump.fun' })

  useEffect(() => {
    fetch('/api/dev-coins')
      .then((r) => r.json())
      .then((d) => {
        const list = d.coins ?? []
        const first = list[0]
        if (first) {
          setCoin({
            ticker: first.symbol ? `$${first.symbol}` : '$TOKEN',
            pumpUrl: first.mint ? `https://pump.fun/coin/${first.mint}` : 'https://pump.fun',
          })
        }
      })
      .catch(() => {})
  }, [])

  return (
    <>
      {/* Socials */}
      <section id="socials" className="relative z-10 px-10 py-20 text-center">
        <RevealSection>
          <div className="inline-block text-[13px] text-[var(--green)] font-semibold uppercase tracking-[3px] mb-4 border border-[rgba(84,213,146,.2)] px-5 py-1.5 rounded-full">
            Community
          </div>
          <h2
            className="font-display font-extrabold tracking-tight mb-4"
            style={{ fontSize: 'clamp(36px,5vw,64px)', letterSpacing: '-2px' }}
          >
            Join the <span className="text-[var(--green)]">Movement</span>
          </h2>
          <p className="text-[var(--text-dim)] text-base max-w-md mx-auto mb-12 leading-relaxed">
            Follow the journey, get updates, and be part of the community.
          </p>

          <div className="flex gap-5 justify-center flex-wrap">
            {/* TWITTER / X */}
            <a
              href="https://x.com/i/communities/2038882190981812446"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-16 h-16 rounded-2xl border border-[rgba(84,213,146,.15)] bg-[rgba(84,213,146,.05)] flex items-center justify-center text-[var(--green)] hover:-translate-y-1.5 hover:scale-110 hover:border-[var(--green)] hover:shadow-[0_10px_40px_rgba(84,213,146,.2)] hover:bg-[rgba(84,213,146,.15)] transition-all"
              title="X (Twitter)"
            >
              <TwitterIcon />
            </a>

            {/* TELEGRAM (pon tu link real aquí) */}
            <a
              href="https://t.me/"
              target="_blank"
              rel="noopener noreferrer"
              className="group w-16 h-16 rounded-2xl border border-[rgba(84,213,146,.15)] bg-[rgba(84,213,146,.05)] flex items-center justify-center text-[var(--green)] hover:-translate-y-1.5 hover:scale-110 hover:border-[var(--green)] hover:shadow-[0_10px_40px_rgba(84,213,146,.2)] hover:bg-[rgba(84,213,146,.15)] transition-all"
              title="Telegram"
            >
              <TelegramIcon />
            </a>

            {/* PUMPFUN */}
            <a
              href={coin.pumpUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="group w-16 h-16 rounded-2xl border border-[rgba(84,213,146,.15)] bg-[rgba(84,213,146,.05)] flex items-center justify-center text-[var(--green)] hover:-translate-y-1.5 hover:scale-110 hover:border-[var(--green)] hover:shadow-[0_10px_40px_rgba(84,213,146,.2)] hover:bg-[rgba(84,213,146,.15)] transition-all"
              title="Pump.fun"
            >
              <img
                src="https://pump.fun/favicon.ico"
                alt="Pump.fun"
                width={28}
                height={28}
                className="rounded"
                crossOrigin="anonymous"
                onError={(e) => {
                  const target = e.currentTarget as HTMLImageElement
                  target.style.display = 'none'
                  if (target.nextElementSibling) {
                    (target.nextElementSibling as HTMLElement).style.display = 'flex'
                  }
                }}
              />
              <span style={{ display: 'none' }}>
                <PumpFunIcon />
              </span>
            </a>
          </div>
        </RevealSection>
      </section>

      {/* Footer */}
      <footer className="relative z-10 text-center px-10 py-10 border-t border-[rgba(84,213,146,.1)]">
        <div
          className="font-display font-black text-2xl text-[var(--green)] mb-4"
          style={{ textShadow: '0 0 30px rgba(84,213,146,.3)' }}
        >
          {coin.ticker}
        </div>
        <p className="text-[var(--text-dim)] text-sm">
          Live on-chain data powered by Helius &amp; Pump.fun.
        </p>
      </footer>
    </>
  )
}
