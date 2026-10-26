import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { OrgSettingsAccessMode } from '../useCanEditOrganizationSettings';

let accessMode: OrgSettingsAccessMode = 'full';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));
vi.mock('@/core/routing/usePageTitle', () => ({ usePageTitle: () => {} }));
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
  default: () => ({ activeTabId: 'community', onTabSelect: () => {} }),
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
  // jsdom does not lay out, so it has no scrollIntoView; the tab strip scrolls the active tab into view.
  Element.prototype.scrollIntoView = vi.fn();
});

describe('CrdOrgSettingsPage — tab strip', () => {
  it('shows all six tabs to a viewer with full access', () => {
    renderPage();
    expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual([
      'shell.tabs.org.profile',
      'shell.tabs.org.account',
      'shell.tabs.org.community',
      'shell.tabs.org.membership',
      'shell.tabs.org.invitations',
      'shell.tabs.org.settings',
    ]);
  });

  it('shows only the Community tab to a community-only viewer', () => {
    accessMode = 'community-only';
    renderPage();
    expect(screen.getAllByRole('tab').map(tab => tab.textContent)).toEqual(['shell.tabs.org.community']);
  });
});
