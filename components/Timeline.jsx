'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { formatTime } from '@/lib/utils';

export default function Timeline({ currentTime, duration, events, onSeek }) {
  const trackRef = useRef(null);
  const [dragging, setDragging] = useState(false);

  const clickMarks = useMemo(() => {
    if (!duration || !events) return [];
    return events
      .filter((e) => e.type === 'click')
      .map((e) => (e.timestamp / duration) * 100);
  }, [events, duration]);

  const progress = duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

  const seekFromEvent = useCallback(
    (clientX) => {
      const track = trackRef.current;
      if (!track || !duration) return;
      const rect = track.getBoundingClientRect();
      const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
      onSeek(ratio * duration);
    },
    [duration, onSeek]
  );

  const handleMouseDown = (e) => {
    setDragging(true);
    seekFromEvent(e.clientX);
  };

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e) => seekFromEvent(e.clientX);
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, seekFromEvent]);

  const ticks = useMemo(() => {
    if (!duration) return [];
    const result = [];
    for (let i = 0; i <= 4; i++) {
      result.push((i / 4) * duration);
    }
    return result;
  }, [duration]);

  return (
    <div className="px-5 py-4 border-t border-zinc-800/60 bg-zinc-950/60">
      <div className="flex items-center justify-between mb-2.5 text-xs font-mono">
        <span className="text-zinc-200">{formatTime(currentTime)}</span>
        <span className="text-zinc-500">{formatTime(duration)}</span>
      </div>

      <div
        ref={trackRef}
        onMouseDown={handleMouseDown}
        className="relative h-6 cursor-pointer group"
      >
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-zinc-800/80" />

        <div
          className="absolute top-1/2 -translate-y-1/2 h-1.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
          style={{ width: `${progress}%` }}
        />

        {clickMarks.map((pct, i) => (
          <div
            key={i}
            className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-violet-300/40 group-hover:bg-violet-300/70 transition-colors"
            style={{ left: `${pct}%` }}
          />
        ))}

        <div
          className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 rounded-full bg-white shadow-lg shadow-violet-500/30 ring-2 ring-violet-500/40 transition-transform hover:scale-110"
          style={{ left: `calc(${progress}% - 7px)` }}
        />
      </div>

      <div className="mt-1.5 flex items-center justify-between text-[10px] font-mono text-zinc-600">
        {ticks.map((t, i) => (
          <span key={i}>{formatTime(t)}</span>
        ))}
      </div>
    </div>
  );
}
