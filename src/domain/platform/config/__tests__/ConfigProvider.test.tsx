import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import queryRequest from '@/core/http/queryRequest';
import { warn as logWarn } from '@/core/logging/sentry/log';
import { ConfigProvider } from '../ConfigProvider';

vi.mock('@/core/http/queryRequest', () => ({ default: vi.fn() }));
vi.mock('@/core/logging/sentry/log', () => ({ warn: vi.fn(), TagCategoryValues: { CONFIG: 'config' } }));
vi.mock('@/main/constants/endpoints', () => ({ platformBaseAddress: 'https://platform.test' }));

const IFRAME = 'iframe[src="https://platform.test/maintenance/unexpected.html"]';

const valid = {
  data: {
    data: {
      platform: {
        configuration: { authentication: { providers: [] } },
        settings: { integration: {} },
        metadata: { services: [] },
      },
    },
  },
};

const graphqlError = { data: { data: null, errors: [{ message: 'db' }] } };

const mockQuery = vi.mocked(queryRequest);

const renderProvider = () =>
  render(
    <ConfigProvider url="https://platform.test/api/public/graphql">
      <p>app</p>
    </ConfigProvider>
  );

const advance = (ms: number) =>
  act(async () => {
    await vi.advanceTimersByTimeAsync(ms);
  });

const iframe = () => document.querySelector(IFRAME);

const expectOffline = () => {
  expect(iframe()).not.toBeNull();
  expect(screen.queryByText('app')).toBeNull();
};

describe('ConfigProvider', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockQuery.mockReset();
    vi.mocked(logWarn).mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  test('two failures 2 s apart show the unexpected page instead of the app', async () => {
    mockQuery.mockRejectedValue(new Error('Network Error'));
    renderProvider();

    await advance(2000);

    expectOffline();
    expect(mockQuery).toHaveBeenCalledTimes(2);
  });

  test('a later re-check that succeeds renders the app and removes the page', async () => {
    mockQuery
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockRejectedValueOnce(new Error('Network Error'))
      .mockResolvedValue(valid as never);
    renderProvider();
    await advance(2000);
    expectOffline();

    await advance(30_000);

    expect(screen.getByText('app')).toBeTruthy();
    expect(iframe()).toBeNull();
  });

  test('one failure followed by success renders the app and never the page', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Network Error')).mockResolvedValue(valid as never);
    renderProvider();

    await advance(0);
    expect(iframe()).toBeNull();
    await advance(2000);

    expect(screen.getByText('app')).toBeTruthy();
    expect(iframe()).toBeNull();
  });

  test('a 404 counts as a failure', async () => {
    mockQuery.mockRejectedValue(
      Object.assign(new Error('Request failed with status code 404'), { isAxiosError: true, response: { status: 404 } })
    );
    renderProvider();

    await advance(2000);

    expectOffline();
  });

  test('a GraphQL error answer without data counts as a failure', async () => {
    mockQuery.mockResolvedValue(graphqlError as never);
    renderProvider();

    await advance(2000);

    expectOffline();
  });

  test('a timeout counts as a failure', async () => {
    mockQuery.mockRejectedValue(
      Object.assign(new Error('timeout of 8000ms exceeded'), { isAxiosError: true, code: 'ECONNABORTED' })
    );
    renderProvider();

    await advance(2000);

    expectOffline();
  });

  test('re-checks keep the page mounted and log only once', async () => {
    mockQuery.mockRejectedValue(new Error('Network Error'));
    renderProvider();
    await advance(2000);
    expectOffline();
    expect(logWarn).toHaveBeenCalledTimes(1);

    let rejectPending: (err: Error) => void = () => {};
    mockQuery.mockImplementationOnce(
      () =>
        new Promise((_, reject) => {
          rejectPending = reject;
        })
    );
    await advance(30_000);

    expect(mockQuery).toHaveBeenCalledTimes(3);
    expectOffline();
    expect(screen.queryByText(/Loading/)).toBeNull();

    await act(async () => {
      rejectPending(new Error('Network Error'));
    });
    await advance(30_000);

    expect(mockQuery).toHaveBeenCalledTimes(4);
    expectOffline();
    expect(logWarn).toHaveBeenCalledTimes(1);
  });
});
