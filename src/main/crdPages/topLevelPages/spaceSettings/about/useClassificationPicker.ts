import { useTranslation } from 'react-i18next';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { ClassificationPickerSource } from '@/crd/components/classification/ClassificationPickerDialog';

export type UseClassificationPickerResult = {
  open: boolean;
  openPicker: () => void;
  closePicker: () => void;
  sources: ClassificationPickerSource[];
};

/**
 * Step A picker of the About tab's classifications (FR-007). The native API has no designed read of a
 * CLASSIFICATION template's values: Template.body is a Node, and that template's body is a choice set
 * (templates.md §4.1) — a design hole sent to the seed lead (spaces lead 2026-11-25). Until it is designed,
 * opening the picker shows the existing "feature not enabled" notice and reads nothing, never the legacy API.
 * Existing classifications are still shown and edited through Space.classifications (useAboutTabData).
 */
export function useClassificationPicker(_levelZeroSpaceId: string | undefined): UseClassificationPickerResult {
  const { t } = useTranslation();
  const notify = useNotification();
  return {
    open: false,
    openPicker: () => notify(t('apollo.errors.userMessages.operations.notEnabled'), 'error'),
    closePicker: () => undefined,
    sources: [],
  };
}
