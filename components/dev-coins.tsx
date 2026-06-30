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
        { label: 'Status', value: latest.complete ? 'Graduated' : 'Live on Pump' },
      ]
    : []

  return (
    <section id="tokens" className="relative z-10 px-5 md:px-10 py-24 text-center bg-[var(--bg2)] border-y-4 border-[#27272a]">
      <RevealSection>
        <div className="inline-block bg-white text-black font-black uppercase tracking-widest px-6 py-2 mb-8 shadow-[4px_4px_0_0_var(--green)] rotate-1">
          Latest Coin
        </div>
        <h2
          className="font-display font-black tracking-tighter uppercase mb-6 text-white"
          style={{ fontSize: 'clamp(36px,5vw,64px)' }}
        >
          Live <span className="text-[var(--green)]">Coin Stats</span>
        </h2>
        <p className="text-[#a1a1aa] font-bold uppercase text-sm mb-14 max-w-xl mx-auto leading-relaxed border-b-2 border-dashed border-[#27272a] pb-6">
          Real-time data for the most recent token launched by this dev wallet.
        </p>
      </RevealSection>

      {loading && (
        <div className="flex justify-center items-center gap-3 text-[var(--green)] font-bold uppercase py-16">
          <div className="w-6 h-6 rounded-none border-4 border-[var(--green)] border-t-transparent animate-spin" />
          Loading coin data...
        </div>
      )}

      {error && (
        <div className="bg-red-500/10 border-2 border-red-500 text-red-500 font-bold uppercase py-16 max-w-lg mx-auto shadow-[4px_4px_0_0_#ef4444]">
          Failed to load coin data.
        </div>
      )}

      {!loading && !error && latest && (
        <RevealSection>
          <div className="max-w-4xl mx-auto">
            {/* Coin header */}
            <a
              href={`https://pump.fun/coin/${latest.mint}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex flex-col sm:flex-row items-center gap-6 bg-[var(--bg)] border-4 border-[#27272a] p-6 mb-8 hover:border-[var(--green)] hover:shadow-[8px_8px_0_0_var(--green)] hover:-translate-y-1 transition-all"
            >
              <div className="relative w-24 h-24 shrink-0">
                <Image
                  src={latest.image_uri}
                  alt={`${latest.name} logo`}
                  fill
                  className="object-cover border-4 border-white shadow-[4px_4px_0_0_white] group-hover:border-[var(--green)] group-hover:shadow-[4px_4px_0_0_var(--green)] transition-all"
                  crossOrigin="anonymous"
                  unoptimized
                />
              </div>
              <div className="text-center sm:text-left flex-1 min-w-0">
                <div className="flex items-center justify-center sm:justify-start gap-3 flex-wrap mb-2">
                  <span className="font-display font-black text-3xl text-white uppercase tracking-tighter">
                    {latest.name}
                  </span>
                  <span className="bg-[var(--green)] text-black text-sm font-black px-3 py-1 shadow-[2px_2px_0_0_white]">
                    ${latest.symbol}
                  </span>
                  {latest.complete && (
                    <span className="bg-white text-black text-sm font-black px-3 py-1 shadow-[2px_2px_0_0_var(--green)]">
                      Graduated
                    </span>
                  )}
                </div>
                <div className="text-[#a1a1aa] font-bold text-xs font-mono mb-2 px-3 py-1 bg-[#18181b] border-2 border-[#27272a] inline-block">
                  {latest.mint}
                </div>
                <div className="text-[var(--green)] text-sm font-black uppercase tracking-widest mt-2 group-hover:underline">
                  View on Pump.fun ↗
                </div>
              </div>
            </a>

            {/* Stats grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((s) => (
                <div
                  key={s.label}
                  className="bg-[var(--bg)] border-2 border-[#27272a] px-4 py-5 text-center hover:border-white transition-colors"
                >
                  <div className="text-[10px] text-[#a1a1aa] font-black uppercase tracking-widest mb-2 border-b-2 border-dashed border-[#27272a] pb-2">
                    {s.label}
                  </div>
                  <div className="text-[var(--green)] font-display font-black text-xl drop-shadow-[1px_1px_0_#00603A]">
                    {s.value}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </RevealSection>
      )}
    </section>
  )
}
