export default function MarqueeBanner() {
  const words = ['PUMP', 'AIRDROP', 'HOLD', 'EARN', 'SOLANA', 'REWARDS']

  return (
    <div className="relative z-10 w-full overflow-hidden bg-[var(--green)] border-y-4 border-white py-3 flex items-center shadow-[0_10px_30px_rgba(20,241,149,0.2)] transform -rotate-1 origin-center scale-110">
      <div className="flex whitespace-nowrap animate-marquee">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="flex items-center">
            {words.map((w, j) => (
              <div key={`${i}-${j}`} className="flex items-center">
                <span className="text-black font-display font-black text-2xl uppercase tracking-widest px-8">
                  {w}
                </span>
                <span className="text-white text-xl">✦</span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
