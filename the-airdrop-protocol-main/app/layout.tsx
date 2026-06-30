import type { Metadata } from 'next'
import type { Viewport } from 'next'
import { Space_Grotesk, Outfit } from 'next/font/google'
import './globals.css'

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-space-grotesk',
})

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
})

// Fetches coin data at build/request time for dynamic metadata
async function getCoinMeta() {
  try {
    const DEV_WALLET = 'BsS6DYZtjzoCYtM3R4WCTe4pRzUAT4n7LUfVbscVUzBB'
    const res = await fetch(
      `https://frontend-api-v3.pump.fun/coins-v2/user-created-coins/${DEV_WALLET}?limit=1&offset=0`,
      {
        headers: { Accept: 'application/json' },
        next: { revalidate: 300 }, // refresh every 5 minutes
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    const coins = data.coins ?? data ?? []
    const first = Array.isArray(coins) ? coins[0] : null
    if (!first) return null
    return {
      symbol: first.symbol as string | undefined,
      name: first.name as string | undefined,
      image: first.image_uri as string | undefined,
      mint: first.mint as string | undefined,
      description: first.description as string | undefined,
    }
  } catch {
    return null
  }
}

export async function generateMetadata(): Promise<Metadata> {
  const coin = await getCoinMeta()

  const ticker = coin?.symbol ? `$${coin.symbol}` : '$TOKEN'
  const name = coin?.name ?? ticker
  const description =
    coin?.description
      ? coin.description.slice(0, 160)
      : `Track ${ticker} on-chain — live dev wallet transfers powered by Helius & Pump.fun.`
  const title = `${ticker} — ${name} Dev Tracker`
  const image = coin?.image ?? undefined

  return {
    title,
    description,
    icons: image
      ? [{ rel: 'icon', url: image }, { rel: 'apple-touch-icon', url: image }]
      : undefined,
    openGraph: {
      title,
      description,
      type: 'website',
      ...(image ? { images: [{ url: image }] } : {}),
    },
    twitter: {
      card: 'summary',
      title,
      description,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export const viewport: Viewport = {
  themeColor: '#eef2f7',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${outfit.variable} bg-[var(--bg)]`}
    >
      <body className="font-sans antialiased bg-[var(--bg)] text-[var(--text)] overflow-x-hidden">
        {children}
      </body>
    </html>
  )
}
