import { useTranslation } from 'react-i18next';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { usePollOptionManagement } from '@/domain/collaboration/poll/hooks/usePollOptionManagement';
import { formDefinitionChanged } from '@/main/crdPages/space/callout/calloutFormDefinitionMapper';
import {
  translateFormDefinitionError,
  useCalloutFormDefinitionSave,
} from '@/main/crdPages/space/callout/useCalloutFormDefinitionSave';
import type { UseCrdCalloutFormResult } from '@/main/crdPages/space/hooks/useCrdCalloutForm';
import { applyPollOptionDiff } from '@/main/crdPages/space/hooks/useCrdCalloutPollOptionDiff';

/**
 * The parts of an edited Poll or Form callout template that `updateCallout` does not carry:
 * the Form definition (saved through `updateCalloutForm`) and the poll options (saved through
 * the poll-option mutations; `updateCallout` only takes the poll title). Same paths as the live
 * Post editor. Each step notifies the localized reason and rethrows on failure, so the template
 * dialog stays open.
 */
export const useCalloutTemplateFramingSave = (form: UseCrdCalloutFormResult) => {
  const { t } = useTranslation('crd-space');
  const notify = useNotification();
  const { save } = useCalloutFormDefinitionSave();
  const pollMgmt = usePollOptionManagement({ pollId: form.values.editMeta?.pollId ?? '' });

  /** Run before `updateCallout`, so a rejected definition leaves the template untouched. */
  const saveFormDefinition = async () => {
    const { values, initialValues } = form;
    const formId = values.editMeta?.formId;
    if (values.framingChip !== 'form' || !formId || !formDefinitionChanged(values, initialValues)) return;
    const outcome = await save(
      formId,
      {
        title: values.formTitle,
        description: values.formDescription,
        questions: values.formQuestions,
        settings: values.formSettings,
      },
      {
        title: initialValues.formTitle,
        description: initialValues.formDescription,
        questions: initialValues.formQuestions,
      }
    );
    if (!outcome.ok) {
      logError(new Error('Callout template form definition save failed', { cause: outcome.error as Error }));
      notify(translateFormDefinitionError(outcome.code, t), 'error');
      throw outcome.error;
    }
  };

  const savePollOptions = async () => {
    const { values, initialValues } = form;
    if (values.framingChip !== 'poll' || !values.editMeta?.pollId) return;
    const before = initialValues.pollOptions.flatMap(option =>
      option.id ? [{ id: option.id, text: option.text }] : []
    );
    try {
      await applyPollOptionDiff(pollMgmt, before, values.pollOptions);
    } catch (err) {
      logError(new Error('Callout template poll option save failed', { cause: err as Error }));
      notify(t('callout.pollOptionsSaveFailed'), 'error');
      throw err;
    }
  };

  return { saveFormDefinition, savePollOptions };
};
