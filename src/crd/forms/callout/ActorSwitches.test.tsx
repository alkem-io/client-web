import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ActorSwitches } from './ActorSwitches';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ActorSwitches hierarchy rule', () => {
  test('turning members ON with admins OFF flips admins to ON (forbidden state unreachable)', async () => {
    const onChange = vi.fn();
    render(<ActorSwitches value={{ members: false, admins: false }} onChange={onChange} />);
    // When admins is OFF, the members switch must be disabled — the only way
    // to reach `members: true` is by first turning admins on. Verify the
    // switch is unreachable.
    const membersSwitch = screen.getByRole('switch', { name: /members/i });
    expect(membersSwitch).toBeDisabled();
  });

  test('turning admins OFF forces members OFF too', async () => {
    const onChange = vi.fn();
    render(<ActorSwitches value={{ members: true, admins: true }} onChange={onChange} />);
    const adminsSwitch = screen.getByRole('switch', { name: /admins/i });
    await userEvent.click(adminsSwitch);
    expect(onChange).toHaveBeenCalledWith({ members: false, admins: false });
  });

  test('turning members ON forces admins ON too (reachable via current admins-on state)', async () => {
    const onChange = vi.fn();
    render(<ActorSwitches value={{ members: false, admins: true }} onChange={onChange} />);
    const membersSwitch = screen.getByRole('switch', { name: /members/i });
    await userEvent.click(membersSwitch);
    expect(onChange).toHaveBeenCalledWith({ members: true, admins: true });
  });

  test('turning members OFF leaves admins unchanged', async () => {
    const onChange = vi.fn();
    render(<ActorSwitches value={{ members: true, admins: true }} onChange={onChange} />);
    const membersSwitch = screen.getByRole('switch', { name: /members/i });
    await userEvent.click(membersSwitch);
    expect(onChange).toHaveBeenCalledWith({ members: false, admins: true });
  });

  test('turning admins ON leaves members unchanged (admins OFF → ON transition)', async () => {
    const onChange = vi.fn();
    render(<ActorSwitches value={{ members: false, admins: false }} onChange={onChange} />);
    const adminsSwitch = screen.getByRole('switch', { name: /admins/i });
    await userEvent.click(adminsSwitch);
    expect(onChange).toHaveBeenCalledWith({ members: false, admins: true });
  });
});
