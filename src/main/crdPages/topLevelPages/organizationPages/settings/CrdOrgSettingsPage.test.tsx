import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OrgSettingsAccessMode } from '../useCanEditOrganizationSettings';

let accessMode: OrgSettingsAccessMode = 'full';
let activeTabId = 'associates';

const TITLE_PARTS: Record<string, string> = { 'pages.titles.separator': ' | ', 'pages.titles.alkemio': 'Alkemio' };

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => TITLE_PARTS[key] ?? key }),
}));
vi.mock('@/main/ui/breadcrumbs/BreadcrumbsContext', () => ({ useSetBreadcrumbs: () => {} }));
vi.mock('@/core/ui/notifications/useNotification', () => ({ useNotification: () => () => {} }));
vi.mock('@/domain/community/organization/hooks/useOrganizationContext', () => ({
  useOrganizationContext: () => ({
    organizationId: 'org-1',
    organization: { profile: { url: '/organization/acme', displayName: 'Acme' } },
  }),
}));
vi.mock('./useOrgSettingsAccessGuard', () => ({
  default: () => ({ accessMode, loading: false, canEditSettings: accessMode !== 'none', hasUpdatePrivilege: false }),
}));
vi.mock('./useOrgSettingsTab', () => ({
  default: () => ({ activeTabId, onTabSelect: () => {} }),
}));

import CrdOrgSettingsPage from './CrdOrgSettingsPage';

const renderPage = () =>
  render(
    <MemoryRouter>
      <CrdOrgSettingsPage />
    </MemoryRouter>
  );

beforeEach(() => {
  accessMode = 'full';
  activeTabId = 'associates';
  // jsdom does not lay out, so it has no scrollIntoView; the tab strip scrolls the active tab into view.
  Element.prototype.scrollIntoView = vi.fn();
});

describe('CrdOrgSettingsPage — tab strip', () => {
  it('shows all six tabs to a viewer with full access', () => {
    renderPage();
    expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual([
      'shell.tabs.org.profile',
      'shell.tabs.org.account',
      'shell.tabs.org.associates',
      'shell.tabs.org.membership',
      'shell.tabs.org.invitations',
      'shell.tabs.org.settings',
    ]);
  });

  it('shows only the Associates tab to a community-only viewer', () => {
    accessMode = 'community-only';
    renderPage();
    expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual(['shell.tabs.org.associates']);
  });
});

describe('CrdOrgSettingsPage — browser title', () => {
  it.each([
    'profile',
    'account',
    'associates',
    'membership',
    'invitations',
    'settings',
  ])('titles the page after the active %s tab', tab => {
    activeTabId = tab;
    renderPage();
    expect(document.title).toBe(`shell.tabs.org.${tab} | Alkemio`);
  });

  it('retitles the page when the active tab changes', () => {
    activeTabId = 'invitations';
    const { rerender } = renderPage();
    activeTabId = 'membership';
    rerender(
      <MemoryRouter>
        <CrdOrgSettingsPage />
      </MemoryRouter>
    );
    expect(document.title).toBe('shell.tabs.org.membership | Alkemio');
  });
});
