import { ApolloError } from '@apollo/client';
import { useState } from 'react';
import { NotFoundError } from '@/core/40XErrorHandler/40XErrors';
import {
  useSpaceSettingsApplicationFormQuery,
  useSpaceSettingsUpdateApplicationFormMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type { SpaceSettingsApplicationFormQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { useApolloErrorHandler } from '@/core/apollo/hooks/useApolloErrorHandler';
import type { ApplicationQuestion } from '@/crd/components/space/settings/ApplicationFormEditor';

type FormSpace = Extract<NonNullable<SpaceSettingsApplicationFormQuery['node']>, { __typename?: 'Space' }>;

/** core.application_form, the one form store (surface.graphql:171). */
type NativeApplicationForm = {
  description?: string | null;
  questions?: Array<{
    question: string;
    explanation?: string | null;
    required: boolean;
    max_length?: number | null;
    sort_order: number;
  }>;
};

export type UseApplicationFormDataResult = {
  description: string;
  questions: ApplicationQuestion[];
  loading: boolean;
  /** The save mutation is in flight. */
  submitting: boolean;
  isDirty: boolean;
  canSave: boolean;
  onDescriptionChange: (value: string) => void;
  onQuestionChange: (index: number, value: string) => void;
  onQuestionRequiredChange: (index: number, required: boolean) => void;
  onQuestionAdd: () => void;
  onQuestionDelete: (index: number) => void;
  onQuestionMoveUp: (index: number) => void;
  onQuestionMoveDown: (index: number) => void;
  /** Resolves once the form is saved (the mutation returns the stored form); rejects on failure. */
  onSave: () => Promise<void>;
  onReset: () => void;
};

export function useApplicationFormData(spaceId: string | undefined): UseApplicationFormDataResult {
  const {
    data,
    loading: loadingQuestions,
    error: queryError,
  } = useSpaceSettingsApplicationFormQuery({
    variables: { id: spaceId ?? '' },
    skip: !spaceId,
  });
  if (spaceId && queryError) throw queryError;
  if (spaceId && data && !loadingQuestions && !data.node) throw new NotFoundError();

  const node = data?.node;
  const space = node && node.id === spaceId && node.entityType === 'space' ? (node as FormSpace) : undefined;
  const serverForm = (space?.applicationForm ?? {}) as NativeApplicationForm;
  const serverDescription = serverForm.description ?? '';
  const serverQuestions = (serverForm.questions ?? []).map(q => ({
    question: q.question,
    required: q.required,
    sortOrder: q.sort_order,
  }));

  const sortedServerQuestions = [...serverQuestions].sort((a, b) => a.sortOrder - b.sortOrder);

  const [localDescription, setLocalDescription] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<ApplicationQuestion[] | null>(null);

  const description = localDescription ?? serverDescription;
  const questions = localQuestions ?? sortedServerQuestions;

  const [updateForm, { loading: submitting }] = useSpaceSettingsUpdateApplicationFormMutation();
  const handleError = useApolloErrorHandler();

  const hasEmptyQuestions = questions.some(q => !q.question.trim());
  const isDirty = localDescription !== null || localQuestions !== null;
  const canSave = isDirty && !hasEmptyQuestions && !submitting;

  const onDescriptionChange = (value: string) => setLocalDescription(value);

  const onQuestionChange = (index: number, value: string) => {
    const next = [...questions];
    next[index] = { ...next[index], question: value };
    setLocalQuestions(next);
  };

  const onQuestionRequiredChange = (index: number, required: boolean) => {
    const next = [...questions];
    next[index] = { ...next[index], required };
    setLocalQuestions(next);
  };

  const onQuestionAdd = () => {
    const maxOrder = questions.reduce((max, q) => Math.max(max, q.sortOrder), 0);
    setLocalQuestions([...questions, { question: '', required: false, sortOrder: maxOrder + 1 }]);
  };

  const onQuestionDelete = (index: number) => {
    const next = [...questions];
    next.splice(index, 1);
    setLocalQuestions(next);
  };

  const onQuestionMoveUp = (index: number) => {
    if (index === 0) return;
    const next = [...questions];
    const prevOrder = next[index - 1].sortOrder;
    next[index - 1] = { ...next[index - 1], sortOrder: next[index].sortOrder };
    next[index] = { ...next[index], sortOrder: prevOrder };
    const swapped = [...next.slice(0, index - 1), next[index], next[index - 1], ...next.slice(index + 1)];
    setLocalQuestions(swapped);
  };

  const onQuestionMoveDown = (index: number) => {
    if (index >= questions.length - 1) return;
    onQuestionMoveUp(index + 1);
  };

  const onSave = async () => {
    if (!spaceId) return;
    // The editor keeps the fields it always wrote: an empty explanation and a 500-character answer limit.
    const applicationForm: NativeApplicationForm = {
      description,
      questions: questions.map((q, i) => ({
        question: q.question,
        explanation: '',
        required: q.required,
        max_length: 500,
        sort_order: i + 1,
      })),
    };
    try {
      // updateSpace returns the stored form, which replaces the cached one.
      await updateForm({ variables: { id: spaceId, applicationForm } });
    } catch (err) {
      if (err instanceof ApolloError) handleError(err);
      throw err;
    }
    setLocalDescription(null);
    setLocalQuestions(null);
  };

  const onReset = () => {
    setLocalDescription(null);
    setLocalQuestions(null);
  };

  return {
    description,
    questions,
    loading: loadingQuestions || submitting,
    submitting,
    isDirty,
    canSave,
    onDescriptionChange,
    onQuestionChange,
    onQuestionRequiredChange,
    onQuestionAdd,
    onQuestionDelete,
    onQuestionMoveUp,
    onQuestionMoveDown,
    onSave,
    onReset,
  };
}
