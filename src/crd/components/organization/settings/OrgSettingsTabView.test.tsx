import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { OrgSettingsTabView, type OrgSettingsTabViewProps } from './OrgSettingsTabView';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const baseProps: OrgSettingsTabViewProps = {
  loading: false,
  allowSpaceInvitations: true,
  allowSpaceInvitationsSaving: false,
  onToggleAllowSpaceInvitations: vi.fn(),
  allowUsersMatchingDomainToJoin: false,
  allowUsersMatchingDomainToJoinSaving: false,
  onToggleAllowUsersMatchingDomainToJoin: vi.fn(),
  allowApplications: true,
  allowApplicationsSaving: false,
  onToggleAllowApplications: vi.fn(),
  contributionRolesPubliclyVisible: false,
  privacySaving: false,
  onToggleContributionRoles: vi.fn(),
};

const MEMBERSHIP_SWITCH_LABELS = [
  'org.settings.membership.allowSpaceInvitationsLabel',
  'org.settings.membership.allowDomainLabel',
  'org.settings.membership.allowApplicationsLabel',
];

describe('OrgSettingsTabView — Membership card (R41, R45)', () => {
  test('renders each membership switch exactly once', () => {
    render(<OrgSettingsTabView {...baseProps} />);
    // `getAllByRole(...).toHaveLength(1)` rather than `getByRole` on purpose: the
    // defect Carlos found on 2026-09-11 (R45) was a *duplicated* allowSpaceInvitations
    // block, which a getByRole assertion would only have caught after the fact.
    for (const name of MEMBERSHIP_SWITCH_LABELS) {
      expect(screen.getAllByRole('switch', { name })).toHaveLength(1);
    }
  });

  test('carries all three membership switches plus the privacy one, and nothing else', () => {
    render(<OrgSettingsTabView {...baseProps} />);
    expect(screen.getAllByRole('switch')).toHaveLength(4);
    expect(screen.getByRole('switch', { name: 'org.settings.privacy.contributionRolesLabel' })).toBeInTheDocument();
  });

  test('reflects each persisted value on its own switch', () => {
    render(<OrgSettingsTabView {...baseProps} allowUsersMatchingDomainToJoin={true} allowApplications={false} />);
    expect(screen.getByRole('switch', { name: 'org.settings.membership.allowDomainLabel' })).toBeChecked();
    expect(screen.getByRole('switch', { name: 'org.settings.membership.allowApplicationsLabel' })).not.toBeChecked();
  });

  test('routes each switch to its own callback', async () => {
    const user = userEvent.setup();
    const onToggleAllowUsersMatchingDomainToJoin = vi.fn();
    const onToggleAllowApplications = vi.fn();
    render(
      <OrgSettingsTabView
        {...baseProps}
        onToggleAllowUsersMatchingDomainToJoin={onToggleAllowUsersMatchingDomainToJoin}
        onToggleAllowApplications={onToggleAllowApplications}
      />
    );

    await user.click(screen.getByRole('switch', { name: 'org.settings.membership.allowDomainLabel' }));
    expect(onToggleAllowUsersMatchingDomainToJoin).toHaveBeenCalledWith(true);
    expect(onToggleAllowApplications).not.toHaveBeenCalled();

    await user.click(screen.getByRole('switch', { name: 'org.settings.membership.allowApplicationsLabel' }));
    expect(onToggleAllowApplications).toHaveBeenCalledWith(false);
  });

  test('disables only the switch that is saving', () => {
    render(<OrgSettingsTabView {...baseProps} allowApplicationsSaving={true} />);
    expect(screen.getByRole('switch', { name: 'org.settings.membership.allowApplicationsLabel' })).toBeDisabled();
    expect(screen.getByRole('switch', { name: 'org.settings.membership.allowDomainLabel' })).toBeEnabled();
  });
});
