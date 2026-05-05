"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import DemoWorkspace from "./DemoWorkspace";
import { useRecorder } from "@/hooks/useRecorder";
import { formatTime } from "@/lib/utils";

export default function Recorder() {
  const router = useRouter();
  const workspaceRef = useRef(null);
  const { isRecording, eventCount, elapsed, start, stop, cancel } =
    useRecorder(workspaceRef);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  const handleStart = () => {
    setError(null);
    start();
  };

  const handleStop = async () => {
    const { events, duration } = stop();
    if (!events.length) {
      setError(
        "No interactions captured. Try moving your mouse over the workspace.",
      );
      return;
    }

    const rect = workspaceRef.current?.getBoundingClientRect();
    setSaving(true);
    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          events,
          duration,
          width: rect ? Math.round(rect.width) : 0,
          height: rect ? Math.round(rect.height) : 0,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save session");
      }

      const data = await res.json();
      router.push(`/replay?session=${data.id}`);
    } catch (err) {
      if (!data?.id) {
        throw new Error("No session ID returned");
      }
      setError(err.message || "Something went wrong");
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-30 glass border-b border-zinc-800/60">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
              <div className="w-2 h-2 rounded-full bg-white" />
            </div>
            <div className="font-semibold tracking-tight">UI Replay</div>
            <div className="ml-2 text-[10px] uppercase tracking-wider text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">
              v1
            </div>
          </div>
          <Link
            href="/replay"
            className="text-sm text-zinc-400 hover:text-zinc-100 transition-colors"
          >
            View sessions →
          </Link>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight mb-2">
            Record a session
          </h1>
          <p className="text-zinc-400 text-sm leading-relaxed max-w-xl">
            Press start, then interact with the workspace below. Mouse movement,
            clicks, scrolls and typing are captured with timestamps and replayed
            with insights.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-5">
          {!isRecording && !saving && (
            <button
              onClick={handleStart}
              className="px-4 py-2 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 text-white text-sm font-medium hover:brightness-110 transition-all shadow-lg shadow-violet-500/20"
            >
              Start recording
            </button>
          )}

          {isRecording && (
            <>
              <button
                onClick={handleStop}
                className="px-4 py-2 rounded-lg bg-rose-500/90 hover:bg-rose-500 text-white text-sm font-medium transition-colors flex items-center gap-2"
              >
                <span className="w-2 h-2 rounded-sm bg-white" />
                Stop & save
              </button>
              <button
                onClick={cancel}
                className="px-3 py-2 rounded-lg border border-zinc-800 text-zinc-400 hover:text-zinc-100 hover:border-zinc-700 text-sm transition-colors"
              >
                Cancel
              </button>
              <div className="ml-2 flex items-center gap-3 text-xs text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse-ring" />
                  <span className="font-mono text-zinc-200">
                    {formatTime(elapsed)}
                  </span>
                </div>
                <div className="text-zinc-600">·</div>
                <div className="font-mono">{eventCount} events</div>
              </div>
            </>
          )}

          {saving && (
            <div className="text-sm text-zinc-400 flex items-center gap-2">
              <span className="w-3 h-3 rounded-full border-2 border-zinc-700 border-t-violet-400 animate-spin" />
              Saving session…
            </div>
          )}
        </div>

        {error && (
          <div className="mb-4 px-3 py-2 rounded-lg border border-rose-500/30 bg-rose-500/10 text-sm text-rose-300">
            {error}
          </div>
        )}

        <div
          ref={workspaceRef}
          className={`relative rounded-2xl border overflow-hidden transition-all ${
            isRecording
              ? "border-violet-500/40 shadow-[0_0_0_1px_rgba(139,92,246,0.15),0_30px_80px_-20px_rgba(139,92,246,0.25)]"
              : "border-zinc-800/80 shadow-2xl shadow-black/40"
          }`}
        >
          {isRecording && (
            <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5 px-2 py-1 rounded-md bg-rose-500/15 border border-rose-500/30 text-[10px] uppercase tracking-wider text-rose-300 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse-ring" />
              Recording
            </div>
          )}
          <DemoWorkspace />
        </div>

        <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          {[
            { label: "Throttled capture", desc: "~30fps mouse sampling" },
            {
              label: "High-fidelity replay",
              desc: "Interpolated cursor & ripples",
            },
            {
              label: "Insights engine",
              desc: "Heatmap, idle time, repeated clicks",
            },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-zinc-800/60 bg-zinc-900/30 p-3.5"
            >
              <div className="text-zinc-200 font-medium mb-0.5">
                {item.label}
              </div>
              <div className="text-zinc-500">{item.desc}</div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
