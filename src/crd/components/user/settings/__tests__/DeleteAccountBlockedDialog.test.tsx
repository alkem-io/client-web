import { render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import type {
  DeleteAccountBlocker,
  DeleteAccountBlockerTotal,
} from '@/crd/components/user/settings/DeleteAccount.types';
import { DeleteAccountBlockedDialog } from '@/crd/components/user/settings/DeleteAccountBlockedDialog';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-contributorSettings': contributorSettingsEn } },
    interpolation: { escapeValue: false },
  });
});

const renderDialog = (props: Partial<Parameters<typeof DeleteAccountBlockedDialog>[0]> = {}) =>
  render(
    <I18nextProvider i18n={i18n}>
      <DeleteAccountBlockedDialog
        open={true}
        onOpenChange={vi.fn()}
        blockers={[]}
        totals={[]}
        truncated={false}
        accountResourcesUrl="/user/ada/settings/account"
        {...props}
      />
    </I18nextProvider>
  );

describe('DeleteAccountBlockedDialog', () => {
  it('itemizes each blocker with its kind and per-kind totals', () => {
    const blockers: DeleteAccountBlocker[] = [
      { kind: 'ACCOUNT_SPACE', resourceID: 'space-1', displayName: 'My Space', url: '/my-space', selfResolvable: true },
      {
        kind: 'ACCOUNT_VIRTUAL_CONTRIBUTOR',
        resourceID: 'vc-1',
        displayName: 'My VC',
        url: '/vc/my-vc',
        selfResolvable: true,
      },
    ];
    const totals: DeleteAccountBlockerTotal[] = [
      { kind: 'ACCOUNT_SPACE', total: 1 },
      { kind: 'ACCOUNT_VIRTUAL_CONTRIBUTOR', total: 1 },
    ];
    renderDialog({ blockers, totals });

    expect(screen.getByText('My Space')).toBeInTheDocument();
    expect(screen.getByText('My VC')).toBeInTheDocument();
    // Per-kind totals line, independent of the itemized list below it — matched
    // against a single <p>'s own text so an ancestor's concatenated text (which
    // also contains this substring) can never produce an ambiguous match.
    const exactParagraphText = (expected: string) => (_content: string, element: Element | null) =>
      element?.tagName === 'P' && element.textContent?.replace(/\s+/g, ' ').trim() === expected;
    expect(screen.getByText(exactParagraphText('Space: 1'))).toBeInTheDocument();
    expect(screen.getByText(exactParagraphText('Virtual Contributor: 1'))).toBeInTheDocument();
  });

  it('shows an explicit truncation indicator when the list was capped — never implying completeness', () => {
    const blockers: DeleteAccountBlocker[] = Array.from({ length: 2 }, (_, i) => ({
      kind: 'ACCOUNT_SPACE' as const,
      resourceID: `space-${i}`,
      displayName: `Space ${i}`,
      url: undefined,
      selfResolvable: true,
    }));
    renderDialog({ blockers, totals: [{ kind: 'ACCOUNT_SPACE', total: 42 }], truncated: true });

    expect(screen.getByRole('status')).toHaveTextContent(/first 2 of 42 items/i);
  });

  it('offers the deep link to account resources for a self-resolvable blocker', () => {
    renderDialog({
      blockers: [
        {
          kind: 'ACCOUNT_SPACE',
          resourceID: 'space-1',
          displayName: 'My Space',
          url: '/my-space',
          selfResolvable: true,
        },
      ],
      totals: [{ kind: 'ACCOUNT_SPACE', total: 1 }],
      accountResourcesUrl: '/user/ada/settings/account',
    });

    const link = screen.getByRole('link', { name: 'Manage my account resources' });
    expect(link).toHaveAttribute('href', '/user/ada/settings/account');
  });

  it('always offers support as a parallel route, never in place of the resolution link', () => {
    renderDialog({
      blockers: [
        {
          kind: 'ACCOUNT_SPACE',
          resourceID: 'space-1',
          displayName: 'My Space',
          url: '/my-space',
          selfResolvable: true,
        },
      ],
      totals: [{ kind: 'ACCOUNT_SPACE', total: 1 }],
    });

    const supportLink = screen.getByRole('link', { name: 'Contact support' });
    expect(supportLink).toHaveAttribute('href', 'mailto:support@alkem.io');
    // The support route is ADDITIONAL, not instead of, the resolution link.
    expect(screen.getByRole('link', { name: 'Manage my account resources' })).toBeInTheDocument();
  });

  it('a sole-owned organization renders hand-over guidance and offers support, with no resolve link since it cannot be self-resolved', () => {
    renderDialog({
      blockers: [
        {
          kind: 'SOLE_ORGANIZATION_OWNER',
          resourceID: 'org-1',
          displayName: 'Acme Inc',
          url: undefined,
          selfResolvable: false,
        },
      ],
      totals: [{ kind: 'SOLE_ORGANIZATION_OWNER', total: 1 }],
    });

    // Matched against the leaf <span>'s own text, not any ancestor's
    // concatenated text, to avoid an ambiguous multi-element match.
    expect(
      screen.getByText(
        (_content, element) =>
          element?.tagName === 'SPAN' && Boolean(element.textContent?.includes('only owner of Acme Inc'))
      )
    ).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact support' })).toBeInTheDocument();
    // Support is always present; the account-resources link is absent because
    // nothing in the itemized list here is self-resolvable.
    expect(screen.queryByRole('link', { name: 'Manage my account resources' })).not.toBeInTheDocument();
  });
});
