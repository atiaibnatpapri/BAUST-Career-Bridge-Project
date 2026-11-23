/**
 * Recursively strips `undefined` values from plain objects and arrays before
 * writing to Firestore, while preserving `null`, primitives, `Date`, Firestore
 * `Timestamp`, and Firestore `FieldValue` sentinels (`serverTimestamp()`,
 * `arrayUnion()`, `arrayRemove()`, `increment()`, `deleteField()`).
 */
export function cleanPayload<T>(data: T): T {
  if (data === undefined || data === null || typeof data !== 'object') {
    return data;
  }

  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => cleanPayload(item)) as unknown as T;
  }

  const proto = Object.getPrototypeOf(data);
  if (proto !== Object.prototype && proto !== null) {
    // Preserve Date, Firestore Timestamp, FieldValue sentinels, etc.
    return data;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
    if (value !== undefined) {
      result[key] = cleanPayload(value);
    }
  }
  return result as T;
}
