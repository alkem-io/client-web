import { ApolloClient, ApolloLink, ApolloProvider, Observable, type Operation } from '@apollo/client';
import { renderHook } from '@testing-library/react';
import type { PropsWithChildren } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => vi.fn() }));
vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => ({ integration: { iframeAllowedUrls: [] } }),
}));

import { createV2Cache } from '@/core/apollo/v2/createV2ApolloClient';
import { useNativeMarkdownUpload } from './useNativeMarkdownUpload';

const setup = () => {
  const operations: Operation[] = [];
  const link = new ApolloLink(
    operation =>
      new Observable(observer => {
        operations.push(operation);
        observer.next({
          data: {
            requestUpload: { __typename: 'UploadToken', token: 'tok', url: 'https://files.test/api/storage/b/files' },
          },
        });
        observer.complete();
      })
  );
  const client = new ApolloClient({ cache: createV2Cache(), link });
  const wrapper = ({ children }: PropsWithChildren) => <ApolloProvider client={client}>{children}</ApolloProvider>;
  return { operations, wrapper };
};

describe('useNativeMarkdownUpload', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('uploads an inline image on the owner with role inline and inserts its /api/files URL', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValue(new Response(JSON.stringify({ id: 'file-9', mime: 'image/png', size: 2, reused: false })));
    vi.stubGlobal('fetch', fetchMock);
    const { operations, wrapper } = setup();
    const { result } = renderHook(() => useNativeMarkdownUpload('space-1'), { wrapper });

    const url = await result.current.onImageUpload(new File(['ab'], 'pic.png', { type: 'image/png' }));

    expect(operations[0].variables).toEqual({ owner: 'space-1', mime: 'image/png', size: 2, role: 'inline' });
    expect(fetchMock.mock.calls[0][1].headers.Authorization).toBe('Bearer tok');
    expect(url).toBe('/api/files/file-9');
  });

  it('rejects with the upload-error text when the upload is refused', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 503 })));
    const { wrapper } = setup();
    const { result } = renderHook(() => useNativeMarkdownUpload('space-1'), { wrapper });
    await expect(result.current.onImageUpload(new File(['x'], 'p.png', { type: 'image/png' }))).rejects.toThrow(
      'components.file-upload.file-upload-error'
    );
  });
});
