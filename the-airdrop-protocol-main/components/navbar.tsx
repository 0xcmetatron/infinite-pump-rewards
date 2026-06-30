'use client'

import { useEffect, useState } from 'react'
import SketchLogo from './sketch-logo'

interface CoinMeta {
  ticker: string
  pumpUrl: string
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [coin, setCoin] = useState<CoinMeta>({ ticker: '…', pumpUrl: 'https://pump.fun' })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-10 transition-all duration-300 ${
        scrolled
          ? 'py-2.5 bg-[rgba(244,247,252,0.94)] border-b border-[rgba(47,121,202,0.22)]'
          : 'py-4 bg-[rgba(244,247,252,0.82)] border-b border-[rgba(47,121,202,0.16)]'
      } backdrop-blur-xl`}
    >
      <div className="flex items-center gap-3">
        <SketchLogo className="h-11 w-11 drop-shadow-[0_8px_18px_rgba(47,121,202,0.25)]" />
        <div className="font-display font-black text-[28px] text-[var(--green)] tracking-tight">{coin.ticker}</div>
      </div>
      <div className="hidden md:flex items-center gap-8">
        {['how', 'tokens', 'live', 'socials'].map((id) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="text-[var(--text-dim)] text-sm font-medium capitalize hover:text-[var(--green)] transition-colors hover:[text-shadow:0_0_20px_rgba(47,121,202,.5)]"
          >
            {id === 'how'
              ? 'How It Works'
              : id === 'tokens'
              ? 'Coin Stats'
              : id === 'live'
              ? 'Transfers'
              : 'Community'}
          </button>
        ))}
        <a
          href={coin.pumpUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[var(--green)] text-[var(--bg)] px-6 py-2.5 rounded-full font-display font-bold text-sm hover:shadow-[0_0_30px_rgba(47,121,202,.45)] hover:scale-105 transition-all"
        >
          Buy Now
        </a>
      </div>
    </nav>
  )
}
