interface SketchLogoProps {
  className?: string
}

export default function SketchLogo({ className = '' }: SketchLogoProps) {
  return (
    <svg
      viewBox="0 0 240 240"
      role="img"
      aria-label="Logo azul estilo boceto"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M38 46 C20 70 14 120 28 164 C42 206 88 224 126 216 C176 206 214 174 214 120 C214 76 196 34 154 24 C112 14 58 18 38 46 Z"
        fill="#2f79ca"
      />
      <path
        d="M58 152 C74 138 74 96 92 90 C104 86 104 132 116 118 C128 104 136 70 142 52 C146 88 150 124 154 160 C166 140 172 116 184 104 C194 116 198 144 208 168 C214 148 216 128 216 106"
        fill="none"
        stroke="#ffffff"
        strokeWidth="7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
