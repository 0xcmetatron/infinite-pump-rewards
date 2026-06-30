import { NextResponse } from 'next/server'

const DEV_WALLET = '7HGcX861NZovFNhi7izC9xtjKmY1kVQpcx7wobZF2tBc'
const HELIUS_API_KEY = 'b51f4952-3381-42e9-978d-cd4d23d738ac'

export async function GET() {
  try {
    // Fetches recent transactions regardless of type, enabling detection of bulk airdrops
    const res = await fetch(
      `https://api.helius.xyz/v0/addresses/${DEV_WALLET}/transactions?api-key=${HELIUS_API_KEY}&limit=50`,
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

    const transfers = txs
      .filter(Boolean)
      .flatMap((tx) => {
        const results: Transfer[] = []

        // SPL token transfers where dev is sender
        for (const tt of tx.tokenTransfers ?? []) {
          // You requested to only show the token payments (not Solana). 
          // This ensures we capture the tokens sent out, especially the airdrops!
          if (tt.fromUserAccount === DEV_WALLET && tt.tokenAmount > 0) {
            results.push({
              id: `${tx.signature}-${tt.toUserAccount}-${tt.mint}`, // Unique ID for React
              signature: tx.signature,
              blockTime: tx.timestamp,
              type: 'SPL',
              mint: tt.mint,
              amount: tt.tokenAmount,
              from: tt.fromUserAccount,
              to: tt.toUserAccount,
            })
          }
        }

        return results
      })
      // Sort by time
      .sort((a, b) => b.blockTime - a.blockTime)
      .slice(0, 100) // Return up to 100 so the search has a good pool

    return NextResponse.json({ transfers })
  } catch (err) {
    console.error('[transfers]', err)
    return NextResponse.json({ error: 'Failed to fetch transfers', transfers: [] }, { status: 500 })
  }
}

// Interfaces
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
  }[]
}

export interface Transfer {
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
