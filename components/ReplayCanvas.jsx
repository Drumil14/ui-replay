"use client";

import { useEffect, useRef, useState } from "react";
import DemoWorkspace from "./DemoWorkspace";
import CustomCursor from "./CustomCursor";

export default function ReplayCanvas({
  session,
  cursor,
  activeClicks,
  scrollY,
  inputs,
  currentPath = "/",
}) {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);
  const [size, setSize] = useState({ w: 1, h: 1 });

  useEffect(() => {
    let el = containerRef.current;
    if (!el) return;

    const update = () => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      setSize({ w: rect.width, h: rect.height });
    };

    update();

    const observer = new ResizeObserver(update);
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const recW = session?.width || 1;
  const recH = session?.height || 1;
  const scale = size.w > 0 && recW > 0 ? size.w / recW : 1;

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollY * scale;
    }
  }, [scrollY, scale]);

  if (!session) {
    return (
      <div
        ref={containerRef}
        className="h-full w-full grid place-items-center rounded-xl border border-zinc-800/60 bg-zinc-900/40"
      >
        <div className="text-center p-8">
          <div className="w-12 h-12 rounded-xl bg-zinc-800/60 grid place-items-center mx-auto mb-4">
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <circle cx="10" cy="10" r="7" />
              <path d="M10 6v4l2.5 2.5" strokeLinecap="round" />
            </svg>
          </div>
          <h3 className="text-sm font-medium text-zinc-300">
            No session selected
          </h3>
          <p className="text-xs text-zinc-500 mt-1">
            Pick a session from the list to begin replay.
          </p>
        </div>
      </div>
    );
  }

  const scaledW = recW * scale;
  const scaledH = recH * scale;

  return (
    <div
      ref={containerRef}
      className="relative h-full w-full rounded-xl overflow-hidden border border-zinc-800 shadow-2xl shadow-black/40 bg-zinc-900"
    >
      <div
        ref={scrollRef}
        className="absolute inset-0 overflow-auto no-scrollbar pointer-events-none"
      >
        <div
          style={{
            width: `${scaledW}px`,
            height: `${scaledH}px`,
            position: "relative",
          }}
        >
          <div
            className="origin-top-left"
            style={{
              width: `${recW}px`,
              height: `${recH}px`,
              transform: `scale(${scale})`,
              position: "absolute",
              top: 0,
              left: 0,
            }}
          >
            {currentPath === "/todo" ? (
              <div className="p-6 text-white">Todo Page (Replay)</div>
            ) : (
              <DemoWorkspace readOnly inputValues={inputs} />
            )}

            {activeClicks.map((click, i) => (
              <ClickEffect
                key={`${click.timestamp}-${i}`}
                x={click.x}
                y={click.y}
                elRect={click.elRect}
                age={click.age}
              />
            ))}

            {cursor.visible && (
              <CustomCursor
                x={cursor.x}
                y={cursor.y}
                clicking={activeClicks.length > 0}
              />
            )}
          </div>
        </div>
      </div>

      <div className="absolute top-3 left-3 z-40 flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-black/60 backdrop-blur border border-white/5 text-[10px] font-mono text-zinc-300">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        REPLAY · {session.id.slice(0, 16)}
      </div>
    </div>
  );
}

function ClickEffect({ x, y, elRect, age }) {
  const fadeProgress = Math.min(1, age / 800);
  const opacity = 1 - fadeProgress;

  return (
    <>
      {elRect && (
        <div
          className="absolute pointer-events-none rounded-md border-2 border-violet-400"
          style={{
            left: `${elRect.x}px`,
            top: `${elRect.y}px`,
            width: `${elRect.w}px`,
            height: `${elRect.h}px`,
            opacity,
            boxShadow: `0 0 ${20 * opacity}px rgba(167, 139, 250, ${0.5 * opacity})`,
            transition: "opacity 60ms linear",
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
          transform: "translate(-50%, -50%)",
          opacity: 0.7 * (1 - fadeProgress),
        }}
      />
    </>
  );
}
