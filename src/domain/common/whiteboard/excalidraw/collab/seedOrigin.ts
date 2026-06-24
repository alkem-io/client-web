/**
 * Transaction origin tag for the single-user LOAD seed (`Y.applyUpdateV2(doc,
 * fromBase64(content), SEED_ORIGIN)`). The dialog's doc-`update` dirty-check
 * ignores updates carrying this origin so seeding the stored content does not
 * mark a freshly-opened, untouched whiteboard as dirty — only genuine user
 * edits (whose updates carry a different origin) flip the dirty flag.
 *
 * Lives here (not in `whiteboardContent.ts`) so both the LOAD site
 * (`ExcalidrawWrapper`) and the dirty-check site (`CrdSingleUserWhiteboardDialog`)
 * import the same symbol without coupling to the content (de)serialization module.
 */
export const SEED_ORIGIN = Symbol('whiteboard-seed');
