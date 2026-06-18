import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ResponseTypeChipStrip } from './ResponseTypeChipStrip';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('ResponseTypeChipStrip', () => {
  test('renders as a radiogroup with an accessible label', () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} />);
    const group = screen.getByRole('radiogroup', { name: /contributionSettings.heading/i });
    expect(group).toBeInTheDocument();
  });

  test('renders the four P1 response chips (Documents are framing-only — FR-015)', () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} />);
    const chips = screen.getAllByRole('radio');
    expect(chips).toHaveLength(4);
    // Documents must NOT appear among Response Options in P1.
    expect(screen.queryByRole('radio', { name: /contributionSettings.types.document/i })).toBeNull();
  });

  test('clicking an inactive chip selects it', async () => {
    const onChange = vi.fn();
    render(<ResponseTypeChipStrip value="none" onChange={onChange} />);
    const post = screen.getByRole('radio', { name: /contributionSettings.types.post/i });
    await userEvent.click(post);
    expect(onChange).toHaveBeenCalledWith('post');
  });

  test('clicking the active chip deselects (emits "none")', async () => {
    const onChange = vi.fn();
    render(<ResponseTypeChipStrip value="memo" onChange={onChange} />);
    const memo = screen.getByRole('radio', { name: /contributionSettings.types.memo/i });
    await userEvent.click(memo);
    expect(onChange).toHaveBeenCalledWith('none');
  });

  test('locked mode: every chip click is a no-op — the response type cannot be changed or cleared', async () => {
    const onChange = vi.fn();
    render(<ResponseTypeChipStrip value="post" onChange={onChange} locked={true} />);
    const memo = screen.getByRole('radio', { name: /contributionSettings.types.memo/i });
    await userEvent.click(memo);
    expect(onChange).not.toHaveBeenCalled();
    const post = screen.getByRole('radio', { name: /contributionSettings.types.post/i });
    await userEvent.click(post);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('locked mode: the active chip is also aria-disabled and shows the lock hint', () => {
    render(<ResponseTypeChipStrip value="post" onChange={vi.fn()} locked={true} />);
    // The active chip can't be cleared either, so it must read as disabled to AT
    // (not as a live control that silently no-ops) and explain why on hover.
    const post = screen.getByRole('radio', { name: /contributionSettings.types.post/i });
    expect(post).toHaveAttribute('aria-disabled', 'true');
    expect(post).toHaveAttribute('title', 'contributionSettings.typeLockedHint');
    // Inactive chips stay disabled with the same hint.
    const memo = screen.getByRole('radio', { name: /contributionSettings.types.memo/i });
    expect(memo).toHaveAttribute('aria-disabled', 'true');
    expect(memo).toHaveAttribute('title', 'contributionSettings.typeLockedHint');
  });

  test('allowedChips limits the strip to the listed response types (VC KB: post + link)', () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} allowedChips={['post', 'link']} />);
    const chips = screen.getAllByRole('radio');
    expect(chips).toHaveLength(2);
    expect(screen.getByRole('radio', { name: /contributionSettings.types.post/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /contributionSettings.types.link/i })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /contributionSettings.types.memo/i })).toBeNull();
    expect(screen.queryByRole('radio', { name: /contributionSettings.types.whiteboard/i })).toBeNull();
  });

  test('selected chip is aria-checked', () => {
    render(<ResponseTypeChipStrip value="whiteboard" onChange={vi.fn()} />);
    const wb = screen.getByRole('radio', { name: /contributionSettings.types.whiteboard/i, checked: true });
    expect(wb).toBeInTheDocument();
    const post = screen.getByRole('radio', { name: /contributionSettings.types.post/i, checked: false });
    expect(post).toBeInTheDocument();
  });
});
