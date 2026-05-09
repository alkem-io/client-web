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

  test('locked mode: non-active chips are no-ops; active chip deselects', async () => {
    const onChange = vi.fn();
    render(<ResponseTypeChipStrip value="post" onChange={onChange} locked={true} />);
    const memo = screen.getByRole('radio', { name: /contributionSettings.types.memo/i });
    await userEvent.click(memo);
    expect(onChange).not.toHaveBeenCalled();
    const post = screen.getByRole('radio', { name: /contributionSettings.types.post/i });
    await userEvent.click(post);
    expect(onChange).toHaveBeenCalledWith('none');
  });

  test('selected chip is aria-checked', () => {
    render(<ResponseTypeChipStrip value="whiteboard" onChange={vi.fn()} />);
    const wb = screen.getByRole('radio', { name: /contributionSettings.types.whiteboard/i, checked: true });
    expect(wb).toBeInTheDocument();
    const post = screen.getByRole('radio', { name: /contributionSettings.types.post/i, checked: false });
    expect(post).toBeInTheDocument();
  });
});
