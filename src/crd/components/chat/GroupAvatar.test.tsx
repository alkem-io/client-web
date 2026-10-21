import { render } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { GroupAvatar } from './GroupAvatar';
import type { ChatMemberAvatar } from './types';

vi.mock('@/crd/primitives/avatar');

const members = (count: number): ChatMemberAvatar[] =>
  Array.from({ length: count }, (_, index) => ({ id: `m${index}`, name: `Member ${index}` }));

const tiles = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('[data-tile]')).map(tile => tile.getAttribute('data-tile'));

describe('GroupAvatar', () => {
  test('a single member fills the whole circle', () => {
    const { container } = render(<GroupAvatar members={members(1)} />);
    expect(container.querySelectorAll('[data-testid="avatar"]')).toHaveLength(1);
    expect(tiles(container)).toEqual([]);
  });

  test('two members split the circle into a left and a right half, leaving no empty area', () => {
    const { container } = render(<GroupAvatar members={members(2)} />);
    expect(tiles(container)).toEqual(['left', 'right']);
  });

  test('three members get a left half and two right quarters', () => {
    const { container } = render(<GroupAvatar members={members(3)} />);
    expect(tiles(container)).toEqual(['left', 'top-right', 'bottom-right']);
  });

  test('four members get four quarters', () => {
    const { container } = render(<GroupAvatar members={members(4)} />);
    expect(tiles(container)).toEqual(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
  });

  test('five or more members show three faces and a "+N" count for the rest in the fourth quarter', () => {
    const { container, getByText } = render(<GroupAvatar members={members(7)} />);
    expect(tiles(container)).toEqual(['top-left', 'top-right', 'bottom-left', 'bottom-right']);
    expect(container.querySelectorAll('[data-testid="avatar"]')).toHaveLength(3);
    expect(getByText('+4')).toBeInTheDocument();
  });

  test('stays decorative in every layout', () => {
    for (const count of [1, 2, 3, 4, 5]) {
      const { container, unmount } = render(<GroupAvatar members={members(count)} />);
      expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
      unmount();
    }
  });
});
