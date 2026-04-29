'use client';

import Link from 'next/link';
import { useEffect, useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import SessionList from './SessionList';
import ReplayCanvas from './ReplayCanvas';
import Timeline from './Timeline';
import PlaybackControls from './PlaybackControls';
import InsightsPanel from './InsightsPanel';
import { useReplay } from '@/hooks/useReplay';

export default function ReplayPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session');

  const [sessions, setSessions] = useState([]);
  const [listLoading, setListLoading] = useState(true);
  const [activeSession, setActiveSession] = useState(null);
  const [activeLoading, setActiveLoading] = useState(false);

  const replay = useReplay(activeSession);

  const loadSessions = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch('/api/sessions', { cache: 'no-store' });
      const data = await res.json();
      setSessions(data.sessions || []);
    } catch {
      setSessions([]);
    } finally {
      setListLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  useEffect(() => {
    if (!sessionId) {
      setActiveSession(null);
      return;
    }
    let cancelled = false;
    setActiveLoading(true);
    fetch(`/api/sessions/${sessionId}`, { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error('not found'))))
      .then((data) => {
        if (!cancelled) setActiveSession(data.session);
      })
      .catch(() => {
        if (!cancelled) setActiveSession(null);
      })
      .finally(() => {
        if (!cancelled) setActiveLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [sessionId]);

  useEffect(() => {
    if (!sessionId && sessions.length > 0) {
      router.replace(`/replay?session=${sessions[0].id}`);
    }
  }, [sessionId, sessions, router]);

  const handleSelect = (id) => {
    router.replace(`/replay?session=${id}`);
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this session?')) return;
    try {
      await fetch(`/api/sessions/${id}`, { method: 'DELETE' });
    } catch {}
    if (id === sessionId) {
      router.replace('/replay');
      setActiveSession(null);
    }
    loadSessions();
  };

  return (
    <div className="h-screen flex flex-col">
      <header className="glass border-b border-zinc-800/60 z-30">
        <div className="px-5 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center group-hover:brightness-110 transition-all">
                <div className="w-2 h-2 rounded-full bg-white" />
              </div>
              <div className="font-semibold tracking-tight">UI Replay</div>
            </Link>
            <div className="ml-2 text-[10px] uppercase tracking-wider text-zinc-500 px-1.5 py-0.5 rounded border border-zinc-800">
              Replay
            </div>
          </div>

          <Link
            href="/"
            className="px-3 py-1.5 rounded-lg border border-zinc-800 text-zinc-300 hover:text-zinc-100 hover:border-zinc-700 text-xs transition-colors"
          >
            Record new
          </Link>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[260px_1fr_320px] overflow-hidden">
        <SessionList
          sessions={sessions}
          activeId={sessionId}
          onSelect={handleSelect}
          onDelete={handleDelete}
          loading={listLoading}
        />

        <main className="flex flex-col overflow-hidden bg-zinc-950">
          <div className="flex-1 relative overflow-hidden">
            {activeLoading && (
              <div className="absolute inset-0 flex items-center justify-center text-zinc-500 text-sm z-20">
                Loading session…
              </div>
            )}
            <ReplayCanvas
              session={activeSession}
              cursor={replay.cursor}
              activeClicks={replay.activeClicks}
              scrollY={replay.scrollY}
              inputs={replay.inputs}
            />
          </div>

          {activeSession && (
            <>
              <Timeline
                currentTime={replay.currentTime}
                duration={replay.duration}
                events={activeSession.events}
                onSeek={replay.seek}
              />
              <PlaybackControls
                isPlaying={replay.isPlaying}
                speed={replay.speed}
                onPlay={replay.play}
                onPause={replay.pause}
                onRestart={replay.restart}
                onSpeedChange={replay.setSpeed}
              />
            </>
          )}
        </main>

        <InsightsPanel session={activeSession} />
      </div>
    </div>
  );
}
