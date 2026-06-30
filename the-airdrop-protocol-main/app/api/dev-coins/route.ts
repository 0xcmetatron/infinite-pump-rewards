import { NextResponse } from 'next/server'

const DEV_WALLET = 'BsS6DYZtjzoCYtM3R4WCTe4pRzUAT4n7LUfVbscVUzBB'
const HELIUS_API_KEY = 'b51f4952-3381-42e9-978d-cd4d23d738ac'

export async function GET() {
  try {
    // 1. Fetch coins created by dev wallet
    const coinsRes = await fetch(
      `https://frontend-api-v3.pump.fun/coins-v2/user-created-coins/${DEV_WALLET}?limit=10&offset=0`,
      {
        headers: { 'Accept': 'application/json' },
        next: { revalidate: 60 },
      }
    )
    if (!coinsRes.ok) throw new Error(`Pump.fun API error: ${coinsRes.status}`)
    const coinsData = await coinsRes.json()
    const coins = coinsData.coins ?? coinsData ?? []
    const latest = Array.isArray(coins) ? coins[0] : null

    // 2. If we have a mint, fetch holder count from Helius
    let holderCount: number | null = null
    if (latest?.mint) {
      try {
        const holdersRes = await fetch(
          `https://mainnet.helius-rpc.com/?api-key=${HELIUS_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              jsonrpc: '2.0',
              id: 'holders',
              method: 'getTokenAccounts',
              params: {
                mint: latest.mint,
                page: 1,
                limit: 1,
                displayOptions: {},
              },
            }),
            next: { revalidate: 60 },
          }
        )
        if (holdersRes.ok) {
          const hData = await holdersRes.json()
          holderCount = hData?.result?.total ?? null
        }
      } catch {
        // non-fatal
      }
    }

    return NextResponse.json({ coins, holderCount })
  } catch (err) {
    console.error('[dev-coins]', err)
    return NextResponse.json({ error: 'Failed to fetch dev coins', coins: [], holderCount: null }, { status: 500 })
  }
}
