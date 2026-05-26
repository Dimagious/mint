import { useCallback, useRef, useState } from 'react';

/**
 * Pull-down-to-dismiss gesture for bottom drawers.
 *
 * Why hand-rolled: MUI's `Drawer` has no native bottom-sheet drag, and
 * pulling in a dedicated library (e.g. vaul) just for this would mean
 * swapping out our drawer in two places + a new runtime dependency.
 * The interaction is small enough to own.
 *
 * Apply `handleProps` to the drawer's drag handle (the little pill at the
 * top of the drawer), and merge `paperSx` into the drawer's PaperProps
 * `sx` — that's where the in-progress translate / transition is rendered.
 *
 * The drawer is dismissed when the touch is released after a drop of
 * `closeAfterPx` (default 100) or a velocity above `velocityThreshold`
 * (default 0.6 px/ms). Otherwise it springs back.
 */
export interface UsePullDownToCloseOptions {
  closeAfterPx?: number;
  velocityThreshold?: number;
}

export interface UsePullDownToCloseResult {
  /** Touch handlers to attach to the drag handle. */
  handleProps: {
    onTouchStart: (e: React.TouchEvent) => void;
    onTouchMove: (e: React.TouchEvent) => void;
    onTouchEnd: (e: React.TouchEvent) => void;
    style: React.CSSProperties;
  };
  /** Style overrides to merge into the drawer Paper. */
  paperSx: React.CSSProperties;
}

export function usePullDownToClose(
  onClose: () => void,
  {
    closeAfterPx = 100,
    velocityThreshold = 0.6,
  }: UsePullDownToCloseOptions = {},
): UsePullDownToCloseResult {
  const [dragY, setDragY] = useState(0);
  const [animating, setAnimating] = useState(false);
  const startRef = useRef<{ y: number; t: number } | null>(null);

  const reset = useCallback(() => {
    setAnimating(true);
    setDragY(0);
    startRef.current = null;
    // Drop the animating flag after the transition completes so further
    // drags don't fight a stale transition.
    window.setTimeout(() => setAnimating(false), 220);
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    if (!t) return;
    startRef.current = { y: t.clientY, t: performance.now() };
    setAnimating(false);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    const start = startRef.current;
    const t = e.touches[0];
    if (!start || !t) return;
    const dy = Math.max(0, t.clientY - start.y);
    setDragY(dy);
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = startRef.current;
      const t = e.changedTouches[0];
      if (!start || !t) {
        reset();
        return;
      }
      const dy = Math.max(0, t.clientY - start.y);
      const dt = Math.max(1, performance.now() - start.t);
      const velocity = dy / dt;
      const shouldClose = dy >= closeAfterPx || velocity >= velocityThreshold;
      if (shouldClose) {
        startRef.current = null;
        onClose();
        // Defer reset until the close animation passes (Drawer unmounts the
        // Paper anyway, but in case it doesn't, we want a clean re-open).
        window.setTimeout(() => setDragY(0), 250);
      } else {
        reset();
      }
    },
    [closeAfterPx, velocityThreshold, onClose, reset],
  );

  return {
    handleProps: {
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      style: { touchAction: 'none', cursor: 'grab' },
    },
    paperSx: {
      transform: dragY ? `translate3d(0, ${dragY}px, 0)` : undefined,
      transition: animating
        ? 'transform 220ms cubic-bezier(0.2, 0.8, 0.2, 1)'
        : 'none',
    },
  };
}
