'use client';

import { useRef, useCallback } from 'react';

interface EntropyEvent {
  x: number;
  y: number;
  dx: number;
  dy: number;
  t: number;
}

export function useEntropyCollector() {
  const events = useRef<EntropyEvent[]>([]);
  const timings = useRef<number[]>([]);
  const lastPos = useRef<{ x: number; y: number } | null>(null);
  const isCollecting = useRef(false);

  const startCollecting = useCallback(() => {
    events.current = [];
    timings.current = [];
    lastPos.current = null;
    isCollecting.current = true;

    // Collect initial timing jitter immediately
    for (let i = 0; i < 32; i++) {
      timings.current.push(performance.now());
    }
  }, []);

  const onMouseMove = useCallback((e: MouseEvent | React.MouseEvent) => {
    if (!isCollecting.current) return;
    const x = 'clientX' in e ? e.clientX : 0;
    const y = 'clientY' in e ? e.clientY : 0;
    const dx = lastPos.current ? x - lastPos.current.x : 0;
    const dy = lastPos.current ? y - lastPos.current.y : 0;
    lastPos.current = { x, y };
    events.current.push({ x, y, dx, dy, t: performance.now() });
  }, []);

  const onTouchMove = useCallback((e: TouchEvent | React.TouchEvent) => {
    if (!isCollecting.current) return;
    const touch = 'touches' in e && e.touches[0] ? e.touches[0] : null;
    if (!touch) return;
    const x = touch.clientX;
    const y = touch.clientY;
    const dx = lastPos.current ? x - lastPos.current.x : 0;
    const dy = lastPos.current ? y - lastPos.current.y : 0;
    lastPos.current = { x, y };
    events.current.push({ x, y, dx, dy, t: performance.now() });
  }, []);

  const stopCollecting = useCallback(() => {
    isCollecting.current = false;
    // Collect final timing jitter
    for (let i = 0; i < 16; i++) {
      timings.current.push(performance.now());
    }
    return {
      events: events.current,
      timings: timings.current,
    };
  }, []);

  return { startCollecting, stopCollecting, onMouseMove, onTouchMove };
}
