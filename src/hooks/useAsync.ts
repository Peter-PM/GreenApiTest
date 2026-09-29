import { useState } from "react";

export function useAsync() {
  const [pending, setPending] = useState(false);

  async function run<T>(action: () => Promise<T>): Promise<T | null> {
    setPending(true);
    try {
      return await action();
    } catch (err) {
      console.error("[api]", err);
      return null;
    } finally {
      setPending(false);
    }
  }

  return { run, pending };
}
