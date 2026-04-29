'use client';

import Link from 'next/link';
import { formatDuration, formatRelativeTime } from '@/lib/utils';

export default function SessionList({ sessions, activeId, onSelect, onDelete, loading }) {
  return (
    <aside className="border-r border-zinc-800/60 bg-zinc-950/40 flex flex-col h-full">
      <div className="px-4 h-12 flex items-center justify-between border-b border-zinc-800/60">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-200">Sessions</span>
          <span className="text-[11px] text-zinc-500 font-mono">{sessions.length}</span>
        </div>
        <Link
          href="/"
          className="text-xs text-violet-300 hover:text-violet-200 transition-colors"
        >
          + New
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="p-4 text-xs text-zinc-500">Loading…</div>
        )}

        {!loading && sessions.length === 0 && (
          <div className="p-4">
            <div className="text-sm text-zinc-300 mb-1">No sessions yet</div>
            <div className="text-xs text-zinc-500 leading-relaxed">
              Record your first session to see it here.
            </div>
          </div>
        )}

        {sessions.map((s) => {
          const isActive = s.id === activeId;
          return (
            <div
              key={s.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(s.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelect(s.id);
                }
              }}
              className={`group relative px-4 py-3 cursor-pointer border-l-2 transition-colors ${
                isActive
                  ? 'border-violet-500 bg-violet-500/8'
                  : 'border-transparent hover:bg-zinc-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <div className={`text-xs font-mono truncate ${isActive ? 'text-violet-200' : 'text-zinc-300'}`}>
                    {s.id}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[11px] text-zinc-500">
                    <span>{formatDuration(s.duration)}</span>
                    <span className="text-zinc-700">·</span>
                    <span>{s.eventCount ?? 0} events</span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-zinc-600">
                    {formatRelativeTime(s.createdAt)}
                  </div>
                </div>

                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(s.id);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      e.stopPropagation();
                      onDelete(s.id);
                    }
                  }}
                  className="opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-rose-300 text-sm leading-none px-1.5 py-0.5 rounded transition-all cursor-pointer"
                  aria-label="Delete session"
                >
                  ×
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
}
