import type { CollaboraDocumentType } from '@/core/apollo/generated/graphql-schema';

export type DisplayNameDecision =
  | { displayName: string; documentType: CollaboraDocumentType }
  | { displayName: string }
  | Record<string, never>;

type DeriveInput =
  | {
      mode: 'blank-create';
      postTitle: string;
      documentType: CollaboraDocumentType;
    }
  | {
      mode: 'upload';
      postTitle: string;
      autoPrefilledTitle?: string;
    };

export const deriveCollaboraDocumentDisplayName = (input: DeriveInput): DisplayNameDecision => {
  if (input.mode === 'blank-create') {
    return { displayName: input.postTitle, documentType: input.documentType };
  }

  const { postTitle, autoPrefilledTitle } = input;
  if (autoPrefilledTitle !== undefined && postTitle === autoPrefilledTitle) {
    return {};
  }
  return { displayName: postTitle };
};
