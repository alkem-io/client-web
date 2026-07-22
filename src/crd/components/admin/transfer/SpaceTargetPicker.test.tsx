import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import type { SpaceTargetPickerItem } from './SpaceTargetPicker';
import { SpaceTargetPicker } from './SpaceTargetPicker';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const items: SpaceTargetPickerItem[] = [
  { id: 'space-a', displayName: 'Space Alpha' },
  { id: 'space-b', displayName: 'Space Beta' },
  { id: 'space-c', displayName: 'Another Space' },
];

function renderPicker(overrides?: Partial<Parameters<typeof SpaceTargetPicker>[0]>) {
  const onValueChange = vi.fn();
  render(
    <SpaceTargetPicker
      items={items}
      value=""
      onValueChange={onValueChange}
      placeholder="Pick a space"
      emptyLabel="No spaces found"
      loading={false}
      {...overrides}
    />
  );
  return { onValueChange };
}

describe('SpaceTargetPicker', () => {
  test('renders all items', () => {
    renderPicker();
    expect(screen.getByText('Space Alpha')).toBeDefined();
    expect(screen.getByText('Space Beta')).toBeDefined();
    expect(screen.getByText('Another Space')).toBeDefined();
  });

  test('filters items by search term (case-insensitive)', async () => {
    const user = userEvent.setup();
    renderPicker();
    const input = screen.getByPlaceholderText('Pick a space');
    await user.type(input, 'alpha');
    expect(screen.getByText('Space Alpha')).toBeDefined();
    expect(screen.queryByText('Space Beta')).toBeNull();
    expect(screen.queryByText('Another Space')).toBeNull();
  });

  test('honors excludeIds — excluded items are not rendered', () => {
    renderPicker({ excludeIds: ['space-b'] });
    expect(screen.getByText('Space Alpha')).toBeDefined();
    expect(screen.queryByText('Space Beta')).toBeNull();
    expect(screen.getByText('Another Space')).toBeDefined();
  });

  test('shows empty state when filtered list is empty', async () => {
    const user = userEvent.setup();
    renderPicker();
    const input = screen.getByPlaceholderText('Pick a space');
    await user.type(input, 'zzznomatch');
    expect(screen.getByText('No spaces found')).toBeDefined();
  });

  test('shows loading state and hides items when loading=true', () => {
    renderPicker({ loading: true });
    expect(screen.queryByText('Space Alpha')).toBeNull();
    expect(screen.queryByText('Space Beta')).toBeNull();
  });

  test('calls onValueChange with item id when an item is clicked', async () => {
    const user = userEvent.setup();
    const { onValueChange } = renderPicker();
    await user.click(screen.getByText('Space Beta'));
    expect(onValueChange).toHaveBeenCalledWith('space-b');
  });

  test('selected item has aria-pressed=true', () => {
    renderPicker({ value: 'space-a' });
    const btn = screen.getByText('Space Alpha').closest('button');
    expect(btn?.getAttribute('aria-pressed')).toBe('true');
  });

  test('disabled prop disables all buttons', () => {
    renderPicker({ disabled: true });
    const buttons = screen.getAllByRole('button');
    for (const btn of buttons) expect(btn).toBeDisabled();
  });
});
