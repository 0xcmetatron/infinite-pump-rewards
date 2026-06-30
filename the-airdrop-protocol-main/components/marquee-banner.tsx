export default function MarqueeBanner() {
  const items = [
    '$AIRDROP', '•', 'HOLD & EARN', '•', '$PUMP REWARDS', '•',
    'EVERY 30 SECONDS', '•', 'DEX AT 20K', '•', 'FULL TRANSPARENCY', '•',
    '$AIRDROP', '•', 'HOLD & EARN', '•', '$PUMP REWARDS', '•',
    'EVERY 30 SECONDS', '•', 'DEX AT 20K', '•', 'FULL TRANSPARENCY', '•',
  ]

  return (
    <div className="relative z-10 overflow-hidden py-5 border-t border-b border-[rgba(47,121,202,.2)] bg-[rgba(255,255,255,.42)] my-10">
      <div className="flex gap-16 animate-marquee whitespace-nowrap">
        {items.map((item, i) => (
          <span
            key={i}
            className="font-display text-xl font-black text-[rgba(47,121,202,.38)] uppercase tracking-widest"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}
