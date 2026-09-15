import { act, render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SigningAttemptStatus, type UrlType } from '@/core/apollo/generated/graphql-schema';
import type { UrlResolverContextValue } from '@/main/routing/urlResolver/UrlResolverProvider';
import { UrlResolverContext, UrlResolverProvider } from '@/main/routing/urlResolver/UrlResolverProvider';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { MemoSigningReturnProvider } from './MemoSigningReturnContext';
import { MemoSigningReturnDialogConnector } from './MemoSigningReturnDialogConnector';

const state = vi.hoisted(() => ({
  attemptQuery: vi.fn(),
  urlResolverQuery: vi.fn(),
  urlResolverLoading: false,
}));

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    i18n: { language: 'en' },
  }),
}));

vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUrlResolverQuery: (options: { skip: boolean; variables: { url: string } }) => {
    state.urlResolverQuery(options);
    return { data: undefined, error: undefined, loading: state.urlResolverLoading };
  },
  useMemoSigningAttemptQuery: (options: { variables: { attemptID: string }; skip: boolean }) => {
    state.attemptQuery(options);
    return options.skip
      ? { data: undefined, loading: false, error: undefined }
      : {
          data: {
            signingAttempt: {
              id: options.variables.attemptID,
              status: SigningAttemptStatus.Signed,
              document: {
                id: 'signed-document-1',
                url: '/api/private/signed-document-1',
                displayName: 'Signed decision.pdf',
              },
              actor: { profile: { displayName: 'Alice Example', url: '/user/alice' } },
              updatedDate: '2026-09-14T09:00:00.000Z',
            },
          },
          loading: false,
          error: undefined,
        };
  },
}));

vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => ({
    loading: false,
    userModel: { id: 'user-1' },
  }),
}));

vi.mock('@/main/crdPages/memo/useMemoSignatureActions', () => ({
  useMemoSignatureActions: () => ({
    verificationFor: () => undefined,
    verify: vi.fn(),
    download: vi.fn(),
    downloadingDocumentIds: [],
    verifyDisabled: false,
  }),
}));

vi.mock('@/crd/components/memo/MemoSigningDialog', () => ({
  MemoSigningDialog: ({ open }: { open: boolean }) =>
    open ? <div role="dialog" aria-label="memo signing return" /> : null,
}));

const resolverValue = ({
  providerPresent,
  resolutionComplete,
  loading,
  calloutId,
}: {
  providerPresent: boolean;
  resolutionComplete: boolean;
  loading: boolean;
  calloutId?: string;
}) =>
  ({
    type: undefined as UrlType | undefined,
    spaceId: undefined,
    spaceLevel: undefined,
    levelZeroSpaceId: undefined,
    spaceHierarchyPath: [],
    parentSpaceId: undefined,
    collaborationId: undefined,
    calloutsSetId: undefined,
    calloutId,
    contributionId: undefined,
    postId: undefined,
    whiteboardId: undefined,
    calendarId: undefined,
    calendarEventId: undefined,
    organizationId: undefined,
    userId: undefined,
    vcId: undefined,
    discussionId: undefined,
    innovationPackId: undefined,
    templatesSetId: undefined,
    templateId: undefined,
    innovationHubId: undefined,
    loading,
    providerPresent,
    resolutionComplete,
  }) as UrlResolverContextValue;

const ResolverState = () => {
  const { loading, providerPresent, resolutionComplete } = useUrlResolver();
  return <span data-testid="resolver-state">{`${providerPresent}:${loading}:${resolutionComplete}`}</span>;
};

const renderConnector = (resolver?: UrlResolverContextValue) => {
  const connector = (
    <BrowserRouter>
      <MemoSigningReturnProvider>
        <ResolverState />
        <MemoSigningReturnDialogConnector />
      </MemoSigningReturnProvider>
    </BrowserRouter>
  );

  return render(resolver ? <UrlResolverContext value={resolver}>{connector}</UrlResolverContext> : connector);
};

const expectAttemptNotStarted = async () => {
  await waitFor(() => expect(globalThis.location.search).toBe(''));
  expect(screen.queryByRole('dialog', { name: 'memo signing return' })).not.toBeInTheDocument();
  expect(state.attemptQuery).not.toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
};

