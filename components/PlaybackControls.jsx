'use client';

const SPEEDS = [1, 2];

export default function PlaybackControls({ isPlaying, speed, onPlay, onPause, onRestart, onSpeedChange }) {
  return (
    <div className="flex items-center justify-center gap-3 px-5 py-3.5 border-t border-zinc-800/60 bg-zinc-950/40">
      <button
        onClick={onRestart}
        className="w-9 h-9 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 transition-colors"
        aria-label="Restart"
        title="Restart"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      </button>

      <button
        onClick={isPlaying ? onPause : onPlay}
        className={`w-11 h-11 rounded-full flex items-center justify-center transition-all ${
          isPlaying
            ? 'bg-zinc-100 text-zinc-900 hover:brightness-95'
            : 'bg-gradient-to-br from-violet-500 to-blue-500 text-white shadow-lg shadow-violet-500/30 hover:brightness-110'
        }`}
        aria-label={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <rect x="6" y="5" width="4" height="14" rx="1" />
            <rect x="14" y="5" width="4" height="14" rx="1" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 4.5v15a1 1 0 0 0 1.5.87l13-7.5a1 1 0 0 0 0-1.74l-13-7.5A1 1 0 0 0 7 4.5z" />
          </svg>
        )}
      </button>

      <div className="flex items-center gap-1 ml-1 p-0.5 rounded-lg border border-zinc-800/80 bg-zinc-900/40">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
              speed === s
                ? 'bg-zinc-100 text-zinc-900'
                : 'text-zinc-400 hover:text-zinc-100'
            }`}
          >
            {s}x
          </button>
        ))}
      </div>
    </div>
  );
}
