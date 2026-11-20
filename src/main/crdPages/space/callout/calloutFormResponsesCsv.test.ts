import { describe, expect, test } from 'vitest';
import type { FormQuestionView, FormResponseView } from '@/crd/components/callout/calloutFormTypes';
import { mapFormResponsesToCsv } from './calloutFormResponsesCsv';

const labels = {
  submitter: 'Submitted by',
  submittedDate: 'Submitted on',
  removedQuestion: 'removed question',
  deletedUser: 'Deleted user',
};

const questions: FormQuestionView[] = [
  { id: 'q1', prompt: 'Name', type: 'SHORT_TEXT', required: true, options: [] },
  {
    id: 'q2',
    prompt: 'Toppings',
    type: 'MULTIPLE_CHOICE',
    required: false,
    options: [
      { id: 'o1', label: 'Cheese' },
      { id: 'o2', label: 'Ham' },
    ],
  },
];

const responses: FormResponseView[] = [
  {
    id: 'r1',
    createdDate: new Date('2026-10-01T09:30:00Z'),
    respondent: { id: 'u1', name: 'Ada' },
    answers: [
      { questionID: 'q1', prompt: 'Name', type: 'SHORT_TEXT', text: 'Ada L', selectedLabels: [] },
      { questionID: 'q2', prompt: 'Toppings', type: 'MULTIPLE_CHOICE', selectedLabels: ['Cheese', 'Ham'] },
    ],
  },
  {
    id: 'r2',
    createdDate: '2026-10-02T10:00:00.000Z',
    respondent: null,
    answers: [{ questionID: 'qx', prompt: 'Old question', type: 'LONG_TEXT', text: 'old answer', selectedLabels: [] }],
  },
];

describe('mapFormResponsesToCsv', () => {
  test('header: submitter, date, live questions, then removed questions that still hold answers', () => {
    const { header } = mapFormResponsesToCsv(questions, responses, labels);
    expect(header).toEqual({
      submitter: 'Submitted by',
      submittedDate: 'Submitted on',
      questions: ['Name', 'Toppings', 'Old question (removed question)'],
    });
  });

  test('rows: choice answers by option label, ISO dates, empty cells for unanswered questions', () => {
    const { rows } = mapFormResponsesToCsv(questions, responses, labels);
    expect(rows[0]).toEqual({
      submitter: 'Ada',
      submittedDate: '2026-10-01T09:30:00.000Z',
      answers: ['Ada L', 'Cheese, Ham', ''],
    });
    expect(rows[1].answers).toEqual(['', '', 'old answer']);
  });

  test('a deleted submitter is exported as the deleted-user label', () => {
    const { rows } = mapFormResponsesToCsv(questions, responses, labels);
    expect(rows[1].submitter).toBe('Deleted user');
  });

  test('no responses: the live questions only', () => {
    const result = mapFormResponsesToCsv(questions, [], labels);
    expect(result.header.questions).toEqual(['Name', 'Toppings']);
    expect(result.rows).toEqual([]);
  });
});
