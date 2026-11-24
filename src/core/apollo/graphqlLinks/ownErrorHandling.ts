/**
 * The Apollo `context` for an operation the global error link must stay silent for: one whose
 * caller shows its own message for a failure, or one that runs without the user asking and shows
 * none. A caller that shows its own message uses `useServerErrorMessage` for the failures it does
 * not render specially, so the server's reason still reaches the user in that one message.
 */
export const OWN_ERROR_HANDLING = { skipGlobalErrorHandler: true } as const;
