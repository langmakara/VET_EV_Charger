/**
 * Shared helpers for building requests inside `~/apis/*.repository.ts` files.
 * Pulled out so every repository does the same param-cleaning instead of
 * re-implementing it in each file.
 */

/**
 * Drop `undefined` / `null` / `""` values from a params object so axios
 * doesn't serialize junk query-string entries like `?journeyType=`.
 */
export function cleanParams<T extends Record<string, any>>(params?: T | null): Partial<T> {
  if (!params) return {};
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""),
  ) as Partial<T>;
}
