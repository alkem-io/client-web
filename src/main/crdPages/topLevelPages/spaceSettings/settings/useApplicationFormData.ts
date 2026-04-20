import { useState } from 'react';
import {
  refetchRoleSetApplicationFormQuery,
  useRoleSetApplicationFormQuery,
  useUpdateApplicationFormOnRoleSetMutation,
} from '@/core/apollo/generated/apollo-hooks';
import type { ApplicationQuestion } from '@/crd/components/space/settings/ApplicationFormEditor';

export type UseApplicationFormDataResult = {
  description: string;
  questions: ApplicationQuestion[];
  loading: boolean;
  isDirty: boolean;
  canSave: boolean;
  onDescriptionChange: (value: string) => void;
  onQuestionChange: (index: number, value: string) => void;
  onQuestionRequiredChange: (index: number, required: boolean) => void;
  onQuestionAdd: () => void;
  onQuestionDelete: (index: number) => void;
  onQuestionMoveUp: (index: number) => void;
  onQuestionMoveDown: (index: number) => void;
  onSave: () => void;
};

export function useApplicationFormData(roleSetId: string | undefined): UseApplicationFormDataResult {
  const { data: rawData, loading: loadingQuestions } = useRoleSetApplicationFormQuery({
    variables: { roleSetId: roleSetId ?? '' },
    skip: !roleSetId,
  });

  const serverDescription = rawData?.lookup?.roleSet?.applicationForm?.description ?? '';
  const serverQuestions =
    rawData?.lookup?.roleSet?.applicationForm?.questions?.map(q => ({
      question: q.question,
      required: q.required,
      sortOrder: q.sortOrder,
    })) ?? [];

  const sortedServerQuestions = [...serverQuestions].sort((a, b) => a.sortOrder - b.sortOrder);

  const [localDescription, setLocalDescription] = useState<string | null>(null);
  const [localQuestions, setLocalQuestions] = useState<ApplicationQuestion[] | null>(null);

  const description = localDescription ?? serverDescription;
  const questions = localQuestions ?? sortedServerQuestions;

  // Sync from server when data loads
  if (localDescription === null && serverDescription) {
    // Already handled by the fallback above
  }

  const [updateForm, { loading: submitting }] = useUpdateApplicationFormOnRoleSetMutation();

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

  const onSave = () => {
    if (!roleSetId) return;
    const formQuestions = questions.map((q, i) => ({
      question: q.question,
      required: q.required,
      sortOrder: i + 1,
      explanation: '',
      maxLength: 500,
    }));
    void updateForm({
      variables: {
        roleSetId,
        formData: {
          description,
          questions: formQuestions,
        },
      },
      refetchQueries: [refetchRoleSetApplicationFormQuery({ roleSetId })],
      awaitRefetchQueries: true,
    }).then(() => {
      setLocalDescription(null);
      setLocalQuestions(null);
    });
  };

  return {
    description,
    questions,
    loading: loadingQuestions || submitting,
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
  };
}
