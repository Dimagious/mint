/**
 * Pure snap geometry — kept out of `FabricAdapter` so it's testable
 * without a real fabric canvas. The adapter wires this into the
 * `object:moving` event and the canvas-paint side.
 *
 * Mental model (Figma-style):
 *  - The dragged object has six interesting alignment points: its three
 *    horizontal edges (left / center / right) and three vertical edges
 *    (top / middle / bottom).
 *  - Every other visible object on the canvas contributes the same six
 *    points as "targets". We also include the canvas centerlines so
 *    "center on canvas" still works.
 *  - On each axis we pick the smallest delta among (myEdge - targetEdge)
 *    pairs that's within the threshold, and that becomes the snap.
 *  - X-axis and Y-axis are independent — we can snap on one axis and
 *    free-drag on the other.
 */

export type SnapEdge = 'start' | 'center' | 'end';

export interface SnapBox {
  /** Top-left coordinate. */
  readonly x: number;
  readonly y: number;
  /** Already accounting for any scale; effective on-canvas size. */
  readonly width: number;
  readonly height: number;
}

export interface SnapAxisResult {
  /** Amount to add to the dragged object's left (or top) to land on snap. */
  readonly delta: number;
  /** Coordinate on the perpendicular axis where the guide should render. */
  readonly guide: number;
}

export interface SnapResult {
  readonly x: SnapAxisResult | null;
  readonly y: SnapAxisResult | null;
}

/** Default threshold in canvas pixels (matches the old `snapToCenter`). */
export const DEFAULT_SNAP_THRESHOLD = 8;

function edgePositions(start: number, size: number): [number, number, number] {
  return [start, start + size / 2, start + size];
}

function pickSnap(
  myEdges: [number, number, number],
  targets: readonly number[],
  threshold: number,
): SnapAxisResult | null {
  let best: SnapAxisResult | null = null;
  for (const edge of myEdges) {
    for (const target of targets) {
      const delta = target - edge;
      const absDelta = Math.abs(delta);
      if (
        absDelta < threshold &&
        (best === null || absDelta < Math.abs(best.delta))
      ) {
        best = { delta, guide: target };
      }
    }
  }
  return best;
}

/**
 * Compute the snap result for a single dragged box against a set of
 * other boxes plus the canvas centerlines.
 *
 * Returns `{ x: null, y: null }` when nothing is in range; callers can
 * then apply `delta` to `obj.left` / `obj.top` and draw a guide at
 * `guide` on the perpendicular axis (vertical line at `x.guide`,
 * horizontal line at `y.guide`).
 */
export function computeSnap(
  dragged: SnapBox,
  others: readonly SnapBox[],
  canvasWidth: number,
  canvasHeight: number,
  threshold: number = DEFAULT_SNAP_THRESHOLD,
): SnapResult {
  const myX = edgePositions(dragged.x, dragged.width);
  const myY = edgePositions(dragged.y, dragged.height);

  // Canvas centerlines are always snap candidates so existing
  // "center on canvas" behaviour is preserved.
  const targetsX: number[] = [canvasWidth / 2];
  const targetsY: number[] = [canvasHeight / 2];

  for (const other of others) {
    targetsX.push(other.x, other.x + other.width / 2, other.x + other.width);
    targetsY.push(other.y, other.y + other.height / 2, other.y + other.height);
  }

  return {
    x: pickSnap(myX, targetsX, threshold),
    y: pickSnap(myY, targetsY, threshold),
  };
}
