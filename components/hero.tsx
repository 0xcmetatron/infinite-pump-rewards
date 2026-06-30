'use client'

import { useEffect, useState } from 'react'
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

  const ca = coin?.mint ?? 'Loading contract address...'
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
      <section className="min-h-screen flex flex-col items-center justify-center text-center relative z-10 px-5 pt-32 pb-20 bg-[var(--bg)]">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[var(--bg2)] border-2 border-[var(--green)] rounded-none px-4 py-1.5 text-xs text-[var(--green)] font-bold uppercase mb-10 shadow-[2px_2px_0_0_var(--green)] animate-fadeInUp">
          <span className="w-2.5 h-2.5 bg-[var(--green)] animate-pulse-dot" aria-hidden />
          Live on Pump.fun
        </div>

        {/* Token logo */}
        <div className="relative w-36 h-36 mx-auto mb-8 animate-fadeInUp delay-100">
          {coin?.image_uri ? (
            <Image
              src={coin.image_uri}
              alt={`${coin.name} token logo`}
              fill
              className="object-cover rounded-xl border-4 border-[var(--green)] animate-floatToken shadow-[8px_8px_0_0_var(--green)]"
              crossOrigin="anonymous"
              unoptimized
            />
          ) : (
            <div
              className="w-36 h-36 rounded-xl bg-[var(--bg2)] border-4 border-[var(--green)] flex items-center justify-center text-6xl font-black font-display text-[var(--green)] animate-floatToken shadow-[8px_8px_0_0_var(--green)]"
            >
              ?
            </div>
          )}
        </div>

        {/* Headline */}
        <h1
          className="font-display font-black leading-none uppercase mb-6 animate-fadeInUp delay-100 text-[var(--text)] drop-shadow-[4px_4px_0_var(--green-dark)]"
          style={{ fontSize: 'clamp(48px, 8vw, 100px)' }}
        >
          <span className="text-[var(--green)] block mb-2">
            {coin ? `$${coin.symbol}` : 'LOADING'}
          </span>
          <span className="text-white text-4xl sm:text-5xl md:text-6xl tracking-tighter">
            {coin?.name ?? '...'}
          </span>
        </h1>

        {/* Live stats row */}
        {coin && (
          <div className="flex flex-wrap gap-4 justify-center mb-10 animate-fadeInUp delay-200">
            <div className="bg-[var(--bg2)] border-2 border-[var(--green)] px-6 py-3 shadow-[4px_4px_0_0_var(--green)] transform hover:-translate-y-1 transition-transform">
              <div className="text-[11px] text-white font-black uppercase tracking-widest mb-1">Market Cap</div>
              <div className="text-[var(--green)] font-display font-black text-xl">{formatUsd(coin.usd_market_cap)}</div>
            </div>
            <div className="bg-[var(--bg2)] border-2 border-[var(--green)] px-6 py-3 shadow-[4px_4px_0_0_var(--green)] transform hover:-translate-y-1 transition-transform">
              <div className="text-[11px] text-white font-black uppercase tracking-widest mb-1">ATH</div>
              <div className="text-[var(--green)] font-display font-black text-xl">{formatUsd(coin.ath_market_cap)}</div>
            </div>
            {holderCount != null && (
              <div className="bg-[var(--bg2)] border-2 border-[var(--green)] px-6 py-3 shadow-[4px_4px_0_0_var(--green)] transform hover:-translate-y-1 transition-transform">
                <div className="text-[11px] text-white font-black uppercase tracking-widest mb-1">Holders</div>
                <div className="text-[var(--green)] font-display font-black text-xl">{holderCount.toLocaleString()}</div>
              </div>
            )}
            {coin.complete && (
              <div className="bg-[var(--green)] border-2 border-white px-6 py-3 shadow-[4px_4px_0_0_white] transform hover:-translate-y-1 transition-transform">
                <div className="text-[11px] text-black font-black uppercase tracking-widest mb-1">Status</div>
                <div className="text-black font-display font-black text-xl">Graduated</div>
              </div>
            )}
          </div>
        )}

        <p
          className="text-white font-bold max-w-2xl leading-relaxed mb-12 animate-fadeInUp delay-200 uppercase bg-[var(--bg2)] border-2 border-[#27272a] p-4 shadow-[4px_4px_0_0_#27272a]"
          style={{ fontSize: 'clamp(14px, 1.5vw, 18px)' }}
        >
          Since Alon isn&apos;t going to do the airdrop, I decided to do it myself. 
          <br/><span className="text-[var(--green)]">Hold $IPR and receive $PUMP rewards every 30 seconds — automatically.</span>
        </p>

        {/* Buttons */}
        <div className="flex gap-6 flex-wrap justify-center animate-fadeInUp delay-300">
          <a
            href={pumpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-brutalist px-10 py-4 text-xl"
          >
            Buy on Pump.fun
          </a>
          <button
            onClick={() => scrollTo('live')}
            className="bg-transparent text-white px-10 py-4 font-display font-black text-xl border-2 border-white uppercase tracking-widest shadow-[4px_4px_0_0_white] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_white] hover:bg-white hover:text-black transition-all"
          >
            Live Transfers
          </button>
        </div>
      </section>

      {/* Contract address */}
      <div className="relative z-10 px-5 pb-24 flex justify-center animate-fadeInUp delay-400 bg-[var(--bg)]">
        <button
          onClick={copy}
          disabled={!coin?.mint}
          className="group bg-[var(--bg2)] border-2 border-[var(--green)] p-1 flex flex-col sm:flex-row items-center gap-0 max-w-3xl w-full shadow-[6px_6px_0_0_var(--green)] hover:translate-y-1 hover:shadow-[2px_2px_0_0_var(--green)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Copy contract address"
        >
          <div className="text-left flex-1 min-w-0 px-6 py-4 w-full">
            <div className="text-[10px] text-white font-black uppercase tracking-widest mb-2">
              Contract Address
            </div>
            <div className="font-mono text-sm sm:text-base text-[var(--green)] truncate">{ca}</div>
          </div>
          <div className="bg-[var(--green)] text-black px-8 py-4 sm:py-6 font-black uppercase tracking-widest text-sm shrink-0 w-full sm:w-auto border-t-2 sm:border-t-0 sm:border-l-2 border-[var(--green)] sm:border-[var(--bg2)]">
            {copied ? 'Copied!' : 'Copy CA'}
          </div>
        </button>
      </div>
    </>
  )
}
