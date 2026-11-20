import type { FormResponseExportRow, FormResponsesExportHeader } from '@/core/utils/csv/csvExport';
import { answerDisplayValue, deriveFormColumns } from '@/crd/components/callout/calloutFormColumns';
import type { FormQuestionView, FormResponseView } from '@/crd/components/callout/calloutFormTypes';

type FormResponsesCsvLabels = {
  submitter: string;
  submittedDate: string;
  removedQuestion: string;
  deletedUser: string;
};

const toIsoDate = (value: Date | string): string => {
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
};

/**
 * The rows of a Form responses CSV, with the same columns as the review table: the live questions in their
 * current order, then the removed questions that still hold answers (labelled as removed). Choice answers are
 * exported by option label; a deleted submitter is exported as the deleted-user label.
 */
export const mapFormResponsesToCsv = (
  questions: FormQuestionView[],
  responses: FormResponseView[],
  labels: FormResponsesCsvLabels
): { header: FormResponsesExportHeader; rows: FormResponseExportRow[] } => {
  const columns = deriveFormColumns(questions, responses);
  return {
    header: {
      submitter: labels.submitter,
      submittedDate: labels.submittedDate,
      questions: columns.map(column =>
        column.removed ? `${column.prompt} (${labels.removedQuestion})` : column.prompt
      ),
    },
    rows: responses.map(response => ({
      submitter: response.respondent?.name || labels.deletedUser,
      submittedDate: toIsoDate(response.createdDate),
      answers: columns.map(
        column => answerDisplayValue(response.answers.find(answer => answer.questionID === column.questionID)) ?? ''
      ),
    })),
  };
};
