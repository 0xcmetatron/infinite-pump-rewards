import GlowOrbs from '@/components/glow-orbs'
import ParticlesCanvas from '@/components/particles-canvas'
import Navbar from '@/components/navbar'
import Hero from '@/components/hero'
import MarqueeBanner from '@/components/marquee-banner'
import HowItWorks from '@/components/how-it-works'
import DevCoins from '@/components/dev-coins'
import LiveTransfers from '@/components/live-transfers'
import Tokenomics from '@/components/tokenomics'
import SocialsFooter from '@/components/socials-footer'

export default function Page() {
  return (
    <main>
      {/* Background layers */}
      <GlowOrbs />
      <ParticlesCanvas />

      {/* Navigation */}
      <Navbar />

      {/* Hero + CA */}
      <Hero />

      {/* Marquee ticker */}
      <MarqueeBanner />

      {/* How it works */}
      <HowItWorks />

      {/* Dev coins from Pump.fun API */}
      <DevCoins />

      {/* Live transfers from Helius */}
      <LiveTransfers />

      {/* Tokenomics stats */}
      <Tokenomics />

      {/* Socials + Footer */}
      <SocialsFooter />
    </main>
  )
}
