import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCalloutFormResponsesLazyQuery } from '@/core/apollo/generated/apollo-hooks';
import { error as logError } from '@/core/logging/sentry/log';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { buildCsvFilename, buildFormResponsesCsv } from '@/core/utils/csv/csvExport';
import { downloadCsv } from '@/core/utils/csv/downloadCsv';
import type { FormQuestionView } from '@/crd/components/callout/calloutFormTypes';
import type { CalloutFormResponseModel } from '@/domain/collaboration/callout-form/models/CalloutFormModels';
import { mapFormResponseToView } from './calloutFormResponseMapper';
import { mapFormResponsesToCsv } from './calloutFormResponsesCsv';

/** The server's page maximum (FORM_RESPONSES_PAGE_MAX). */
const EXPORT_PAGE_SIZE = 50;

type UseFormResponsesCsvExportParams = {
  formId: string;
  formTitle: string;
  questions: FormQuestionView[];
};

/**
 * Downloads every response of a Form as CSV. All pages are read through the same root lookup the review uses,
 * bypassing the cache so the review table's own pages are left untouched.
 */
export function useFormResponsesCsvExport({ formId, formTitle, questions }: UseFormResponsesCsvExportParams) {
  const { t } = useTranslation('crd-space');
  const [fetchResponsesPage] = useCalloutFormResponsesLazyQuery();
  const notify = useNotification();
  const [exporting, setExporting] = useState(false);

  const fetchAllResponses = async (): Promise<CalloutFormResponseModel[]> => {
    const responses: CalloutFormResponseModel[] = [];
    let after: string | undefined;
    do {
      // The lazy execute promise resolves (rather than rejects) on a GraphQL/network error, so surface it explicitly.
      const { data, error } = await fetchResponsesPage({
        variables: { formID: formId, first: EXPORT_PAGE_SIZE, after },
        fetchPolicy: 'no-cache',
      });
      if (error || !data) {
        throw error ?? new Error('Form responses page returned no data');
      }
      const page = data.lookup.calloutFormResponses.all;
      responses.push(...page.responses);
      const next = page.pageInfo.hasNextPage ? (page.pageInfo.endCursor ?? undefined) : undefined;
      // More pages but no new cursor: never hand out a silently truncated export.
      if (page.pageInfo.hasNextPage && (!next || next === after)) {
        throw new Error('Form responses pagination cursor did not advance');
      }
      after = next;
    } while (after);
    return responses;
  };

  const exportCsv = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const responses = await fetchAllResponses();
      const { header, rows } = mapFormResponsesToCsv(questions, responses.map(mapFormResponseToView), {
        submitter: t('formResponses.csv.submitter'),
        submittedDate: t('formResponses.csv.submittedDate'),
        removedQuestion: t('formResponses.removedQuestion'),
        deletedUser: t('formResponses.deletedUser'),
      });
      downloadCsv(buildFormResponsesCsv(header, rows), buildCsvFilename(formTitle, 'responses', new Date(), 'form'));
    } catch (err) {
      logError(new Error('Form responses CSV export failed', { cause: err as Error }));
      notify(t('formResponses.exportFailed'), 'error');
    } finally {
      setExporting(false);
    }
  };

  return { exportCsv, exporting };
}
