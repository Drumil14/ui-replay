'use client';

import { useMemo } from 'react';
import { computeInsights } from '@/lib/insights';
import { formatTime, formatDuration } from '@/lib/utils';

export default function InsightsPanel({ session }) {
  const insights = useMemo(() => computeInsights(session), [session]);

  if (!session || !insights) {
    return (
      <aside className="border-l border-zinc-800/60 bg-zinc-950/40 h-full flex items-center justify-center px-6">
        <div className="text-xs text-zinc-500 text-center leading-relaxed">
          Select a session to see insights.
        </div>
      </aside>
    );
  }

  const { counts, heatmap, hottest, repeated, firstInteractionTime, distribution, longestIdle, totalDistance, duration } = insights;

  const maxCell = Math.max(1, ...heatmap.flat());

  const stats = [
    { label: 'Total events', value: counts.total },
    { label: 'Clicks', value: counts.clicks },
    { label: 'Inputs', value: counts.inputs },
    { label: 'Cursor px', value: totalDistance.toLocaleString() },
  ];

  return (
    <aside className="border-l border-zinc-800/60 bg-zinc-950/40 h-full flex flex-col overflow-hidden">
      <div className="relative px-4 h-12 flex items-center justify-between border-b border-zinc-800/60 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-violet-500/10 via-transparent to-blue-500/5 pointer-events-none" />
        <div className="relative flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-violet-400 shadow-[0_0_8px_rgba(167,139,250,0.8)]" />
          <span className="text-sm font-medium gradient-text">Insights</span>
        </div>
        <span className="relative text-[10px] uppercase tracking-wider text-zinc-500">
          Auto-generated
        </span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-5">

        <div className="grid grid-cols-2 gap-2">
          {stats.map((s) => (
            <div
              key={s.label}
              className="relative rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 overflow-hidden"
            >
              <div className="text-lg font-semibold tabular-nums text-zinc-100">{s.value}</div>
              <div className="text-[11px] text-zinc-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Click heatmap</div>
            {hottest.count > 0 && (
              <div className="text-[10px] text-zinc-500 font-mono">
                hot zone {hottest.x},{hottest.y}
              </div>
            )}
          </div>
          <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-2">
            <div className="grid grid-cols-4 gap-1 aspect-square">
              {heatmap.map((row, y) =>
                row.map((count, x) => {
                  const intensity = count / maxCell;
                  const isHottest = hottest.count > 0 && hottest.x === x && hottest.y === y;
                  return (
                    <div
                      key={`${x}-${y}`}
                      className={`relative rounded transition-all ${isHottest ? 'ring-1 ring-violet-400/60' : ''}`}
                      style={{
                        backgroundColor: count === 0
                          ? 'rgba(39, 39, 42, 0.4)'
                          : `rgba(139, 92, 246, ${0.15 + intensity * 0.75})`,
                      }}
                    >
                      {count > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-mono text-white/90">
                          {count}
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium mb-2">
            Interaction density
          </div>
          <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3">
            <div className="flex h-2 rounded-full overflow-hidden bg-zinc-800">
              <div
                className="bg-gradient-to-r from-violet-500 to-violet-400"
                style={{ width: `${distribution.topPct}%` }}
              />
              <div
                className="bg-gradient-to-r from-blue-500 to-blue-400"
                style={{ width: `${distribution.bottomPct}%` }}
              />
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-sm bg-violet-400" />
                <span className="text-zinc-400">Top</span>
                <span className="text-zinc-200 font-mono">{distribution.topPct}%</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-zinc-200 font-mono">{distribution.bottomPct}%</span>
                <span className="text-zinc-400">Bottom</span>
                <span className="w-2 h-2 rounded-sm bg-blue-400" />
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium mb-2">
            Timing
          </div>
          <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 divide-y divide-zinc-800/60">
            <Row label="Time to first action" value={formatTime(firstInteractionTime)} />
            <Row label="Longest idle" value={formatDuration(longestIdle)} />
            <Row label="Session length" value={formatDuration(duration)} />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">
              Repeated clicks
            </div>
            <div className="text-[10px] text-zinc-500 font-mono">{repeated.length}</div>
          </div>

          {repeated.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800/70 px-3 py-4 text-[11px] text-zinc-500 text-center">
              No repeated clicks detected.
            </div>
          ) : (
            <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 divide-y divide-zinc-800/60 max-h-48 overflow-y-auto">
              {repeated.slice(0, 6).map((g, i) => (
                <div key={i} className="px-3 py-2 flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="text-xs text-zinc-200 truncate">
                      {g.label || `at (${Math.round(g.x)}, ${Math.round(g.y)})`}
                    </div>
                    <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                      {Math.round(g.x)} · {Math.round(g.y)}
                    </div>
                  </div>
                  <div className="px-1.5 py-0.5 rounded bg-violet-500/15 border border-violet-500/30 text-[10px] font-mono text-violet-200">
                    ×{g.count}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </aside>
  );
}

function Row({ label, value }) {
  return (
    <div className="px-3 py-2 flex items-center justify-between text-xs">
      <span className="text-zinc-400">{label}</span>
      <span className="text-zinc-100 font-mono tabular-nums">{value}</span>
    </div>
  );
}
