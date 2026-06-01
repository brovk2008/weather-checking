export function sanitizeSearchInput(value: string) {
  return value.replace(/[<>()[\]{}$;]/g, "").replace(/\s+/g, " ").trim().slice(0, 80);
}

export function createRateLimiter(limit: number, windowMs: number) {
  const calls: number[] = [];

  return function isAllowed() {
    const now = Date.now();
    while (calls.length && now - calls[0] > windowMs) {
      calls.shift();
    }
    if (calls.length >= limit) {
      return false;
    }
    calls.push(now);
    return true;
  };
}
