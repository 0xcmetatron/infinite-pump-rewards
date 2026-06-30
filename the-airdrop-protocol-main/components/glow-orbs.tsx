export default function GlowOrbs() {
  return (
    <>
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          background: 'radial-gradient(circle at 50% 30%, #f7f9fc 0%, #eef2f7 65%, #e6edf8 100%)',
        }}
        aria-hidden
      />
      <div
        className="fixed inset-0 pointer-events-none z-0 animate-float1"
        style={{
          background:
            'radial-gradient(circle at 50% 24%, rgba(47,121,202,.08) 0%, rgba(47,121,202,.03) 36%, rgba(47,121,202,0) 60%)',
        }}
        aria-hidden
      />
    </>
  )
}
