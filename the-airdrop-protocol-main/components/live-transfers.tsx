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
  tokenSymbol?: string
  tokenName?: string
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
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`
  return new Date(blockTime * 1000).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function exactTime(blockTime: number) {
  return new Date(blockTime * 1000).toLocaleString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function transferLabel(tx: Transfer) {
  if (tx.type === 'SOL') return `${tx.amount.toFixed(4)} SOL`
  const ticker = tx.tokenSymbol?.trim()?.toUpperCase() || 'TOKEN'
  return `${tx.amount.toLocaleString()} ${ticker || 'TOKEN'}`
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

export default function LiveTransfers() {
  const [transfers, setTransfers] = useState<Transfer[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [newIds, setNewIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

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
        // On refresh, go back to page 1 to show newest
        setPage(1)
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

  const totalPages = Math.max(1, Math.ceil(transfers.length / PAGE_SIZE))
  const paginated = transfers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  return (
    <section id="live" className="relative z-10 px-5 md:px-10 py-24">
      <RevealSection>
        <div className="text-center mb-12">
          <div className="inline-block text-[13px] text-[var(--green)] font-semibold uppercase tracking-[3px] mb-4 border border-[rgba(47,121,202,.25)] px-5 py-1.5 rounded-full bg-[rgba(47,121,202,.08)]">
            On-Chain Activity
          </div>
          <h2
            className="font-display font-extrabold tracking-tight mb-4"
            style={{ fontSize: 'clamp(36px,5vw,64px)', letterSpacing: '-2px' }}
          >
            Live{' '}
            <span className="text-[var(--green)]">Transfers</span>
          </h2>
          <p className="text-[var(--text-dim)] text-base max-w-xl mx-auto leading-relaxed">
            Real-time transactions sent from the dev wallet — powered by Helius. Auto-refreshes every 20s.
          </p>

          {/* Live indicator */}
          <div className="flex items-center justify-center gap-2 mt-4 flex-wrap">
            <span className="inline-flex items-center gap-2 bg-[rgba(47,121,202,.14)] border border-[rgba(47,121,202,.3)] rounded-full px-4 py-1.5 text-xs text-[var(--green)] font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-pulse-red" aria-hidden />
              LIVE
            </span>
            <button
              onClick={() => { setLoading(true); fetchTransfers(true) }}
                className="text-[var(--green)] text-xs border border-[rgba(47,121,202,.25)] px-3 py-1 rounded-full hover:border-[var(--green)] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </RevealSection>

      <div className="max-w-4xl mx-auto">
        {loading && (
          <div className="flex justify-center items-center gap-3 text-[var(--text-dim)] py-16">
            <div className="w-5 h-5 rounded-full border-2 border-[var(--green)] border-t-transparent animate-spin" />
            Fetching transactions…
          </div>
        )}

        {error && !loading && (
          <div className="text-center text-[var(--text-dim)] py-16">
            <p>Could not load transfer data.</p>
            <button
              onClick={() => { setError(false); setLoading(true); fetchTransfers() }}
                className="mt-4 text-[var(--green)] border border-[rgba(47,121,202,.25)] px-5 py-2 rounded-full hover:border-[var(--green)] transition-colors"
            >
              Retry
            </button>
          </div>
        )}

        {!loading && !error && transfers.length === 0 && (
          <div className="text-center text-[var(--text-dim)] py-16">
            <p>No outgoing transfers found in recent transactions.</p>
          </div>
        )}

        {!loading && !error && transfers.length > 0 && (
          <>
            <div className="space-y-2">
              {paginated.map((tx) => {
                const isNew = newIds.has(tx.id)
                return (
                  <a
                    key={tx.id}
                    href={`https://solscan.io/tx/${tx.signature}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`group flex items-center gap-4 bg-[rgba(255,255,255,.62)] border rounded-xl px-5 py-4 hover:border-[var(--green)] hover:bg-[rgba(255,255,255,.9)] hover:shadow-[0_14px_30px_rgba(47,121,202,.12)] transition-all ${
                      isNew
                        ? 'border-[var(--green)] animate-slideIn'
                        : 'border-[rgba(47,121,202,.14)]'
                    }`}
                  >
                    {/* Type badge */}
                    {(() => {
                      const badgeText = tx.type === 'SOL'
                        ? 'SOL'
                        : (tx.tokenSymbol && tx.tokenSymbol.length <= 6 ? tx.tokenSymbol.toUpperCase() : 'SPL')

                      return (
                    <div
                      className={`shrink-0 w-12 h-12 rounded-xl flex items-center justify-center text-xs font-black font-display uppercase ${
                        tx.type === 'SOL'
                          ? 'bg-[rgba(47,121,202,.16)] text-[var(--green)]'
                          : 'bg-[rgba(47,121,202,.12)] text-[var(--green-dark)]'
                      }`}
                    >
                      {badgeText}
                    </div>
                      )
                    })()}

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="font-display font-bold text-[var(--green)] text-lg">
                          {transferLabel(tx)}
                        </span>
                        {isNew && (
                          <span className="text-[10px] font-bold bg-[var(--green)] text-[var(--bg)] px-1.5 py-0.5 rounded">
                            NEW
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 text-xs text-[var(--text-dim)] mt-0.5 flex-wrap">
                        <span className="font-mono">{shortAddr(tx.from)}</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                          <path d="M2 6h8M7 3l3 3-3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        <span className="font-mono">{shortAddr(tx.to)}</span>
                        {tx.mint && tx.type === 'SPL' && (
                          <span className="text-[rgba(47,121,202,.7)]">
                            • {tx.tokenName || tx.tokenSymbol?.toUpperCase() || shortAddr(tx.mint)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Time */}
                    <div className="text-right shrink-0">
                      <div className="text-[var(--text-dim)] text-xs">
                        {timeAgo(tx.blockTime)}
                      </div>
                      <div className="text-[var(--text-dim)] text-[10px] mt-1">
                        {exactTime(tx.blockTime)}
                      </div>
                      <div className="text-[rgba(47,121,202,.5)] text-[10px] mt-1 group-hover:text-[var(--green)] transition-colors">
                        View ↗
                      </div>
                    </div>
                  </a>
                )
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                   className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(47,121,202,.2)] text-[var(--text-dim)] text-sm hover:border-[var(--green)] hover:text-[var(--green)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Previous page"
                >
                  ‹
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      p === page
                        ? 'border-[var(--green)] bg-[rgba(47,121,202,.14)] text-[var(--green)]'
                        : 'border-[rgba(47,121,202,.2)] text-[var(--text-dim)] hover:border-[var(--green)] hover:text-[var(--green)]'
                    }`}
                  >
                    {p}
                  </button>
                ))}

                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                   className="w-8 h-8 flex items-center justify-center rounded-lg border border-[rgba(47,121,202,.2)] text-[var(--text-dim)] text-sm hover:border-[var(--green)] hover:text-[var(--green)] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  aria-label="Next page"
                >
                  ›
                </button>

                <span className="text-[var(--text-dim)] text-xs ml-2">
                  {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, transfers.length)} of {transfers.length}
                </span>
              </div>
            )}
          </>
        )}

        {/* Dev wallet link */}
        <div className="mt-6 text-center">
          <a
            href="https://solscan.io/account/8iYinLhoXfsjLAheHPmVFBM9zAjs7nqfy5JxnhaXvztp"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--text-dim)] text-sm hover:text-[var(--green)] transition-colors"
          >
            View all activity for dev wallet ↗
          </a>
        </div>
      </div>
    </section>
  )
}
