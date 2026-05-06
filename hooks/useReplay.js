"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { findLastIndexAtTime, shallowEqual } from "@/lib/utils";

const CLICK_LIFETIME_MS = 800;

export function useReplay(session) {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [currentPath, setCurrentPath] = useState("/");

  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const [activeClicks, setActiveClicks] = useState([]);
  const [scrollY, setScrollY] = useState(0);
  const [inputs, setInputs] = useState({});

  const rafRef = useRef(null);
  const lastFrameRef = useRef(0);
  const currentTimeRef = useRef(0);
  const speedRef = useRef(1);

  const cursorRef = useRef(cursor);
  const scrollRef = useRef(0);
  const inputsRef = useRef({});
  const clicksRef = useRef([]);
  const currentPathRef = useRef("/");

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const sorted = useMemo(() => {
    const moves = [];
    const clicks = [];
    const scrolls = [];
    const inputEvents = [];
    const navigations = [];
    if (session?.events) {
      for (const event of session.events) {
        if (event.type === "move") moves.push(event);
        else if (event.type === "click") clicks.push(event);
        else if (event.type === "scroll") scrolls.push(event);
        else if (event.type === "input") inputEvents.push(event);
        else if (event.type === "navigation") navigations.push(event);
      }
    }
    return { moves, clicks, scrolls, inputEvents, navigations };
  }, [session]);

  const duration = session?.duration || 0;

  const applyState = useCallback(
    (t) => {
      const { moves, clicks, scrolls, inputEvents, navigations } = sorted;

      let nextCursor = { x: 0, y: 0, visible: false };
      const moveIdx = findLastIndexAtTime(moves, t);
      if (moveIdx >= 0) {
        const last = moves[moveIdx];
        const next = moves[moveIdx + 1];
        if (next && next.timestamp - last.timestamp < 1000) {
          const span = next.timestamp - last.timestamp;
          const progress =
            span > 0
              ? Math.min(1, Math.max(0, (t - last.timestamp) / span))
              : 0;
          nextCursor = {
            x: last.x + (next.x - last.x) * progress,
            y: last.y + (next.y - last.y) * progress,
            visible: true,
          };
        } else {
          nextCursor = { x: last.x, y: last.y, visible: true };
        }
      }

      const scrollIdx = findLastIndexAtTime(scrolls, t);
      const nextScroll = scrollIdx >= 0 ? scrolls[scrollIdx].y : 0;
      const navIdx = findLastIndexAtTime(navigations, t);
      const nextPath = navIdx >= 0 ? navigations[navIdx].path : "/";
      if (currentPathRef.current !== nextPath) {
        currentPathRef.current = nextPath;
        setCurrentPath(nextPath);
      }

      const clickIdx = findLastIndexAtTime(clicks, t);

      let nextFilter = "all";
      let lastAddTaskTime = -1;
      const addedTasks = [];
      for (let i = 0; i <= clickIdx; i++) {
        const v = clicks[i].value;
        if (v && v.startsWith("Filter: ")) {
          const part = v.slice("Filter: ".length);
          nextFilter = part === "All" ? "all" : part;
        } else if (v === "Add task") {
          let valAtClick = "";
          for (let k = inputEvents.length - 1; k >= 0; k--) {
            const ie = inputEvents[k];
            if (ie.timestamp > clicks[i].timestamp) continue;
            if (ie.timestamp <= lastAddTaskTime) break;
            if (ie.fieldId === "new-task") {
              valAtClick = ie.value;
              break;
            }
          }
          if (valAtClick.trim()) {
            addedTasks.push({
              id: `r_${i}`,
              title: valAtClick.trim(),
              status: "Todo",
              tag: "New",
              priority: "Medium",
            });
          }
          lastAddTaskTime = clicks[i].timestamp;
        }
      }

      const nextInputs = {};
      const inputIdx = findLastIndexAtTime(inputEvents, t);
      for (let i = 0; i <= inputIdx; i++) {
        nextInputs[inputEvents[i].fieldId] = inputEvents[i].value;
      }

      if (lastAddTaskTime >= 0) {
        let resetValue = "";
        for (let k = inputEvents.length - 1; k >= 0; k--) {
          const ie = inputEvents[k];
          if (ie.timestamp > t) continue;
          if (ie.timestamp <= lastAddTaskTime) break;
          if (ie.fieldId === "new-task") {
            resetValue = ie.value;
            break;
          }
        }
        nextInputs["new-task"] = resetValue;
      }

      nextInputs.__filter = nextFilter;
      nextInputs.__addedTasks = addedTasks;

      const nextClicks = [];
      for (let i = clickIdx; i >= 0; i--) {
        const age = t - clicks[i].timestamp;
        if (age < CLICK_LIFETIME_MS) {
          nextClicks.unshift({ ...clicks[i], age });
        } else {
          break;
        }
      }

      if (
        cursorRef.current.x !== nextCursor.x ||
        cursorRef.current.y !== nextCursor.y ||
        cursorRef.current.visible !== nextCursor.visible
      ) {
        cursorRef.current = nextCursor;
        setCursor(nextCursor);
      }

      if (scrollRef.current !== nextScroll) {
        scrollRef.current = nextScroll;
        setScrollY(nextScroll);
      }

      const prevInputs = inputsRef.current;
      const prevTasks = prevInputs.__addedTasks || [];
      const tasksEqual =
        prevTasks.length === addedTasks.length &&
        prevTasks.every((tk, i) => tk.title === addedTasks[i].title);
      const otherEqual =
        prevInputs.__filter === nextInputs.__filter &&
        Object.keys(nextInputs)
          .filter((k) => k !== "__addedTasks")
          .every((k) => prevInputs[k] === nextInputs[k]) &&
        Object.keys(prevInputs)
          .filter((k) => k !== "__addedTasks")
          .every((k) => prevInputs[k] === nextInputs[k]);

      if (!tasksEqual || !otherEqual) {
        inputsRef.current = nextInputs;
        setInputs(nextInputs);
      }

      const prev = clicksRef.current;
      let clicksChanged = prev.length !== nextClicks.length;
      if (!clicksChanged) {
        for (let i = 0; i < prev.length; i++) {
          if (prev[i].timestamp !== nextClicks[i].timestamp) {
            clicksChanged = true;
            break;
          }
        }
      }
      if (clicksChanged) {
        clicksRef.current = nextClicks;
        setActiveClicks(nextClicks);
      }
    },
    [sorted],
  );

  const seek = useCallback(
    (t) => {
      const clamped = Math.max(0, Math.min(t, duration));
      currentTimeRef.current = clamped;
      setCurrentTime(clamped);
      applyState(clamped);
    },
    [applyState, duration],
  );

  useEffect(() => {
    if (!isPlaying) {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
      return;
    }

    lastFrameRef.current = performance.now();

    const tick = (now) => {
      const delta = (now - lastFrameRef.current) * speedRef.current;
      lastFrameRef.current = now;

      let t = currentTimeRef.current + delta;
      if (t >= duration) {
        t = duration;
        currentTimeRef.current = t;
        setCurrentTime(t);
        applyState(t);
        setIsPlaying(false);
        return;
      }

      currentTimeRef.current = t;
      setCurrentTime(t);
      applyState(t);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [isPlaying, duration, applyState]);

  useEffect(() => {
    currentTimeRef.current = 0;
    cursorRef.current = { x: 0, y: 0, visible: false };
    scrollRef.current = 0;
    inputsRef.current = {};
    clicksRef.current = [];
    currentPathRef.current = "/";
    setCurrentTime(0);
    setCursor({ x: 0, y: 0, visible: false });
    setScrollY(0);
    setInputs({});
    setActiveClicks([]);
    setCurrentPath("/");
    setIsPlaying(false);
  }, [session?.id]);

  const play = useCallback(() => {
    if (currentTimeRef.current >= duration - 1) {
      currentTimeRef.current = 0;
      setCurrentTime(0);
      applyState(0);
    }
    setIsPlaying(true);
  }, [applyState, duration]);

  const pause = useCallback(() => setIsPlaying(false), []);

  const restart = useCallback(() => {
    currentTimeRef.current = 0;
    setCurrentTime(0);
    applyState(0);
    setIsPlaying(true);
  }, [applyState]);

  return {
    currentTime,
    duration,
    isPlaying,
    speed,
    cursor,
    currentPath,
    activeClicks,
    scrollY,
    inputs,
    play,
    pause,
    restart,
    seek,
    setSpeed,
  };
}
