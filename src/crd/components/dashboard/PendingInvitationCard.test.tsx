import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { PendingInvitationCard, type PendingInvitationCardData } from './PendingInvitationCard';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const base: PendingInvitationCardData = {
  id: 'inv-1',
  spaceName: 'Green Energy',
  senderName: 'Alice',
  timeElapsed: '2 hours ago',
};

describe('PendingInvitationCard — organization invitations (T014)', () => {
  test('a user invitation shows the space name as title and the sender as subtitle (unchanged)', () => {
    render(<PendingInvitationCard invitation={base} />);
    expect(screen.getByText('Green Energy')).toBeInTheDocument();
    expect(screen.getByText('Alice')).toBeInTheDocument();
  });

  test('an organization invitation leads with the organization name, demoting the space to the subtitle', () => {
    render(<PendingInvitationCard invitation={{ ...base, organizationName: 'Acme Org' }} />);
    expect(screen.getByText('Acme Org')).toBeInTheDocument();
    expect(screen.getByText('Green Energy')).toBeInTheDocument();
    // senderName is no longer shown once organizationName takes its slot.
    expect(screen.queryByText('Alice')).not.toBeInTheDocument();
  });
});
