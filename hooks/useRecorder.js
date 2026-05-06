"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const MOUSE_THROTTLE_MS = 33;
const MAX_EVENTS = 50_000;

export function useRecorder(targetRef) {
  const [isRecording, setIsRecording] = useState(false);
  const [eventCount, setEventCount] = useState(0);
  const [elapsed, setElapsed] = useState(0);

  const eventsRef = useRef([]);
  const startTimeRef = useRef(0);
  const lastMoveTimeRef = useRef(0);
  const tickerRef = useRef(null);

  const start = useCallback(() => {
    eventsRef.current = [];
    setEventCount(0);
    setElapsed(0);
    startTimeRef.current = performance.now();
    lastMoveTimeRef.current = 0;
    setIsRecording(true);
  }, []);

  const stop = useCallback(() => {
    const events = eventsRef.current.slice();
    const duration = performance.now() - startTimeRef.current;
    setIsRecording(false);
    return { events, duration };
  }, []);

  const cancel = useCallback(() => {
    eventsRef.current = [];
    setEventCount(0);
    setElapsed(0);
    setIsRecording(false);
  }, []);

  useEffect(() => {
    if (!isRecording) return;
    const target = targetRef.current;
    if (!target) return;

    const now = () => performance.now() - startTimeRef.current;
    const getRect = () => target.getBoundingClientRect();

    const push = (event) => {
      if (eventsRef.current.length >= MAX_EVENTS) return;
      eventsRef.current.push(event);
      setEventCount(eventsRef.current.length);
    };

    const onMove = (e) => {
      const t = performance.now();
      if (t - lastMoveTimeRef.current < MOUSE_THROTTLE_MS) return;
      lastMoveTimeRef.current = t;
      const rect = getRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;
      push({ type: "move", x, y, timestamp: now() });
    };

    const onClick = (e) => {
      const rect = getRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      if (x < 0 || y < 0 || x > rect.width || y > rect.height) return;

      const clickedEl = e.target instanceof Element ? e.target : null;
      const labeledEl = clickedEl?.closest("[data-label]");
      const interactiveEl =
        labeledEl ||
        clickedEl?.closest('button, a, input, textarea, [role="button"]') ||
        clickedEl ||
        target;

      const label =
        labeledEl?.getAttribute("data-label") ||
        interactiveEl?.getAttribute("aria-label") ||
        (interactiveEl?.tagName === "INPUT" ||
        interactiveEl?.tagName === "TEXTAREA"
          ? interactiveEl.getAttribute("placeholder") ||
            interactiveEl.name ||
            "input"
          : (interactiveEl?.textContent || "").trim().slice(0, 32) ||
            interactiveEl?.tagName?.toLowerCase());

      let elRect = null;
      if (interactiveEl && interactiveEl !== target) {
        const er = interactiveEl.getBoundingClientRect();
        elRect = {
          x: er.left - rect.left,
          y: er.top - rect.top,
          w: er.width,
          h: er.height,
        };
      }

      push({ type: "click", x, y, value: label, elRect, timestamp: now() });

      const link = clickedEl?.closest("a");
      if (link) {
        setTimeout(() => {
          push({
            type: "navigation",
            path: window.location.pathname,
            timestamp: now(),
          });
        }, 100);
      }
    };

    const onScroll = () => {
      push({ type: "scroll", y: target.scrollTop, timestamp: now() });
    };

    const onInput = (e) => {
      const field = e.target;
      if (!field.matches("input, textarea")) return;
      const fieldId =
        field.getAttribute("data-field") ||
        field.name ||
        field.id ||
        field.getAttribute("placeholder") ||
        "unknown";
      push({ type: "input", value: field.value, fieldId, timestamp: now() });
    };

    target.addEventListener("mousemove", onMove);
    target.addEventListener("click", onClick);
    target.addEventListener("scroll", onScroll, { passive: true });
    target.addEventListener("input", onInput, true);

    tickerRef.current = setInterval(() => {
      setElapsed(performance.now() - startTimeRef.current);
    }, 100);

    return () => {
      target.removeEventListener("mousemove", onMove);
      target.removeEventListener("click", onClick);
      target.removeEventListener("scroll", onScroll);
      target.removeEventListener("input", onInput, true);
      if (tickerRef.current) {
        clearInterval(tickerRef.current);
        tickerRef.current = null;
      }
    };
  }, [isRecording, targetRef]);

  return { isRecording, eventCount, elapsed, start, stop, cancel };
}
