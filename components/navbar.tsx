'use client'

import { useEffect, useState } from 'react'

interface CoinMeta {
  ticker: string
  pumpUrl: string
}

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [coin, setCoin] = useState<CoinMeta>({ ticker: '[PUMP.FUN]', pumpUrl: 'https://pump.fun' })

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
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
            ticker: first.symbol ? `$${first.symbol}` : '[TOKEN]',
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
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 md:px-10 transition-all duration-200 ${
        scrolled
          ? 'py-3 bg-[var(--bg)] border-b-2 border-[var(--green)]'
          : 'py-5 bg-transparent'
      }`}
    >
      <div
        className="font-display font-black text-2xl md:text-[28px] text-[var(--green)] tracking-tighter uppercase"
      >
        {coin.ticker}
      </div>
      <div className="hidden md:flex items-center gap-6">
        {['how', 'tokens', 'live', 'socials'].map((id) => (
          <button
            key={id}
            onClick={() => scrollTo(id)}
            className="text-[var(--text)] font-bold uppercase tracking-wider text-xs md:text-sm hover:text-[var(--green)] transition-colors"
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
          className="btn-brutalist px-6 py-2 rounded-md text-sm"
        >
          Buy Now
        </a>
      </div>
    </nav>
  )
}
