export class WhiteboardTemplatePersistenceUnconfirmedError extends Error {
  constructor(cause?: unknown) {
    super('The template was applied locally, but persistence could not be confirmed', { cause });
    this.name = 'WhiteboardTemplatePersistenceUnconfirmedError';
  }
}

type ImportWhiteboardTemplateOptions<Snapshot> = {
  load: () => Promise<Snapshot>;
  merge: (snapshot: Snapshot) => Promise<void>;
  requestDurability: () => Promise<void>;
  isCancelled: () => boolean;
};

/**
 * One additive user action: load once, merge once, then wait until the TARGET
 * room confirms persistence. Transport retries live inside the provider's
 * logical durability request and therefore never repeat the non-idempotent merge.
 */
export async function importWhiteboardTemplate<Snapshot>({
  load,
  merge,
  requestDurability,
  isCancelled,
}: ImportWhiteboardTemplateOptions<Snapshot>): Promise<void> {
  const snapshot = await load();
  if (isCancelled()) return;
  await merge(snapshot);
  // Once the non-idempotent merge has begun, cancellation cannot turn it back
  // into a no-op. Always prove target durability (or report it unconfirmed).
  try {
    await requestDurability();
  } catch (error) {
    throw new WhiteboardTemplatePersistenceUnconfirmedError(error);
  }
}
