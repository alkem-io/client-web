import { ApolloError } from '@apollo/client';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { GraphQLError } from 'graphql';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, beforeEach, describe, expect, test, vi } from 'vitest';
import '@/core/i18n/config';
import commonEN from '@/crd/i18n/common/common.en.json';

const limitText = commonEN.apollo.errors.userMessages.operations.messageSendLimitReached;

const sendMessageToOrganizationMock = vi.fn();
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useSendMessageToOrganizationMutation: () => [sendMessageToOrganizationMock, { loading: false }],
}));

const toastErrorMock = vi.fn();
const toastSuccessMock = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    error: (...args: unknown[]) => toastErrorMock(...args),
    success: (...args: unknown[]) => toastSuccessMock(...args),
  },
}));

vi.mock('@/core/routing/useNavigate', () => ({ default: () => vi.fn() }));
vi.mock('@/core/routing/usePageTitle', () => ({ usePageTitle: () => {} }));
vi.mock('@/main/ui/breadcrumbs/BreadcrumbsContext', () => ({ useSetBreadcrumbs: () => {} }));
vi.mock('@/main/crdPages/topLevelPages/common/MembershipCardConnector', () => ({
  MembershipCardConnector: () => null,
}));
vi.mock('./OrgApplyDialogConnector', () => ({ OrgApplyDialogConnector: () => null }));

vi.mock('./useCrdOrganizationProfilePageData', () => ({
  useCrdOrganizationProfilePageData: () => ({
    organization: {
      id: 'org-green',
      profile: { displayName: 'Green Future Labs', url: 'https://alkemio.test/green' },
      verification: { status: 'NOT_VERIFIED' },
      metrics: [],
      roleSet: { id: 'roleset-1', applicationForm: undefined, myMembershipStatus: undefined },
      myAssociateEligibility: { reason: undefined, canJoinDirectly: false },
    },
    provided: {
      contributions: [],
      permissions: { canEdit: false, canReadUsers: false },
      keywords: [],
      capabilities: [],
      references: [],
      associates: [],
    },
    isAuthenticated: true,
    loadingMe: false,
    accountResources: undefined,
    loading: { context: false, provider: false, account: false },
    refreshOrganization: vi.fn(),
  }),
}));

vi.mock('./useOrganizationAssociateAction', () => ({
  useOrganizationAssociateAction: () => ({
    action: 'none',
    loading: false,
    onJoin: vi.fn(),
    joining: false,
    pendingInvitation: undefined,
  }),
}));

vi.mock('./useOrgInvitationResponse', () => ({
  useOrgInvitationResponse: () => ({
    onAccept: vi.fn(),
    onDecline: vi.fn(),
    accepting: false,
    declining: false,
    withheldNotice: undefined,
    clearWithheldNotice: vi.fn(),
  }),
}));

import { CrdOrganizationProfilePage } from './CrdOrganizationProfilePage';

// The page's own labels resolve to their keys; the limit text comes from the app's i18n instance.
const pageI18n = i18next.createInstance();

beforeAll(async () => {
  // jsdom does not implement scrollIntoView; the tab strip calls it on mount.
  Element.prototype.scrollIntoView = vi.fn();
  await pageI18n.use(initReactI18next).init({ lng: 'en', resources: {}, react: { useSuspense: false } });
});

beforeEach(() => {
  vi.clearAllMocks();
});

const sendFromHero = async () => {
  render(
    <I18nextProvider i18n={pageI18n}>
      <CrdOrganizationProfilePage />
    </I18nextProvider>
  );
  await userEvent.click(screen.getByRole('button', { name: 'orgProfile.hero.messageButton' }));
  await userEvent.type(screen.getByRole('textbox', { name: 'common.messagePopover.ariaLabel' }), 'Hello there');
  await userEvent.click(screen.getByRole('button', { name: 'common.messagePopover.send' }));
};

describe('CrdOrganizationProfilePage — message when the hourly message allowance is used up', () => {
  test('shows the limit text once in the composer and raises no notification', async () => {
    sendMessageToOrganizationMock.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [new GraphQLError('refused', { extensions: { code: 'MESSAGE_SEND_LIMIT_REACHED' } })],
      })
    );

    await sendFromHero();

    expect(await screen.findAllByText(limitText)).toHaveLength(1);
    expect(screen.getByRole('textbox', { name: 'common.messagePopover.ariaLabel' })).toHaveValue('Hello there');
    expect(toastErrorMock).not.toHaveBeenCalled();
    expect(toastSuccessMock).not.toHaveBeenCalled();
  });

  test("another refusal shows the server's reason, not the limit text", async () => {
    sendMessageToOrganizationMock.mockRejectedValue(
      new ApolloError({
        graphQLErrors: [
          new GraphQLError('Organization does not accept messages', {
            extensions: { code: 'OPERATION_NOT_ALLOWED', userMessage: 'userMessages.operations.operationNotAllowed' },
          }),
        ],
      })
    );

    await sendFromHero();

    expect(await screen.findByText(/Organization does not accept messages/)).toBeInTheDocument();
    expect(screen.queryByText(limitText)).not.toBeInTheDocument();
  });
});