describe('MemoSigningReturnDialogConnector URL-resolver presence', () => {
  beforeEach(() => {
    state.attemptQuery.mockClear();
    state.urlResolverQuery.mockClear();
    state.urlResolverLoading = false;
    window.sessionStorage.clear();
    globalThis.history.replaceState(null, '', '/dashboard?signingAttemptId=attempt-1');
  });

  it('self-settles when mounted outside UrlResolverProvider without changing the default loading state', async () => {
    renderConnector();

    expect(screen.getByTestId('resolver-state')).toHaveTextContent('false:true:false');
    expect(await screen.findByRole('dialog', { name: 'memo signing return' })).toBeInTheDocument();
    expect(state.attemptQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
  });

  it('self-settles when the actual provider deliberately skips the user profile route', async () => {
    globalThis.history.replaceState(null, '', '/user/me?signingAttemptId=attempt-1');

    render(
      <BrowserRouter>
        <UrlResolverProvider>
          <MemoSigningReturnProvider>
            <ResolverState />
            <MemoSigningReturnDialogConnector />
          </MemoSigningReturnProvider>
        </UrlResolverProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(globalThis.location.search).toBe(''));
    expect(screen.getByTestId('resolver-state')).toHaveTextContent('true:false:true');
    expect(await screen.findByRole('dialog', { name: 'memo signing return' })).toBeInTheDocument();
    expect(state.urlResolverQuery).not.toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
    expect(state.attemptQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
  });

  it('waits while a mounted URL resolver is loading', async () => {
    renderConnector(resolverValue({ providerPresent: true, resolutionComplete: false, loading: true }));

    await expectAttemptNotStarted();
  });

  it('waits for the route child when a mounted URL resolver identifies a callout', async () => {
    renderConnector(
      resolverValue({ providerPresent: true, resolutionComplete: true, loading: false, calloutId: 'callout-1' })
    );

    await expectAttemptNotStarted();
  });

  it('self-settles when a mounted URL resolver settles without a callout', async () => {
    renderConnector(resolverValue({ providerPresent: true, resolutionComplete: true, loading: false }));

    expect(await screen.findByRole('dialog', { name: 'memo signing return' })).toBeInTheDocument();
    expect(state.attemptQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: false }));
  });

  it('waits through an actual provider request and self-settles when the URL completes without a result', async () => {
    globalThis.history.replaceState(null, '', '/space/collaboration/callout-1?signingAttemptId=attempt-1');
    state.urlResolverLoading = true;
    const view = render(
      <BrowserRouter>
        <UrlResolverProvider>
          <MemoSigningReturnProvider>
            <ResolverState />
            <MemoSigningReturnDialogConnector />
          </MemoSigningReturnProvider>
        </UrlResolverProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(state.urlResolverQuery).toHaveBeenCalledWith(expect.objectContaining({ skip: false })));
    await waitFor(() => expect(screen.getByTestId('resolver-state')).toHaveTextContent('true:false:false'));
    expect(screen.queryByRole('dialog', { name: 'memo signing return' })).not.toBeInTheDocument();

    state.urlResolverLoading = false;
    view.rerender(
      <BrowserRouter>
        <UrlResolverProvider>
          <MemoSigningReturnProvider>
            <ResolverState />
            <MemoSigningReturnDialogConnector />
          </MemoSigningReturnProvider>
        </UrlResolverProvider>
      </BrowserRouter>
    );

    expect(await screen.findByRole('dialog', { name: 'memo signing return' })).toBeInTheDocument();
    expect(screen.getByTestId('resolver-state')).toHaveTextContent('true:true:true');
  });

  it('clears a cached completed resolution while the actual provider resolves a new URL', async () => {
    const view = render(
      <BrowserRouter>
        <UrlResolverProvider>
          <ResolverState />
        </UrlResolverProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByTestId('resolver-state')).toHaveTextContent('true:true:true'));

    await act(() => {
      state.urlResolverLoading = true;
      globalThis.history.pushState(null, '', '/space/collaboration/callout-2');
    });
    view.rerender(
      <BrowserRouter>
        <UrlResolverProvider>
          <ResolverState />
        </UrlResolverProvider>
      </BrowserRouter>
    );

    await waitFor(() => expect(screen.getByTestId('resolver-state')).toHaveTextContent('true:false:false'));
  });
});
