/** Show close-only progress for exactly the awaited close work, including failures. */
export async function withCloseFinalizing<T>(
  setFinalizing: (finalizing: boolean) => void,
  work: () => Promise<T>
): Promise<T> {
  setFinalizing(true);
  try {
    return await work();
  } finally {
    setFinalizing(false);
  }
}
