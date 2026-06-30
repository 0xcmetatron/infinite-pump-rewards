'use client'

export default function GlowOrbs() {
  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
      {/* Replaced glow orbs with a simple grid background for brutalist aesthetic */}
      <div 
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `linear-gradient(var(--green) 1px, transparent 1px), linear-gradient(90deg, var(--green) 1px, transparent 1px)`,
          backgroundSize: '40px 40px'
        }}
      />
    </div>
  )
}
