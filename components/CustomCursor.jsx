'use client';

export default function CustomCursor({ x, y, clicking }) {
  return (
    <div
      className="absolute pointer-events-none z-50"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-2px, -2px)',
        willChange: 'left, top',
      }}
    >
      {clicking && (
        <span
          className="absolute -top-2 -left-2 w-7 h-7 rounded-full border-2 border-violet-400"
          style={{ animation: 'pulse-ring 0.6s ease-out forwards' }}
        />
      )}
      <svg
        width="22"
        height="22"
        viewBox="0 0 22 22"
        fill="none"
        style={{
          filter: 'drop-shadow(0 1px 3px rgba(0,0,0,0.6))',
        }}
      >
        <path
          d="M3 2 L3 17 L7 13 L9.5 19 L12 18 L9.5 12 L15 12 Z"
          fill="white"
          stroke="black"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
}
