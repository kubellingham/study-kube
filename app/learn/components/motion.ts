// Tiny motion helpers that mirror the design files' `e([in],[out],ease)(t)`
// interpolation, so the ported Opening/Digesting animations read the same as
// the source. All time-driven; no animation framework needed.

export type Ease = (t: number) => number;

export const linear: Ease = (t) => t;
export const easeOutCubic: Ease = (t) => 1 - Math.pow(1 - t, 3);
export const easeInCubic: Ease = (t) => t * t * t;
export const easeInOutCubic: Ease = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
export const easeOutBack: Ease = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

/** Clamped piecewise interpolation: map x in [i0,i1] to [o0,o1] through ease. */
export function ip(
  x: number,
  [i0, i1]: [number, number],
  [o0, o1]: [number, number],
  ease: Ease = linear
): number {
  if (i1 === i0) return x <= i0 ? o0 : o1;
  let t = (x - i0) / (i1 - i0);
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return o0 + (o1 - o0) * ease(t);
}

export const mod = (x: number, m: number) => ((x % m) + m) % m;
