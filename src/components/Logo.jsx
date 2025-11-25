export default function Logo({ className = "h-10 w-10", textClassName = "text-2xl", subtitleClassName = "text-gray-500" }) {
  return (
    <div className="flex items-center space-x-3">
      <div className={`${className} relative`}>
        <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Delivery truck */}
          <g>
            {/* Truck body */}
            <rect x="10" y="35" width="45" height="30" rx="3" fill="#3B82F6" />

            {/* Truck cabin */}
            <path d="M 10 35 L 10 25 Q 10 20 15 20 L 30 20 Q 35 20 35 25 L 35 35 Z" fill="#2563EB" />

            {/* Cargo area */}
            <rect x="55" y="40" width="25" height="25" rx="2" fill="#60A5FA" />

            {/* Package icon on cargo */}
            <rect x="62" y="47" width="11" height="11" rx="1" fill="white" opacity="0.9" />
            <line x1="67.5" y1="47" x2="67.5" y2="58" stroke="#3B82F6" strokeWidth="1.5" />
            <line x1="62" y1="52.5" x2="73" y2="52.5" stroke="#3B82F6" strokeWidth="1.5" />

            {/* Wheels */}
            <circle cx="25" cy="65" r="8" fill="#1E293B" />
            <circle cx="25" cy="65" r="5" fill="#475569" />
            <circle cx="70" cy="65" r="8" fill="#1E293B" />
            <circle cx="70" cy="65" r="5" fill="#475569" />

            {/* Speed lines */}
            <line x1="5" y1="28" x2="12" y2="28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="3" y1="38" x2="10" y2="38" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
            <line x1="2" y1="48" x2="9" y2="48" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

            {/* Location pin */}
            <g transform="translate(75, 15)">
              <path d="M 10 0 C 4.5 0 0 4.5 0 10 C 0 17 10 28 10 28 C 10 28 20 17 20 10 C 20 4.5 15.5 0 10 0 Z" fill="#EF4444" />
              <circle cx="10" cy="10" r="4" fill="white" />
            </g>
          </g>
        </svg>
      </div>
      <div className="flex flex-col">
        <span className={`${textClassName} font-bold leading-none`}>
          Dispatch
        </span>
        <span className={`text-xs ${subtitleClassName} leading-none mt-0.5`}>
          Delivery System
        </span>
      </div>
    </div>
  );
}

export function LogoIcon({ className = "h-10 w-10" }) {
  return (
    <div className={`${className} relative`}>
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Delivery truck */}
        <g>
          {/* Truck body */}
          <rect x="10" y="35" width="45" height="30" rx="3" fill="#3B82F6" />

          {/* Truck cabin */}
          <path d="M 10 35 L 10 25 Q 10 20 15 20 L 30 20 Q 35 20 35 25 L 35 35 Z" fill="#2563EB" />

          {/* Cargo area */}
          <rect x="55" y="40" width="25" height="25" rx="2" fill="#60A5FA" />

          {/* Package icon on cargo */}
          <rect x="62" y="47" width="11" height="11" rx="1" fill="white" opacity="0.9" />
          <line x1="67.5" y1="47" x2="67.5" y2="58" stroke="#3B82F6" strokeWidth="1.5" />
          <line x1="62" y1="52.5" x2="73" y2="52.5" stroke="#3B82F6" strokeWidth="1.5" />

          {/* Wheels */}
          <circle cx="25" cy="65" r="8" fill="#1E293B" />
          <circle cx="25" cy="65" r="5" fill="#475569" />
          <circle cx="70" cy="65" r="8" fill="#1E293B" />
          <circle cx="70" cy="65" r="5" fill="#475569" />

          {/* Speed lines */}
          <line x1="5" y1="28" x2="12" y2="28" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="3" y1="38" x2="10" y2="38" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />
          <line x1="2" y1="48" x2="9" y2="48" stroke="#94A3B8" strokeWidth="2" strokeLinecap="round" />

          {/* Location pin */}
          <g transform="translate(75, 15)">
            <path d="M 10 0 C 4.5 0 0 4.5 0 10 C 0 17 10 28 10 28 C 10 28 20 17 20 10 C 20 4.5 15.5 0 10 0 Z" fill="#EF4444" />
            <circle cx="10" cy="10" r="4" fill="white" />
          </g>
        </g>
      </svg>
    </div>
  );
}
