'use client';

import { useEffect, useRef, useState } from 'react';
import DemoWorkspace from './DemoWorkspace';
import CustomCursor from './CustomCursor';

export default function ReplayCanvas({ session, cursor, activeClicks, scrollY, inputs }) {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [size, setSize] = useState({ w: 1, h: 1 });

  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      const rect = containerRef.current.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollY;
    }
  }, [scrollY]);

  if (!session) {
    return (
      <div
        ref={containerRef}
        className="h-full w-full grid place-items-center rounded-xl border border-zinc-800/60 bg-zinc-900/40"
      >
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-xl bg-zinc-800/60 grid place-items-center mx-auto mb-4">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="10" cy="10" r="7" />
              <path d="M10 6v4l2.5 2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-zinc-300">No session selected</h3>
          <p className="text-xs text-zinc-500 mt-1">Pick a session from the list to begin replay.</p>
        </div>
      </div>
    );
  }

  const recW = session.width || 1;
  const recH = session.height || 1;
  const sx = size.w / recW;
  const sy = size.h / recH;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/40 bg-zinc-900"
    >
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-auto pointer-events-none no-scrollbar"
      >
        <DemoWorkspace readOnly inputValues={inputs} />
      </div>

      <div className="absolute top-3 left-3 z-40 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-black/60 backdrop-blur border border-white/5 text-[10px] font-mono text-zinc-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        REPLAY · {session.id.slice(0, 16)}
      </div>

      {activeClicks.map((click, i) => (
        <ClickEffect
          key={`${click.timestamp}-${i}`}
          x={click.x * sx}
          y={click.y * sy}
          elRect={click.elRect}
          age={click.age}
          sx={sx}
          sy={sy}
        />
      ))}

      {cursor.visible && (
        <CustomCursor x={cursor.x * sx} y={cursor.y * sy} clicking={activeClicks.length > 0} />
      )}
    </div>
  );
}

function ClickEffect({ x, y, elRect, age, sx, sy }) {
  const fadeProgress = Math.min(1, age / 800);
  const opacity = 1 - fadeProgress;

  return (
    <>
      {elRect && (
        <div
          className="absolute pointer-events-none rounded-md border-2 border-violet-400"
          style={{
            left: `${elRect.x * sx}px`,
            top: `${elRect.y * sy}px`,
            width: `${elRect.w * sx}px`,
            height: `${elRect.h * sy}px`,
            opacity,
            boxShadow: `0 0 ${20 * opacity}px rgba(167, 139, 250, ${0.5 * opacity})`,
            transition: 'opacity 60ms linear',
          }}
        />
      )}
      <div
        className="absolute pointer-events-none rounded-full border-2 border-violet-400"
        style={{
          left: `${x}px`,
          top: `${y}px`,
          width: `${fadeProgress * 80}px`,
          height: `${fadeProgress * 80}px`,
          transform: 'translate(-50%, -50%)',
          opacity: 0.7 * (1 - fadeProgress),
        }}
      />
    </>
  );
}
