import { useRef } from 'react';
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
import {
  applyPollOptionDiff,
  type PollOptionBefore,
  type PollOptionDiffProgress,
} from '@/main/crdPages/space/hooks/useCrdCalloutPollOptionDiff';

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
  // The poll as the server holds it after a save that failed part-way. The dialog stays open for a
  // retry, and `initialValues` is the stale pre-edit snapshot, so diffing against it would re-add
  // options that were added and re-remove ones already gone. Tied to the `initialValues` it was
  // taken against, so reopening the dialog starts from a clean slate.
  const retryBaseline = useRef<{ initial: unknown; before: PollOptionBefore[] } | null>(null);

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
    const resumed = retryBaseline.current?.initial === initialValues ? retryBaseline.current.before : undefined;
    const before =
      resumed ?? initialValues.pollOptions.flatMap(option => (option.id ? [{ id: option.id, text: option.text }] : []));
    let progress: PollOptionDiffProgress | undefined;
    try {
      await applyPollOptionDiff(pollMgmt, before, values.pollOptions, state => {
        progress = state;
      });
      retryBaseline.current = null;
    } catch (err) {
      if (progress) {
        // Keep what succeeded: the next attempt diffs against the server's state, and the options
        // added so far carry their server ids in the form instead of being added again.
        retryBaseline.current = { initial: initialValues, before: progress.before };
        form.setField('pollOptions', progress.after);
      }
      logError(new Error('Callout template poll option save failed', { cause: err as Error }));
      notify(t('callout.pollOptionsSaveFailed'), 'error');
      throw err;
    }
  };

  return { saveFormDefinition, savePollOptions };
};
