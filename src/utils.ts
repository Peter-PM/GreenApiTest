export function nowSeconds(): number {
  return Math.floor(Date.now() / 1000);
}

export function formatClockTime(unixSeconds: number): string {
  return new Date(unixSeconds * 1000).toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatListTime(unixSeconds: number): string {
  if (unixSeconds === 0) return "";
  const date = new Date(unixSeconds * 1000);
  const today = new Date();
  const sameDay =
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear();
  return sameDay
    ? formatClockTime(unixSeconds)
    : date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit" });
}

export function describeError(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
