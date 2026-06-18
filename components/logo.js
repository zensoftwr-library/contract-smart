export default function Logo() {
  return (
    <div className="w-[180px] h-[30px] flex items-center">
      <svg viewBox="0 0 240 40" className="w-full h-full">
        <g transform="translate(0, 2)">
          <path d="M24 6 C15 6, 8 13, 8 22 C8 31, 15 38, 24 38 C31 38, 37 33, 39 27" 
                fill="none" stroke="#8ba888" stroke-width="4" stroke-linecap="round"/>
          <path d="M16 21 L21 26 L32 12" 
                fill="none" stroke="#8ba888" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
        </g>
        <text x="48" y="26" fontFamily="system-ui, -apple-system, sans-serif" fontWeight="900" fontSize="20" fill="#FFFFFF" letterSpacing="-0.5">
          Contract<tspan fill="#8ba888">Smart</tspan>
        </text>
      </svg>
    </div>
  );
}