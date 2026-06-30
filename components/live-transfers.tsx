'use client'

import { useEffect, useRef, useState, useCallback } from 'react'

interface Transfer {
  id: string
  signature: string
  blockTime: number
  type: 'SOL' | 'SPL'
  amount: number
  decimals?: number
  mint?: string
  from: string
  to: string
}

const PAGE_SIZE = 5

function shortAddr(addr: string) {
  if (!addr || addr.length < 12) return addr
  return `${addr.slice(0, 4)}…${addr.slice(-4)}`
}

function timeAgo(blockTime: number) {
  const diff = Math.floor(Date.now() / 1000) - blockTime
  
  if (diff < 60) return 'Just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 2592000) {
    const days = Math.floor(diff / 86400)
    return `${days} day${days !== 1 ? 's' : ''} ago`
  }
  const months = Math.floor(diff / 2592000)
  return `${months} month${months !== 1 ? 's' : ''} ago`
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

function TokenDisplay({ mint, amount, isSol }: { mint?: string; amount: number; isSol: boolean }) {
  const [tokenInfo, setTokenInfo] = useState<{ symbol: string; image?: string } | null>(null)

  useEffect(() => {
    if (isSol || !mint) return
    let mounted = true
    
    // First try Pump.fun API
    fetch(`https://frontend-api.pump.fun/coins/${mint}`)
      .then(res => {
        if (!res.ok) throw new Error('Not found on pump.fun')
        return res.json()
      })
      .then(data => {
        if (!mounted) return
        setTokenInfo({
          symbol: data.symbol,
          image: data.image_uri
        })
      })
      .catch(() => {
        // Fallback to DexScreener if pump.fun fails
        fetch(`https://api.dexscreener.com/latest/dex/tokens/${mint}`)
          .then(res => res.json())
          .then(data => {
            if (!mounted) return
            if (data.pairs && data.pairs.length > 0) {
              const pair = data.pairs[0]
              setTokenInfo({
                symbol: pair.baseToken.symbol,
                image: pair.info?.imageUrl
              })
            }
          })
          .catch(() => {})
      })
      
    return () => { mounted = false }
  }, [mint, isSol])

  if (isSol) {
    return (
      <div className="flex-1 min-w-0 flex items-center gap-4">
        <div className="shrink-0 w-12 h-12 rounded-full overflow-hidden bg-black flex items-center justify-center border-2 border-white shadow-[0_0_15px_rgba(168,85,247,0.3)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png" alt="SOL" className="w-full h-full object-cover" />
        </div>
        <span className="font-display font-black text-white text-lg group-hover:text-[#4ade80] transition-colors">
          {amount.toFixed(4)} SOL
        </span>
      </div>
    )
  }

  return (
    <div className="flex-1 min-w-0 flex items-center gap-4">
      {tokenInfo?.image ? (
        <div className="shrink-0 w-12 h-12 rounded-full border-2 border-[#4ade80] shadow-[0_0_15px_rgba(74,222,128,0.3)] overflow-hidden bg-black flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={tokenInfo.image} alt={tokenInfo.symbol} className="w-full h-full object-cover" />
        </div>
      ) : (
        <div className="shrink-0 w-12 h-12 rounded-full flex items-center justify-center text-2xl shadow-[0_0_15px_rgba(74,222,128,0.3)] bg-gradient-to-br from-[#4ade80] to-[#16a34a] text-white border-2 border-white">
          💊
        </div>
      )}
      <span className="font-display font-black text-white text-lg group-hover:text-[#4ade80] transition-colors flex items-center gap-2 flex-wrap">
        {amount.toLocaleString()} 
        <span className="text-black bg-[#4ade80] px-2 py-0.5 text-sm rounded shadow-[2px_2px_0_0_white]">
          ${tokenInfo?.symbol ?? 'TOKEN'}
        </span>
      </span>
    </div>
  )
}

