'use client'

import { useEffect, useState } from 'react'

export default function SocialsFooter() {
  const [coinName, setCoinName] = useState('The Airdrop Protocol')

  useEffect(() => {
    fetch('/api/dev-coins')
      .then((r) => r.json())
      .then((d) => {
        const list = d.coins ?? []
        const first = list[0]
        if (first && first.name) {
          setCoinName(`$${first.symbol} - ${first.name}`)
        }
      })
      .catch(() => {})
  }, [])

  return (
    <footer id="socials" className="relative z-10 px-6 md:px-10 py-16 bg-[var(--bg2)] border-t-4 border-[var(--green)] text-center">
      <div className="max-w-4xl mx-auto flex flex-col items-center">
        <h2 className="font-display font-black text-4xl text-white uppercase tracking-tighter mb-8">
          Join the <span className="text-[var(--green)]">Community</span>
        </h2>
        
        <div className="flex gap-6 mb-12 flex-wrap justify-center">
          <a
            href="https://x.com/i/communities/2024720322407072216"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border-4 border-white text-white font-black uppercase tracking-widest px-8 py-3 shadow-[4px_4px_0_0_white] hover:bg-white hover:text-black hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--green)] transition-all"
          >
            Twitter / X
          </a>
          <a
            href="https://t.me"
            target="_blank"
            rel="noopener noreferrer"
            className="bg-transparent border-4 border-[var(--green)] text-[var(--green)] font-black uppercase tracking-widest px-8 py-3 shadow-[4px_4px_0_0_var(--green)] hover:bg-[var(--green)] hover:text-black hover:-translate-y-1 hover:shadow-[6px_6px_0_0_white] transition-all"
          >
            Telegram
          </a>
        </div>

        <div className="text-[#a1a1aa] font-bold text-xs uppercase tracking-widest border-t-2 border-dashed border-[#27272a] pt-8 w-full">
          © {new Date().getFullYear()} {coinName}. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
