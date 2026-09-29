import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

import { OrganizationAssociateAction } from './OrganizationAssociateAction';

const noop = () => {};

describe('OrganizationAssociateAction', () => {
  it('renders nothing for action="none"', () => {
    const { container } = render(
      <OrganizationAssociateAction action="none" onJoin={noop} onApply={noop} onRespond={noop} onLogin={noop} />
    );
    expect(container).toBeEmptyDOMElement();
  });

  it('renders the visible join caption, wired as the accessible description (FR-015)', () => {
    render(
      <OrganizationAssociateAction
        action="join"
        helperText="Your email domain matches this organisation."
        onJoin={noop}
        onApply={noop}
        onRespond={noop}
        onLogin={noop}
      />
    );
    const button = screen.getByRole('button');
    expect(button).toHaveAccessibleDescription('Your email domain matches this organisation.');
    expect(screen.getByText('Your email domain matches this organisation.')).toBeVisible();
  });

  it('calls onJoin when the join button is clicked', async () => {
    const onJoin = vi.fn();
    render(
      <OrganizationAssociateAction action="join" onJoin={onJoin} onApply={noop} onRespond={noop} onLogin={noop} />
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onJoin).toHaveBeenCalledTimes(1);
  });

  it('disables the button for a pending application', () => {
    render(
      <OrganizationAssociateAction
        action="pending-application"
        onJoin={noop}
        onApply={noop}
        onRespond={noop}
        onLogin={noop}
      />
    );
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('renders a muted closed line, not a button', () => {
    render(
      <OrganizationAssociateAction action="closed" onJoin={noop} onApply={noop} onRespond={noop} onLogin={noop} />
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('calls onApply for the apply action and onRespond for the respond action', async () => {
    const onApply = vi.fn();
    const { rerender } = render(
      <OrganizationAssociateAction action="apply" onJoin={noop} onApply={onApply} onRespond={noop} onLogin={noop} />
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onApply).toHaveBeenCalledTimes(1);

    const onRespond = vi.fn();
    rerender(
      <OrganizationAssociateAction action="respond" onJoin={noop} onApply={noop} onRespond={onRespond} onLogin={noop} />
    );
    await userEvent.click(screen.getByRole('button'));
    expect(onRespond).toHaveBeenCalledTimes(1);
  });
});
