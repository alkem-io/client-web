/** Show close-only progress for exactly the durability wait, including failures. */
export async function withCloseFinalizing(
  setFinalizing: (finalizing: boolean) => void,
  requestDurability: () => Promise<void>
): Promise<void> {
  setFinalizing(true);
  try {
    await requestDurability();
  } finally {
    setFinalizing(false);
  }
}
