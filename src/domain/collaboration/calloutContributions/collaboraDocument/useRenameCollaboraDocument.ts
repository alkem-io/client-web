import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useUpdateCollaboraDocumentMutation } from '@/core/apollo/generated/apollo-hooks';
import { SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';

/** Minimum display-name length — matches `displayNameValidator`. */
const MIN_LENGTH = 3;

// Rule-of-truth: the same validator used for whiteboard/memo display names
// (non-blank, min 3, max SMALL_TEXT_LENGTH). We use it for the authoritative
// validity check and derive a specific, translated message for the UI.
const validator = displayNameValidator({ required: true });

export type UseRenameCollaboraDocumentArgs = {
  collaboraDocumentId: string;
  /** Current persisted display name (seed + unchanged-check). */
  displayName: string;
  /** Whether the current user may rename (document OR callout Update privilege). */
  canRename: boolean;
};

/**
 * Rename mechanics for a Collabora (OfficeDocs) document — draft/editing/saving
 * state, validation with the shared display-name rules, an unchanged no-op, and
 * persistence via the existing `updateCollaboraDocument` mutation. Backs the inline
 * `CollaboraDocumentDisplayName` control on the editor header and the callout edit
 * dialog's document box, and is reusable for future contribution surfaces.
 */
export function useRenameCollaboraDocument({
  collaboraDocumentId,
  displayName,
  canRename,
}: UseRenameCollaboraDocumentArgs) {
  const { t } = useTranslation('crd-space');
  const [updateCollaboraDocument, { loading: saving }] = useUpdateCollaboraDocumentMutation();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');
  const [error, setError] = useState<string | null>(null);

  const startEdit = () => {
    setDraft(displayName);
    setError(null);
    setEditing(true);
  };

  const changeDraft = (value: string) => {
    setDraft(value);
    if (error) {
      setError(null);
    }
  };

  const cancel = () => {
    setEditing(false);
    setError(null);
  };

  const validate = (value: string): string | null => {
    if (!value || /^\s*$/.test(value)) {
      return t('collabora.rename.errors.blank');
    }
    if (value.length < MIN_LENGTH) {
      return t('collabora.rename.errors.tooShort', { min: MIN_LENGTH });
    }
    if (value.length > SMALL_TEXT_LENGTH) {
      return t('collabora.rename.errors.tooLong', { max: SMALL_TEXT_LENGTH });
    }
    if (!validator.isValidSync(value)) {
      return t('collabora.rename.errors.invalid');
    }
    return null;
  };

  /** Returns true when the rename resolved (persisted or unchanged), false on validation/save error. */
  const save = async (): Promise<boolean> => {
    const trimmed = draft.trim();
    // Unchanged after trim → no-op (mirrors whiteboard/memo rename).
    if (trimmed === displayName) {
      setEditing(false);
      setError(null);
      return true;
    }
    const validationError = validate(trimmed);
    if (validationError) {
      setError(validationError);
      return false;
    }
    try {
      await updateCollaboraDocument({
        variables: { updateData: { ID: collaboraDocumentId, displayName: trimmed } },
      });
      setEditing(false);
      setError(null);
      return true;
    } catch {
      // Keep the persisted name; surface a save error (FR-013).
      setError(t('collabora.rename.errors.saveFailed'));
      return false;
    }
  };

  return {
    editing,
    draft,
    saving,
    error,
    readOnly: !canRename,
    startEdit,
    changeDraft,
    save,
    cancel,
  };
}

/** Return shape of {@link useRenameCollaboraDocument}, for threading it to a child. */
export type UseRenameCollaboraDocumentResult = ReturnType<typeof useRenameCollaboraDocument>;
