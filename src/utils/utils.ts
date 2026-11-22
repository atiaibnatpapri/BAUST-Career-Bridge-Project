/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export const toList = (v: unknown): string[] =>
  Array.isArray(v)
    ? v.filter((item) => item !== null && item !== undefined).map(String)
    : typeof v === 'string'
    ? v
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

export const safeArray = <T,>(v: T[] | null | undefined): T[] =>
  Array.isArray(v) ? v.filter((item): item is T => item !== null && item !== undefined) : [];

export const safeFirstWord = (v: unknown, fallback = ''): string => {
  if (typeof v !== 'string') return fallback;
  const trimmed = v.trim();
  if (!trimmed) return fallback;
  return trimmed.split(/\s+/)[0] ?? fallback;
};

export const safeFirstChar = (v: unknown, fallback = 'U'): string => {
  if (typeof v !== 'string') return fallback;
  const trimmed = v.trim();
  return trimmed ? trimmed.charAt(0).toUpperCase() : fallback;
};