export default function LiveTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')

  const fetchTransfers = useCallback(async (isRefresh = false) => {
    try {
      const res = await fetch('/api/transfers')
      const data = await res.json()
      const incoming: Transfer[] = data.transfers ?? []

      if (isRefresh) {
        setTransfers((prev) => {
          const prevIds = new Set(prev.map((t) => t.id))
          const fresh = incoming.filter((t) => !prevIds.has(t.id))
          if (fresh.length > 0) {
            setNewIds(new Set(fresh.map((t) => t.id)))
            setTimeout(() => setNewIds(new Set()), 3000)
          }
          return incoming
        })
      } else {
        setTransfers(incoming)
      }
      setLoading(false)
    } catch {
      setError(true)
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchTransfers()
    const id = setInterval(() => fetchTransfers(true), 20000)
    return () => clearInterval(id)
  }, [fetchTransfers])

  const filteredTransfers = search 
    ? transfers.filter(tx => tx.to.toLowerCase().includes(search.toLowerCase()) || tx.from.toLowerCase().includes(search.toLowerCase()))
    : transfers

  const totalPages = Math.max(1, Math.ceil(filteredTransfers.length / PAGE_SIZE))
  const paginated = filteredTransfers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // Reset page when search changes
  useEffect(() => {
    setPage(1)
  }, [search])

  return (
    <section id="live" className="relative z-10 px-5 md:px-10 py-24 bg-[var(--bg)] border-t-4 border-[#27272a]">
      <RevealSection>
        <div className="text-center mb-12">
          <div className="inline-block bg-white text-black font-black uppercase tracking-widest px-6 py-2 mb-8 shadow-[4px_4px_0_0_var(--green)] rotate-1">
            On-Chain Activity
          </div>
          <h2
            className="font-display font-black tracking-tighter uppercase mb-4 text-white"
            style={{ fontSize: 'clamp(36px,5vw,64px)' }}
          >
            Live{' '}
            <span className="text-[var(--green)] drop-shadow-[2px_2px_0_var(--green-dark)]">Transfers</span>
          </h2>
          <p className="text-[#a1a1aa] font-bold uppercase text-sm mb-6 max-w-xl mx-auto leading-relaxed border-b-2 border-dashed border-[#27272a] pb-6">
            Real-time transactions sent from the dev wallet — powered by Helius. Auto-refreshes every 20s.
          </p>

          {/* Search Bar */}
          <div className="max-w-md mx-auto mb-8 relative">
            <input 
              type="text" 
              placeholder="SEARCH WALLET ADDRESS..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[var(--bg2)] border-4 border-[#27272a] text-white font-mono text-sm px-6 py-4 shadow-[6px_6px_0_0_#27272a] focus:outline-none focus:border-[var(--green)] focus:shadow-[6px_6px_0_0_var(--green)] transition-all placeholder:text-[#71717a] uppercase"
            />
            {search && (
              <button 
                onClick={() => setSearch('')}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#71717a] hover:text-white font-black p-2"
              >
                X
              </button>
            )}
          </div>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-4 mt-6 flex-wrap">
            <span className="inline-flex items-center gap-2 bg-red-500 text-white px-4 py-2 text-xs font-black uppercase tracking-widest shadow-[4px_4px_0_0_#7f1d1d]">
              <span className="w-2.5 h-2.5 rounded-full bg-white animate-pulse" aria-hidden />
              LIVE
            </span>
            <button
              onClick={() => { setLoading(true); fetchTransfers(true) }}
              className="text-[#4ade80] font-black uppercase tracking-widest text-xs border-2 border-[#4ade80] bg-[#121212] px-6 py-2 shadow-[4px_4px_0_0_var(--green)] hover:-translate-y-1 hover:shadow-[6px_6px_0_0_var(--green)] hover:bg-[#4ade80] hover:text-black transition-all duration-200"
            >
              Refresh
            </button>
          </div>
        </div>
      </RevealSection>

      <div className="max-w-4xl mx-auto">
        {loading && (
          <div className="flex justify-center items-center gap-3 text-[var(--green)] font-black uppercase py-16">
            <div className="w-6 h-6 rounded-none border-4 border-[var(--green)] border-t-transparent animate-spin" />
            Fetching transactions...
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-[#a1a1aa] py-16">
            <div className="bg-red-500/10 border-2 border-red-500 text-red-500 font-bold uppercase p-6 inline-block shadow-[4px_4px_0_0_#ef4444]">
              Could not load transfer data.
              <button
                onClick={() => { setError(false); setLoading(true); fetchTransfers() }}
                className="block mt-4 text-[#4ade80] border-2 border-[#4ade80] bg-[#121212] px-6 py-2 shadow-[4px_4px_0_0_var(--green)] hover:-translate-y-1 transition-all mx-auto"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {!loading && !error && filteredTransfers.length === 0 && (
          <div className="text-center text-[#a1a1aa] py-16 font-bold uppercase border-4 border-[#27272a] shadow-[8px_8px_0_0_#27272a] bg-[#121212]">
            <p>{search ? 'No recent transfers found for this address.' : 'No outgoing transfers found in recent transactions.'}</p>
          </div>
        )}

        {!loading && !error && filteredTransfers.length > 0 && (
          <>
            <div className="space-y-4">
              {paginated.map((tx) => {
                const isNew = newIds.has(tx.id)
                return (
                  <a
                    key={tx.id}
                    href={`https://solscan.io/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex flex-col sm:flex-row items-center gap-4 bg-[var(--bg2)] border-4 p-5 hover:border-[var(--green)] hover:shadow-[8px_8px_0_0_var(--green)] transition-all duration-200 transform hover:-translate-y-1 ${
                      isNew
                        ? 'border-[#4ade80] animate-slideIn shadow-[4px_4px_0_0_var(--green)]'
                        : 'border-[#27272a] shadow-[4px_4px_0_0_#27272a]'
                    }`}
                  >
                    
                    {/* Token Display (Logo + Ticker) */}
                    <div className="flex-1 w-full flex items-center justify-between gap-4">
                      <TokenDisplay mint={tx.mint} amount={tx.amount} isSol={tx.type === 'SOL'} />

                      {isNew && (
                        <span className="text-[10px] font-black bg-[#4ade80] text-black px-2 py-1 shadow-[2px_2px_0_0_white] uppercase tracking-widest hidden sm:inline-block">
                          NEW
                        </span>
                      )}
                    </div>

                    <div className="w-full sm:w-auto flex flex-col sm:items-end justify-between sm:justify-center border-t-2 sm:border-t-0 sm:border-l-2 border-dashed border-[#27272a] pt-4 sm:pt-0 sm:pl-6">
                      <div className="flex items-center gap-2 text-[10px] text-[#71717a] font-black uppercase tracking-widest mb-2 flex-wrap">
                        <span className="bg-[#18181b] px-2 py-1 border-2 border-[#27272a]">{shortAddr(tx.from)}</span>
                        <span className="text-[var(--green)]">→</span>
                        <span className="bg-[#18181b] px-2 py-1 border-2 border-[#27272a]">{shortAddr(tx.to)}</span>
                      </div>
                      
                      <div className="flex items-center justify-between sm:justify-end w-full gap-4">
                        <div className="text-[#a1a1aa] font-black text-[10px] uppercase tracking-widest bg-[#27272a]/50 px-2 py-1">
                          {timeAgo(tx.blockTime)}
                        </div>
                        <div className="text-[var(--green)] font-black text-[10px] uppercase tracking-widest group-hover:underline">
                          View Tx ↗
                        </div>
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-12">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="w-12 h-12 flex items-center justify-center border-2 border-[#27272a] bg-[#121212] text-[#71717a] font-black hover:border-[var(--green)] hover:text-[var(--green)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0_0_#27272a] hover:shadow-[4px_4px_0_0_var(--green)] hover:-translate-y-1"
                  aria-label="Previous page"
                >
                  ‹
                </button>

                <div className="flex gap-2">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPage(p)}
                      className={`w-12 h-12 flex items-center justify-center border-2 font-black transition-all ${
                        p === page
                          ? 'border-[#4ade80] bg-[#4ade80] text-black shadow-[4px_4px_0_0_white]'
                          : 'border-[#27272a] bg-[#121212] text-[#a1a1aa] hover:border-[#4ade80] hover:text-[#4ade80] shadow-[4px_4px_0_0_#27272a] hover:shadow-[4px_4px_0_0_var(--green)] hover:-translate-y-1'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="w-12 h-12 flex items-center justify-center border-2 border-[#27272a] bg-[#121212] text-[#71717a] font-black hover:border-[var(--green)] hover:text-[var(--green)] disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-[4px_4px_0_0_#27272a] hover:shadow-[4px_4px_0_0_var(--green)] hover:-translate-y-1"
                  aria-label="Next page"
                >
                  ›
                </button>
              </div>
            )}
          </>
        )}

        {/* Dev wallet link */}
        <div className="mt-12 text-center flex flex-col sm:flex-row items-center justify-center gap-6">
          <a
            href="https://solscan.io/account/7HGcX861NZovFNhi7izC9xtjKmY1kVQpcx7wobZF2tBc"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-white font-black uppercase tracking-widest bg-[var(--bg2)] border-2 border-white px-8 py-4 shadow-[4px_4px_0_0_white] hover:shadow-[6px_6px_0_0_var(--green)] hover:border-[var(--green)] hover:text-[var(--green)] hover:-translate-y-1 transition-all"
          >
            View Dev Wallet ↗
          </a>
        </div>
      </div>
    </section>
  )
}
