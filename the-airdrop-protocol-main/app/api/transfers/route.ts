import { NextResponse } from 'next/server'

const DEV_WALLET = 'BsS6DYZtjzoCYtM3R4WCTe4pRzUAT4n7LUfVbscVUzBB'
const HELIUS_API_KEY = 'b51f4952-3381-42e9-978d-cd4d23d738ac'

export async function GET() {
  try {
    const res = await fetch(
      `https://api.helius.xyz/v0/addresses/${DEV_WALLET}/transactions?api-key=${HELIUS_API_KEY}&limit=25&type=TRANSFER`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 15 },
      }
    )

    if (!res.ok) {
      const txt = await res.text()
      console.error('[transfers] Helius error', res.status, txt)
      throw new Error(`Helius error: ${res.status}`)
    }

    const txs: HeliusTx[] = await res.json()

    const rawTransfers = txs
      .filter(Boolean)
      .flatMap((tx) => {
        const results: Transfer[] = []

        // Native SOL transfers where dev is sender
        for (const nt of tx.nativeTransfers ?? []) {
          if (nt.fromUserAccount === DEV_WALLET && nt.amount > 5000) {
            results.push({
              id: `${tx.signature}-sol-${results.length}`,
              signature: tx.signature,
              blockTime: tx.timestamp,
              type: 'SOL',
              amount: nt.amount / 1e9,
              from: nt.fromUserAccount,
              to: nt.toUserAccount,
            })
          }
        }

        // SPL token transfers where dev is sender
        for (const tt of tx.tokenTransfers ?? []) {
          if (tt.fromUserAccount === DEV_WALLET && tt.tokenAmount > 0) {
            results.push({
              id: `${tx.signature}-spl-${tt.mint}-${tt.toUserAccount}-${results.length}`,
              signature: tx.signature,
              blockTime: tx.timestamp,
              type: 'SPL',
              mint: tt.mint,
              amount: tt.tokenAmount,
              tokenSymbol: tt.symbol,
              tokenName: tt.tokenName,
              from: tt.fromUserAccount,
              to: tt.toUserAccount,
            })
          }
        }

        return results
      })
      .slice(0, 30)

    const uniqueMints = Array.from(
      new Set(
        rawTransfers
          .filter((t) => t.type === 'SPL' && t.mint)
          .map((t) => t.mint as string)
      )
    )

    const mintMeta = await getMintMetadata(uniqueMints)

    const transfers = rawTransfers.slice(0, 20).map((t) => {
      if (t.type !== 'SPL' || !t.mint) return t
      const meta = mintMeta[t.mint]
      return {
        ...t,
        tokenSymbol: pickTicker(t.tokenSymbol, meta?.symbol, meta?.altSymbol),
        tokenName: t.tokenName || meta?.name,
      }
    })

    return NextResponse.json({ transfers })
  } catch (err) {
    console.error('[transfers]', err)
    return NextResponse.json({ error: 'Failed to fetch transfers', transfers: [] }, { status: 500 })
  }
}

async function getMintMetadata(mints: string[]) {
  if (mints.length === 0) return {} as Record<string, MintMeta>

  try {
    const res = await fetch(`https://api.helius.xyz/v0/token-metadata?api-key=${HELIUS_API_KEY}`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ mintAccounts: mints }),
      next: { revalidate: 120 },
    })

    if (!res.ok) return {} as Record<string, MintMeta>

    const data: MintMetadataResponse[] = await res.json()
    const map: Record<string, MintMeta> = {}
    for (const entry of data) {
      const mint = entry.account
      if (!mint) continue
      const symbol = entry.onChainMetadata?.metadata?.data?.symbol?.trim()
      const altSymbol = entry.offChainMetadata?.symbol?.trim()
      const name = entry.onChainMetadata?.metadata?.data?.name?.trim()
      map[mint] = {
        symbol: symbol || undefined,
        altSymbol: altSymbol || undefined,
        name: name || undefined,
      }
    }
    return map
  } catch {
    return {} as Record<string, MintMeta>
  }
}

function pickTicker(...options: Array<string | undefined>) {
  for (const raw of options) {
    const ticker = raw?.trim()
    if (!ticker) continue
    const upper = ticker.toUpperCase()
    if (upper === 'UNKNOWN' || upper === 'TOKEN') continue
    return upper
  }
  return undefined
}

// ── Types ──────────────────────────────────────────────────────────────────
interface HeliusTx {
  signature: string
  timestamp: number
  nativeTransfers?: {
    fromUserAccount: string
    toUserAccount: string
    amount: number
  }[]
  tokenTransfers?: {
    fromUserAccount: string
    toUserAccount: string
    mint: string
    tokenAmount: number
    tokenStandard?: string
    symbol?: string
    tokenName?: string
  }[]
}

interface MintMetadataResponse {
  account?: string
  offChainMetadata?: {
    symbol?: string
  }
  onChainMetadata?: {
    metadata?: {
      data?: {
        symbol?: string
        name?: string
      }
    }
  }
}

interface MintMeta {
  symbol?: string
  altSymbol?: string
  name?: string
}

export interface Transfer {
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
