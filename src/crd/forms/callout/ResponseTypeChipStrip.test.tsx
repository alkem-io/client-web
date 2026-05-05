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

  test('renders 5 chips with Document disabled via aria-disabled', () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} />);
    const chips = screen.getAllByRole('radio');
    expect(chips).toHaveLength(5);
    const doc = screen.getByRole('radio', { name: /contributionSettings.types.document/i });
    expect(doc).toHaveAttribute('aria-disabled', 'true');
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

  test('clicking the disabled document chip is a no-op', async () => {
    const onChange = vi.fn();
    render(<ResponseTypeChipStrip value="none" onChange={onChange} />);
    const doc = screen.getByRole('radio', { name: /contributionSettings.types.document/i });
    await userEvent.click(doc);
    expect(onChange).not.toHaveBeenCalled();
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
