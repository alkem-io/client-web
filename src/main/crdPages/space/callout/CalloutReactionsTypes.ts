// Manually defined types matching the expected GraphQL contract for callout
// reactions. These replace generated Apollo types until the server's reaction
// module is deployed and `pnpm codegen` can run against the live schema.
//
// Shape mirrors the plan contract exactly:
//   Callout.reactionsSummary: CalloutReactionsSummary!
//   Callout.reactions: [CalloutReaction!]! (bounded 100)
//   Mutation addReactionToCallout / removeReactionFromCallout → Callout!

export type CalloutReactionsSummaryFragment = {
  total: number;
  emojis: string[];
  myReactionEmoji?: string | null;
  allowedEmojis: string[];
};

export type CalloutWhoReactedRow = {
  id: string;
  emoji: string;
  updatedDate: string;
  user?: {
    id: string;
    profile: {
      id: string;
      displayName: string;
      avatar?: { id: string; uri: string } | null;
    };
  } | null;
};

export type AddReactionToCalloutInput = {
  calloutID: string;
  emoji: string;
};

export type RemoveReactionFromCalloutInput = {
  calloutID: string;
};
