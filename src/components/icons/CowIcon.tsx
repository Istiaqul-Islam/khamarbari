export function CowIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 500 500"
      width="100%"
      height="100%"
      fill="none"
      stroke="currentColor"
      strokeWidth="12"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <g id="cow-head-logo" fill="none" stroke="currentColor" strokeWidth="12" strokeLinecap="round" strokeLinejoin="round">
        <path d="M 160 170 C 130 110, 150 60, 110 50 C 140 80, 170 140, 190 180" />
        <path d="M 340 170 C 370 110, 350 60, 390 50 C 360 80, 330 140, 310 180" />
        <path d="M 175 195 C 100 190, 80 230, 110 250 C 130 240, 160 220, 175 210" />
        <path d="M 325 195 C 400 190, 420 230, 390 250 C 370 240, 340 220, 325 210" />
        <path d="M 190 180 L 310 180" />
        <path d="M 175 210 L 195 310 L 305 310 L 325 210" />
        <path d="M 195 310 C 195 380, 210 410, 250 410 C 290 410, 305 380, 305 310 Z" />
        <circle cx="225" cy="365" r="8" fill="#1a1a1a" />
        <circle cx="275" cy="365" r="8" fill="#1a1a1a" />
        <path d="M 200 240 L 225 245" strokeWidth="10" />
        <path d="M 300 240 L 275 245" strokeWidth="10" />
      </g>
    </svg>
  );
}
