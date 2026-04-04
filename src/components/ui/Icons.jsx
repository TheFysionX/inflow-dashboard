function IconBase({ children, className = '', size = 20, strokeWidth = 1.8 }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={strokeWidth}
      >
        {children}
      </g>
    </svg>
  )
}

export function NavIcon({ name, className = '', size = 18 }) {
  const icons = {
    overview: (
      <>
        <rect height="7" rx="2" width="7" x="3" y="3" />
        <rect height="7" rx="2" width="11" x="10" y="3" />
        <rect height="10" rx="2" width="7" x="3" y="10" />
        <rect height="10" rx="2" width="11" x="10" y="10" />
      </>
    ),
    pipeline: (
      <>
        <path d="M4 7h8" />
        <path d="M4 12h12" />
        <path d="M4 17h16" />
        <circle cx="15" cy="7" r="2" />
        <circle cx="19" cy="12" r="2" />
        <circle cx="9" cy="17" r="2" />
      </>
    ),
    leads: (
      <>
        <circle cx="9" cy="8" r="3" />
        <path d="M4 19c.8-2.7 3.1-4 5-4s4.2 1.3 5 4" />
        <path d="M16 7h4" />
        <path d="M16 12h4" />
        <path d="M16 17h4" />
      </>
    ),
    conversations: (
      <>
        <path d="M5 7.5A3.5 3.5 0 0 1 8.5 4h7A3.5 3.5 0 0 1 19 7.5v4A3.5 3.5 0 0 1 15.5 15H11l-4 4v-4.1A3.5 3.5 0 0 1 5 11.5z" />
        <path d="M9 8h6" />
        <path d="M9 11h4" />
      </>
    ),
    objections: (
      <>
        <path d="M12 4 4.8 7.5V12c0 4.8 3.1 7.8 7.2 8.9C16 19.8 19.2 16.8 19.2 12V7.5z" />
        <path d="M12 8v4" />
        <circle cx="12" cy="15.5" r=".6" fill="currentColor" stroke="none" />
      </>
    ),
    bookings: (
      <>
        <rect height="14" rx="3" width="16" x="4" y="6" />
        <path d="M8 3v6" />
        <path d="M16 3v6" />
        <path d="M4 10h16" />
        <path d="M9 14h2" />
        <path d="M13 14h2" />
      </>
    ),
    performance: (
      <>
        <path d="M5 18h14" />
        <path d="M7 18V9" />
        <path d="M12 18V6" />
        <path d="M17 18v-4" />
      </>
    ),
    loaderLab: (
      <>
        <path d="M12 3 20 8v8l-8 5-8-5V8Z" />
        <path d="M12 6.5 17 9.5v5L12 17.5l-5-3v-5Z" />
        <path d="M12 10.2 14.3 12.5 12 14.8 9.7 12.5Z" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3.2" />
        <path d="M19 12a7 7 0 0 0-.1-1l2-1.4-2-3.4-2.3.7a7.8 7.8 0 0 0-1.7-1L14.6 3h-5.2l-.3 2.9a7.8 7.8 0 0 0-1.7 1L5 6.2l-2 3.4L5 11a7 7 0 0 0 0 2L3 14.4l2 3.4 2.4-.7a7.8 7.8 0 0 0 1.7 1l.3 2.9h5.2l.3-2.9a7.8 7.8 0 0 0 1.7-1l2.3.7 2-3.4-2-1.4c.1-.3.1-.7.1-1Z" />
      </>
    ),
  }

  return (
    <IconBase className={className} size={size}>
      {icons[name] ?? icons.overview}
    </IconBase>
  )
}

export function SearchIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m17 17 3.5 3.5" />
    </IconBase>
  )
}

export function ArrowRightIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M5 12h12" />
      <path d="m13 8 4 4-4 4" />
    </IconBase>
  )
}

export function CloseIcon(props) {
  return (
    <IconBase {...props}>
      <path d="M6 6 18 18" />
      <path d="M18 6 6 18" />
    </IconBase>
  )
}

export function ChevronIcon({ direction = 'right', ...props }) {
  const rotation = {
    right: 0,
    left: 180,
    up: -90,
    down: 90,
  }[direction]

  return (
    <IconBase {...props}>
      <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '12px 12px' }}>
        <path d="m9 6 6 6-6 6" />
      </g>
    </IconBase>
  )
}

export function DeltaArrowIcon({ direction = 'up', ...props }) {
  return (
    <IconBase size={14} strokeWidth={2} {...props}>
      {direction === 'down' ? (
        <path d="m12 18-5-6h10Z" fill="currentColor" stroke="none" />
      ) : (
        <path d="m12 6 5 6H7Z" fill="currentColor" stroke="none" />
      )}
    </IconBase>
  )
}

export function DeltaNeutralIcon(props) {
  return (
    <IconBase size={14} strokeWidth={2.2} {...props}>
      <path d="M7 12h10" />
    </IconBase>
  )
}

export function MenuDotsIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="6" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.2" fill="currentColor" stroke="none" />
    </IconBase>
  )
}

export function SettingsIcon(props) {
  return (
    <IconBase {...props}>
      <circle cx="12" cy="12" r="3.2" />
      <path d="M19 12a7 7 0 0 0-.1-1l2-1.4-2-3.4-2.3.7a7.8 7.8 0 0 0-1.7-1L14.6 3h-5.2l-.3 2.9a7.8 7.8 0 0 0-1.7 1L5 6.2l-2 3.4L5 11a7 7 0 0 0 0 2L3 14.4l2 3.4 2.4-.7a7.8 7.8 0 0 0 1.7 1l.3 2.9h5.2l.3-2.9a7.8 7.8 0 0 0 1.7-1l2.3.7 2-3.4-2-1.4c.1-.3.1-.7.1-1Z" />
    </IconBase>
  )
}
