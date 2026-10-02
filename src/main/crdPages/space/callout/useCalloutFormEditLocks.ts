import { useCalloutFormResponsesQuery } from '@/core/apollo/generated/apollo-hooks';
import type { FormSettingsValue } from '@/crd/forms/callout/types';
import type { FormEditLocks } from './FramingEditorConnector';

type DeriveInput = {
  /** Ids of the questions currently on the persisted form. */
  questionIds: string[];
  persisted: FormSettingsValue;
  /** Whether the viewer reads every response; when false the counts below say nothing about the form. */
  canReadAll: boolean;
  total: number;
  /** The respondent of each loaded response (the loaded page only). */
  respondentIds: (string | undefined)[];
};

/**
 * What the form's responses currently forbid an admin to change. The client only mirrors the server rules
 * to explain why a control is unavailable — the server stays the authority and rejects with a reason code.
 *
 * - Once responses exist, question types are fixed and the visibility cannot be widened. Keeping the
 *   already-persisted wider value stays selectable so a narrow-then-restore edit is possible.
 * - Switching to one response per person is blocked while any loaded respondent holds several.
 * - When the viewer cannot read every response nothing is locked client-side.
 */
export const deriveFormEditLocks = ({
  questionIds,
  persisted,
  canReadAll,
  total,
  respondentIds,
}: DeriveInput): FormEditLocks => {
  const hasResponses = canReadAll && total > 0;

  const counts = new Map<string, number>();
  for (const id of respondentIds) {
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }
  const anyMemberHoldsMultiple = canReadAll && [...counts.values()].some(count => count > 1);

  return {
    typeLockedQuestionIds: hasResponses ? questionIds : [],
    canWidenVisibility: !hasResponses || persisted.visibility === 'MEMBERS',
    canSwitchToSingle: !anyMemberHoldsMultiple || persisted.responseMode === 'SINGLE',
  };
};

/** Loads the first page of responses of an existing form and derives the edit locks from it. */
export const useCalloutFormEditLocks = ({
  formId,
  questionIds,
  persisted,
  skip,
}: {
  formId: string | undefined;
  questionIds: string[];
  persisted: FormSettingsValue;
  skip: boolean;
}) => {
  const { data, refetch } = useCalloutFormResponsesQuery({
    variables: { formID: formId ?? '', first: 50 },
    skip: skip || !formId,
    fetchPolicy: 'network-only',
  });
  const responses = data?.lookup.calloutFormResponses;

  const locks = deriveFormEditLocks({
    questionIds,
    persisted,
    canReadAll: responses?.canReadAll ?? false,
    total: responses?.all.total ?? 0,
    respondentIds: responses?.all.responses.map(response => response.createdBy?.id) ?? [],
  });

  return { locks, refetch };
};
