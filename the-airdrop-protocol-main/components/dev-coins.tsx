'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'

interface Coin {
  mint: string
  name: string
  symbol: string
  image_uri: string
  usd_market_cap: number
  ath_market_cap: number
  complete: boolean
  created_timestamp: number
  last_trade_timestamp: number
  reply_count: number
  real_sol_reserves: number
}

function timeAgo(ts: number) {
  const diff = Date.now() - ts
  const m = Math.floor(diff / 60000)
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

function formatUsd(n: number) {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
  return `$${n.toFixed(0)}`
}

function RevealSection({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) el.classList.add('opacity-100', 'translate-y-0') },
      { threshold: 0.05 }
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

export default function DevCoins() {
  const [coins, setCoins] = useState<Coin[]>([])
  const [holderCount, setHolderCount] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch('/api/dev-coins')
      .then((r) => r.json())
      .then((d) => {
        setCoins(d.coins ?? [])
        if (d.holderCount != null) setHolderCount(d.holderCount)
        setLoading(false)
      })
      .catch(() => {
        setError(true)
        setLoading(false)
      })
  }, [])

  const latest = coins[0]

  const stats = latest
    ? [
        { label: 'Market Cap', value: formatUsd(latest.usd_market_cap) },
        { label: 'ATH Market Cap', value: formatUsd(latest.ath_market_cap) },
        ...(holderCount != null ? [{ label: 'Holders', value: holderCount.toLocaleString() }] : []),
        { label: 'Replies', value: String(latest.reply_count) },
        { label: 'SOL Reserves', value: `${(latest.real_sol_reserves / 1e9).toFixed(2)} SOL` },
        { label: 'Last Trade', value: timeAgo(latest.last_trade_timestamp) },
        { label: 'Launched', value: timeAgo(latest.created_timestamp) },
        { label: 'Status', value: latest.complete ? 'Graduated' : 'Live on Pump.fun' },
      ]
    : []

  return (
    <section id="tokens" className="relative z-10 px-5 md:px-10 py-24 text-center">
      <RevealSection>
        <div className="inline-block text-[13px] text-[var(--green)] font-semibold uppercase tracking-[3px] mb-4 border border-[rgba(84,213,146,.2)] px-5 py-1.5 rounded-full">
          Latest Coin
        </div>
        <h2
          className="font-display font-extrabold tracking-tight mb-4"
          style={{ fontSize: 'clamp(36px,5vw,64px)', letterSpacing: '-2px' }}
        >
          Live <span className="text-[var(--green)]">Coin Stats</span>
        </h2>
        <p className="text-[var(--text-dim)] text-base mb-14 max-w-xl mx-auto leading-relaxed">
          Real-time data for the most recent token launched by this dev wallet.
        </p>
      </RevealSection>

      {loading && (
        <div className="flex justify-center items-center gap-3 text-[var(--text-dim)] py-16">
          <div className="w-5 h-5 rounded-full border-2 border-[var(--green)] border-t-transparent animate-spin" />
          Loading coin data…
        </div>
      )}

      {error && (
        <p className="text-[var(--text-dim)] py-16">Failed to load coin data.</p>
      )}

      {!loading && !error && latest && (
        <RevealSection>
          <div className="max-w-3xl mx-auto">
            {/* Coin header */}
            <a
              href={`https://pump.fun/coin/${latest.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-5 bg-[rgba(84,213,146,.05)] border border-[rgba(84,213,146,.2)] rounded-2xl p-6 mb-6 hover:border-[var(--green)] hover:shadow-[0_0_60px_rgba(84,213,146,.12)] transition-all"
            >
              <div className="relative w-20 h-20 shrink-0">
                <Image
                  src={latest.image_uri}
                  alt={`${latest.name} logo`}
                  fill
                  className="object-cover rounded-xl"
                  crossOrigin="anonymous"
                  unoptimized
                />
              </div>
              <div className="text-left flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className="font-display font-black text-2xl text-[var(--text)]">{latest.name}</span>
                  <span className="bg-[rgba(84,213,146,.15)] text-[var(--green)] text-xs font-bold px-2 py-0.5 rounded-full">
                    ${latest.symbol}
                  </span>
                  {latest.complete && (
                    <span className="bg-[rgba(84,213,146,.3)] text-[var(--green)] text-xs font-bold px-2 py-0.5 rounded-full">
                      Graduated
                    </span>
                  )}
                </div>
                <div className="text-[var(--text-dim)] text-xs font-mono truncate mb-1">{latest.mint}</div>
                <div className="text-[var(--green)] text-xs font-semibold group-hover:underline">
                  View on Pump.fun ↗
                </div>
              </div>
            </a>

            {/* Stats grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-[rgba(84,213,146,.04)] border border-[rgba(84,213,146,.1)] rounded-xl px-4 py-4 text-center"
                >
                  <div className="text-[10px] text-[var(--text-dim)] font-semibold uppercase tracking-widest mb-1.5">
                    {s.label}
                  </div>
                  <div className="text-[var(--green)] font-display font-bold text-base">{s.value}</div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      )}
    </section>
  )
}
