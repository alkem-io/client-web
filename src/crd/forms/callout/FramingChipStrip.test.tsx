import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { FramingChipStrip } from './FramingChipStrip';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('FramingChipStrip', () => {
  test('renders as a radiogroup with 6 chips', () => {
    render(<FramingChipStrip value="none" onChange={vi.fn()} />);
    const group = screen.getByRole('radiogroup');
    expect(group).toBeInTheDocument();
    const chips = screen.getAllByRole('radio');
    expect(chips).toHaveLength(6);
    // Document chip is interactive (Collabora wired in 085-collabora-callout)
    const doc = screen.getByRole('radio', { name: /callout.document/i });
    expect(doc).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('clicking an inactive chip selects it', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="none" onChange={onChange} />);
    const memo = screen.getByRole('radio', { name: /callout.memo/i });
    await userEvent.click(memo);
    expect(onChange).toHaveBeenCalledWith('memo');
  });

  test('clicking the active chip deselects (emits "none")', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="memo" onChange={onChange} />);
    const memo = screen.getByRole('radio', { name: /callout.memo/i });
    await userEvent.click(memo);
    expect(onChange).toHaveBeenCalledWith('none');
  });

  test('clicking the document chip selects it (Collabora framing)', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="none" onChange={onChange} />);
    const doc = screen.getByRole('radio', { name: /callout.document/i });
    await userEvent.click(doc);
    expect(onChange).toHaveBeenCalledWith('document');
  });

  test('locked mode: clicking a non-active chip is a no-op, clicking active fires onChange("none")', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="poll" onChange={onChange} locked={true} />);
    const memo = screen.getByRole('radio', { name: /callout.memo/i });
    await userEvent.click(memo);
    expect(onChange).not.toHaveBeenCalled();
    const poll = screen.getByRole('radio', { name: /callout.poll/i });
    await userEvent.click(poll);
    expect(onChange).toHaveBeenCalledWith('none');
  });

  test('selected chip is aria-checked', () => {
    render(<FramingChipStrip value="whiteboard" onChange={vi.fn()} />);
    const whiteboard = screen.getByRole('radio', { name: /callout.whiteboard/i, checked: true });
    expect(whiteboard).toBeInTheDocument();
    const memo = screen.getByRole('radio', { name: /callout.memo/i, checked: false });
    expect(memo).toBeInTheDocument();
  });

  test('disabledChips marks the listed chip as aria-disabled and ignores clicks', async () => {
    const onChange = vi.fn();
    render(
      <FramingChipStrip
        value="none"
        onChange={onChange}
        disabledChips={{ document: { tooltip: 'Office documents not enabled' } }}
      />
    );
    const doc = screen.getByRole('radio', { name: /callout.document/i });
    expect(doc).toHaveAttribute('aria-disabled', 'true');
    expect(doc).toHaveAttribute('title', 'Office documents not enabled');
    await userEvent.click(doc);
    expect(onChange).not.toHaveBeenCalled();
  });
});
