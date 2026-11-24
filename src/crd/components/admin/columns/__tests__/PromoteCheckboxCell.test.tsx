import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import adminEn from '@/crd/i18n/admin/admin.en.json';
import { PromoteCheckboxCell } from '../PromoteCheckboxCell';

// Resolves keys against the real English bundle so the accessible name is
// asserted as a user hears it.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, opts?: Record<string, string>) => {
      const template = key
        .split('.')
        .reduce<unknown>((node, part) => (node as Record<string, unknown>)?.[part], adminEn) as string;
      return template.replace(/\{\{(\w+)\}\}/g, (_, name: string) => opts?.[name] ?? '');
    },
  }),
}));

describe('PromoteCheckboxCell', () => {
  test('renders unchecked with an accessible name naming the resource', () => {
    render(<PromoteCheckboxCell checked={false} name="Green Cities Lab" onCheckedChange={vi.fn()} />);
    const box = screen.getByRole('checkbox', { name: 'Promote Green Cities Lab' });
    expect(box).not.toBeChecked();
  });

  test('renders checked', () => {
    render(<PromoteCheckboxCell checked={true} name="Green Cities Lab" onCheckedChange={vi.fn()} />);
    expect(screen.getByRole('checkbox', { name: 'Promote Green Cities Lab' })).toBeChecked();
  });

  test('clicking an unchecked box requests true', async () => {
    const onCheckedChange = vi.fn();
    render(<PromoteCheckboxCell checked={false} name="Green Cities Lab" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Promote Green Cities Lab' }));
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  test('clicking a checked box requests false', async () => {
    const onCheckedChange = vi.fn();
    render(<PromoteCheckboxCell checked={true} name="Green Cities Lab" onCheckedChange={onCheckedChange} />);
    await userEvent.click(screen.getByRole('checkbox', { name: 'Promote Green Cities Lab' }));
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  test('a saving box is busy, ignores clicks and keeps keyboard focus', async () => {
    const onCheckedChange = vi.fn();
    render(
      <PromoteCheckboxCell checked={false} name="Green Cities Lab" saving={true} onCheckedChange={onCheckedChange} />
    );
    const box = screen.getByRole('checkbox', { name: 'Promote Green Cities Lab' });
    expect(box).not.toBeDisabled();
    expect(box).toHaveAttribute('aria-busy', 'true');
    expect(box).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(box);
    expect(onCheckedChange).not.toHaveBeenCalled();
    expect(box).toHaveFocus();
    expect(box).not.toBeChecked();
  });
});
