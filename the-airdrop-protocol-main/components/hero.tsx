'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import SketchLogo from './sketch-logo'

interface Coin {
  mint: string
  name: string
  symbol: string
  image_uri: string
  usd_market_cap: number
  ath_market_cap: number
  complete: boolean
  created_timestamp: number
  reply_count: number
}

export default function Hero() {
  const [copied, setCopied] = useState(false)
  const [coin, setCoin] = useState<Coin | null>(null)
  const [holderCount, setHolderCount] = useState<number | null>(null)

  useEffect(() => {
    fetch('/api/dev-coins')
      .then((r) => r.json())
      .then((d) => {
        const list = d.coins ?? []
        if (list.length > 0) setCoin(list[0])
        if (d.holderCount != null) setHolderCount(d.holderCount)
      })
      .catch(() => {})
  }, [])

  const ca = coin?.mint ?? 'Loading contract address…'
  const pumpUrl = coin ? `https://pump.fun/coin/${coin.mint}` : 'https://pump.fun'

  const copy = () => {
    if (!coin?.mint) return
    navigator.clipboard.writeText(coin.mint).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  const scrollTo = (id: string) =>
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })

  function formatUsd(n: number) {
    if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`
    if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}K`
    return `$${n.toFixed(0)}`
  }

  return (
    <>
      {/* Hero */}
      <section className="min-h-screen flex flex-col items-center justify-center text-center relative z-10 px-5 pt-28 pb-20">
        <div className="inline-flex items-center gap-2 bg-[rgba(47,121,202,.12)] border border-[rgba(47,121,202,.28)] rounded-full px-5 py-2 text-[13px] text-[var(--green)] mb-8 animate-fadeInUp">
          <span className="w-2 h-2 rounded-full bg-[var(--green)] animate-pulse-dot" aria-hidden />
          Live on Pump.fun
        </div>

        <div className="relative w-36 h-36 mx-auto mb-8 animate-fadeInUp delay-100">
          {coin?.image_uri ? (
            <Image
              src={coin.image_uri}
              alt={`${coin.name} token logo`}
              fill
              className="object-cover rounded-full animate-floatToken"
              style={{ boxShadow: '0 0 60px rgba(47,121,202,.35)' }}
              crossOrigin="anonymous"
              unoptimized
            />
          ) : (
            <SketchLogo className="w-36 h-36 animate-floatToken drop-shadow-[0_16px_35px_rgba(47,121,202,.35)]" />
          )}
          <div className="absolute inset-[-6px] rounded-full border-2 border-[rgba(47,121,202,.28)] animate-spinSlow" aria-hidden />
        </div>

        {/* Headline — uses live name/symbol */}
        <h1
          className="font-display font-black leading-none tracking-tight mb-6 animate-fadeInUp delay-100"
          style={{ fontSize: 'clamp(56px,10vw,120px)', letterSpacing: '-3px' }}
        >
          <span
            className="text-[var(--green)]"
            style={{ textShadow: '0 0 60px rgba(47,121,202,.4),0 0 120px rgba(47,121,202,.15)' }}
          >
            {coin ? `$${coin.symbol}` : '$TOKEN'}
          </span>
          <br />
          <span className="text-transparent" style={{ WebkitTextStroke: '2px var(--green)' }}>
            {coin?.name ?? 'LOADING'}
          </span>
        </h1>

        {/* Live stats row */}
        {coin && (
          <div className="flex flex-wrap gap-4 justify-center mb-8 animate-fadeInUp delay-200">
            <div className="bg-[rgba(47,121,202,.08)] border border-[rgba(47,121,202,.2)] rounded-xl px-5 py-2.5 text-center">
              <div className="text-[10px] text-[var(--text-dim)] font-semibold uppercase tracking-widest mb-0.5">Market Cap</div>
              <div className="text-[var(--green)] font-display font-bold text-lg">{formatUsd(coin.usd_market_cap)}</div>
            </div>
            <div className="bg-[rgba(47,121,202,.08)] border border-[rgba(47,121,202,.2)] rounded-xl px-5 py-2.5 text-center">
              <div className="text-[10px] text-[var(--text-dim)] font-semibold uppercase tracking-widest mb-0.5">ATH</div>
              <div className="text-[var(--green)] font-display font-bold text-lg">{formatUsd(coin.ath_market_cap)}</div>
            </div>
            {holderCount != null && (
              <div className="bg-[rgba(47,121,202,.08)] border border-[rgba(47,121,202,.2)] rounded-xl px-5 py-2.5 text-center">
                <div className="text-[10px] text-[var(--text-dim)] font-semibold uppercase tracking-widest mb-0.5">Holders</div>
                <div className="text-[var(--green)] font-display font-bold text-lg">{holderCount.toLocaleString()}</div>
              </div>
            )}
            {coin.complete && (
              <div className="bg-[rgba(47,121,202,.14)] border border-[rgba(47,121,202,.36)] rounded-xl px-5 py-2.5 text-center">
                <div className="text-[10px] text-[var(--green)] font-semibold uppercase tracking-widest mb-0.5">Status</div>
                <div className="text-[var(--green)] font-display font-bold text-lg">Graduated</div>
              </div>
            )}
          </div>
        )}

        <p
          className="text-[var(--text-dim)] max-w-xl leading-relaxed mb-12 animate-fadeInUp delay-200"
          style={{ fontSize: 'clamp(16px,2vw,22px)' }}
        >
          Since Alon isn&apos;t going to do the airdrop, I decided to do it myself. Hold $IPR and receive $PUMP rewards every 30 seconds — automatically.
        </p>

        {/* Buttons */}
        <div className="flex gap-4 flex-wrap justify-center animate-fadeInUp delay-300">
          <a
            href={pumpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-[var(--green)] text-[var(--bg)] px-10 py-4 rounded-full font-display font-bold text-lg hover:-translate-y-1 hover:shadow-[0_10px_40px_rgba(47,121,202,.4)] transition-all"
            style={{ boxShadow: '0 12px 26px rgba(47,121,202,.25)' }}
          >
            Buy on Pump.fun
          </a>
          <button
            onClick={() => scrollTo('live')}
            className="bg-transparent text-[var(--green)] px-10 py-4 rounded-full font-display font-bold text-lg border-2 border-[rgba(47,121,202,.3)] hover:border-[var(--green)] hover:bg-[rgba(47,121,202,.08)] hover:-translate-y-1 transition-all"
          >
            Live Transfers
          </button>
        </div>
      </section>

      {/* Contract address */}
      <div className="relative z-10 px-5 pb-20 flex justify-center animate-fadeInUp delay-400">
        <button
          onClick={copy}
          disabled={!coin?.mint}
          className="group bg-[rgba(47,121,202,.06)] border border-[rgba(47,121,202,.16)] rounded-2xl px-8 py-5 flex items-center gap-4 max-w-2xl w-full hover:border-[var(--green)] hover:shadow-[0_0_40px_rgba(47,121,202,.16)] transition-all overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Copy contract address"
        >
          <div className="text-left flex-1 min-w-0">
            <div className="text-xs text-[var(--text-dim)] font-semibold uppercase tracking-widest mb-1">
              Contract Address
            </div>
            <div className="font-mono text-sm text-[var(--green)] truncate">{ca}</div>
          </div>
          <span className="bg-[var(--green)] text-[var(--bg)] px-5 py-2 rounded-lg font-bold text-sm shrink-0 transition-all">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        </button>
      </div>
    </>
  )
}
