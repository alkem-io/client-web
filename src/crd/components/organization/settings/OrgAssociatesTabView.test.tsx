import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import type { PendingMembership } from '@/crd/components/space/settings/PendingMembershipsTable';
import { type OrgAssociateListRow, OrgAssociatesTabView, type OrgAssociatesTabViewProps } from './OrgAssociatesTabView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en' } }),
}));

const associate = (overrides: Partial<OrgAssociateListRow> = {}): OrgAssociateListRow => ({
  id: 'user-1',
  displayName: 'Ada Lovelace',
  color: '#42a5f5',
  isAssociate: true,
  isAdmin: false,
  isOwner: false,
  ...overrides,
});

const pendingRow = (overrides: Partial<PendingMembership> = {}): PendingMembership => ({
  id: 'app-1',
  type: 'application',
  state: 'new',
  contributorType: 'user',
  displayName: 'Grace Hopper',
  createdDate: '2026-09-01T10:00:00.000Z',
  canApprove: true,
  canReject: true,
  canDelete: false,
  ...overrides,
});

const baseProps: OrgAssociatesTabViewProps = {
  associates: [associate()],
  loading: false,
  canManage: true,
  onEdit: vi.fn(),
  onInvite: vi.fn(),
  pending: [pendingRow()],
  onPendingApprove: vi.fn(),
  onPendingReject: vi.fn(),
  onPendingRevoke: vi.fn(),
  onPendingView: vi.fn(),
};

describe('OrgAssociatesTabView — layout (R41, R42)', () => {
  test('carries no settings switch — all three membership switches live on the Settings tab (R41)', () => {
    render(<OrgAssociatesTabView {...baseProps} />);
    expect(screen.queryAllByRole('switch')).toHaveLength(0);
  });

  test('leads with the pending section and puts the associates list below it (R42)', () => {
    render(<OrgAssociatesTabView {...baseProps} />);
    const pendingHeading = screen.getByText('org.associates.pending.title');
    const associatesHeading = screen.getByText('org.associates.title');
    // Node.DOCUMENT_POSITION_FOLLOWING === 4: the associates heading comes after
    // the pending heading in document order. Pending is what needs acting on, so
    // it leads (R42 / FR-019).
    expect(pendingHeading.compareDocumentPosition(associatesHeading) & 4).toBeTruthy();
  });
});
