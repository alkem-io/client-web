import { act, renderHook } from '@testing-library/react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import type { FormQuestionView } from '@/crd/components/callout/calloutFormTypes';
import { useFormResponsesCsvExport } from './useFormResponsesCsvExport';

const query = vi.fn();
const notify = vi.fn();

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useCalloutFormResponsesLazyQuery: () => [query],
}));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => notify }));
vi.mock('@/core/logging/sentry/log', () => ({ error: vi.fn() }));
vi.mock('@/core/utils/csv/downloadCsv', () => ({ downloadCsv: vi.fn() }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

import { downloadCsv } from '@/core/utils/csv/downloadCsv';

const questions: FormQuestionView[] = [{ id: 'q1', prompt: 'Name', type: 'SHORT_TEXT', required: false, options: [] }];

const response = (id: string, name: string) => ({
  id,
  createdDate: new Date('2026-10-01T09:30:00Z'),
  createdBy: { id: `u-${id}`, profile: { id: `p-${id}`, displayName: name, url: '' } },
  answers: [{ questionID: 'q1', prompt: 'Name', type: 'SHORT_TEXT', text: name, selectedOptions: [] }],
});

const page = (responses: unknown[], hasNextPage: boolean, endCursor: string | null) => ({
  data: { lookup: { calloutFormResponses: { all: { total: 3, pageInfo: { hasNextPage, endCursor }, responses } } } },
});

describe('useFormResponsesCsvExport', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('reads every page bypassing the cache and downloads one CSV with all responses', async () => {
    query
      .mockResolvedValueOnce(page([response('r1', 'Ada'), response('r2', 'Bob')], true, 'r2'))
      .mockResolvedValueOnce(page([response('r3', 'Cy')], false, 'r3'));
    const { result } = renderHook(() => useFormResponsesCsvExport({ formId: 'f1', formTitle: 'Q4 plan', questions }));

    await act(() => result.current.exportCsv());

    expect(query).toHaveBeenCalledTimes(2);
    expect(query.mock.calls[0][0]).toMatchObject({ variables: { formID: 'f1', first: 50 }, fetchPolicy: 'no-cache' });
    expect(query.mock.calls[1][0]).toMatchObject({ variables: { formID: 'f1', first: 50, after: 'r2' } });
    const [csv, filename] = vi.mocked(downloadCsv).mock.calls[0];
    expect(csv.split('\r\n').filter(Boolean)).toHaveLength(4);
    expect(csv).toContain('Cy');
    expect(filename).toMatch(/^q4-plan-responses-\d{4}-\d{2}-\d{2}\.csv$/);
    expect(result.current.exporting).toBe(false);
  });

  test('a cursor that does not advance fails the export instead of downloading a partial file', async () => {
    query.mockResolvedValue(page([response('r1', 'Ada')], true, 'same'));
    const { result } = renderHook(() => useFormResponsesCsvExport({ formId: 'f1', formTitle: 'Q4', questions }));

    await act(() => result.current.exportCsv());

    expect(query).toHaveBeenCalledTimes(2);
    expect(downloadCsv).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith('formResponses.exportFailed', 'error');
  });

  test('more pages announced without a cursor fails the export', async () => {
    query.mockResolvedValueOnce(page([response('r1', 'Ada')], true, null));
    const { result } = renderHook(() => useFormResponsesCsvExport({ formId: 'f1', formTitle: 'Q4', questions }));

    await act(() => result.current.exportCsv());

    expect(query).toHaveBeenCalledTimes(1);
    expect(downloadCsv).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith('formResponses.exportFailed', 'error');
  });

  test('an Apollo error resolved on the result (not thrown) fails the export instead of downloading', async () => {
    query.mockResolvedValueOnce({ data: undefined, error: new Error('graphql failure') });
    const { result } = renderHook(() => useFormResponsesCsvExport({ formId: 'f1', formTitle: 'Q4', questions }));

    await act(() => result.current.exportCsv());

    expect(downloadCsv).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith('formResponses.exportFailed', 'error');
    expect(result.current.exporting).toBe(false);
  });

  test('a failed read notifies and downloads nothing', async () => {
    query.mockRejectedValueOnce(new Error('boom'));
    const { result } = renderHook(() => useFormResponsesCsvExport({ formId: 'f1', formTitle: 'Q4', questions }));

    await act(() => result.current.exportCsv());

    expect(downloadCsv).not.toHaveBeenCalled();
    expect(notify).toHaveBeenCalledWith('formResponses.exportFailed', 'error');
    expect(result.current.exporting).toBe(false);
  });
});
