import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { FramingChipStrip } from './FramingChipStrip';

/** The three chips kept in the row; everything else is behind "More". */
const ROW_LABELS = ['callout.whiteboard', 'callout.memo', 'callout.mediaGallery'];

/** Opens the More menu and returns its items. */
const openMore = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'forms.moreFramingTypes' }));
  return screen.findAllByRole('menuitem');
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

describe('FramingChipStrip', () => {
  test('renders the three most-used chips in the row, the rest behind More', async () => {
    render(<FramingChipStrip value="none" onChange={vi.fn()} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    const chips = screen.getAllByRole('radio');
    expect(chips.map(chip => chip.getAttribute('aria-label'))).toEqual(ROW_LABELS);

    // The remaining five — including the admin-gated `contributors` (008) and
    // `spaces` (013) — are reachable from the menu, in CHIPS order.
    const items = await openMore();
    expect(items.map(item => item.textContent)).toEqual([
      'callout.document',
      'callout.callToAction',
      'callout.poll',
      'callout.contributors',
      'callout.subspaces',
    ]);
    // Document stays interactive (Collabora wired in 085-collabora-callout)
    expect(items[0]).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('the More trigger is not one of the radio options', () => {
    render(<FramingChipStrip value="none" onChange={vi.fn()} />);
    const more = screen.getByRole('button', { name: 'forms.moreFramingTypes' });
    // It sits beside the radiogroup, not inside it — it is a way to reach the
    // other options, not an option.
    expect(more).not.toHaveAttribute('role', 'radio');
    expect(screen.getByRole('radiogroup')).not.toContainElement(more);
  });

  test('a chip chosen from the menu joins the row and stays clearable', async () => {
    render(<FramingChipStrip value="poll" onChange={vi.fn()} />);
    const chips = screen.getAllByRole('radio');
    expect(chips.map(chip => chip.getAttribute('aria-label'))).toEqual([...ROW_LABELS, 'callout.poll']);
    expect(screen.getByRole('radio', { name: /callout.poll/i, checked: true })).toBeInTheDocument();
    // ...and is no longer duplicated in the menu.
    const items = await openMore();
    expect(items.map(item => item.textContent)).not.toContain('callout.poll');
  });

  test('fewer than five available chips renders them all with no More menu', () => {
    render(<FramingChipStrip value="none" onChange={vi.fn()} allowedChips={['whiteboard', 'memo', 'poll', 'cta']} />);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: 'forms.moreFramingTypes' })).toBeNull();
  });

  test('edit mode: the More trigger is inert — the framing type cannot be switched', () => {
    render(<FramingChipStrip value="poll" onChange={vi.fn()} editMode={true} />);
    const more = screen.getByRole('button', { name: 'forms.moreFramingTypes' });
    expect(more).toBeDisabled();
    expect(more).toHaveAttribute('title', 'forms.typeLockedHint');
  });

  test('choosing contributors from the menu emits "contributors"', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="none" onChange={onChange} />);
    const items = await openMore();
    await userEvent.click(items.find(item => item.textContent === 'callout.contributors') as HTMLElement);
    expect(onChange).toHaveBeenCalledWith('contributors');
  });

  test('choosing Subspaces from the menu emits "spaces" (feature 013)', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="none" onChange={onChange} />);
    // The chip id is `spaces` but its label key is `callout.subspaces` → "Subspaces".
    const items = await openMore();
    await userEvent.click(items.find(item => item.textContent === 'callout.subspaces') as HTMLElement);
    expect(onChange).toHaveBeenCalledWith('spaces');
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

  test('choosing document from the menu selects it (Collabora framing)', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="none" onChange={onChange} />);
    const items = await openMore();
    await userEvent.click(items.find(item => item.textContent === 'callout.document') as HTMLElement);
    expect(onChange).toHaveBeenCalledWith('document');
  });

  test('edit mode: clicking an inactive chip is a no-op — the framing type cannot be switched', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="poll" onChange={onChange} editMode={true} />);
    const memo = screen.getByRole('radio', { name: /callout.memo/i });
    await userEvent.click(memo);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('edit mode: clicking the active chip asks for confirmation before clearing to "none"', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="poll" onChange={onChange} editMode={true} />);
    const poll = screen.getByRole('radio', { name: /callout.poll/i });
    await userEvent.click(poll);
    // No immediate change — the confirmation dialog gates the clear.
    expect(onChange).not.toHaveBeenCalled();
    const confirm = screen.getByRole('button', { name: 'dialogs.deleteFraming.confirm' });
    await userEvent.click(confirm);
    expect(onChange).toHaveBeenCalledWith('none');
  });

  test('edit mode: cancelling the confirmation leaves the framing unchanged', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="poll" onChange={onChange} editMode={true} />);
    await userEvent.click(screen.getByRole('radio', { name: /callout.poll/i }));
    await userEvent.click(screen.getByRole('button', { name: 'dialogs.deleteFraming.cancel' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  test('edit mode: the active chip stays clearable even when its type is entitlement-disabled', async () => {
    // A `document` callout edited after the office-documents entitlement was
    // revoked: the chip is disabled, but clearing the framing must still work.
    const onChange = vi.fn();
    render(
      <FramingChipStrip
        value="document"
        onChange={onChange}
        editMode={true}
        disabledChips={{ document: { tooltip: 'Office documents not enabled' } }}
      />
    );
    const doc = screen.getByRole('radio', { name: /callout.document/i });
    expect(doc).not.toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(doc);
    // Still gated by the confirmation dialog.
    expect(onChange).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'dialogs.deleteFraming.confirm' }));
    expect(onChange).toHaveBeenCalledWith('none');
  });

  test('selected chip is aria-checked', () => {
    render(<FramingChipStrip value="whiteboard" onChange={vi.fn()} />);
    const whiteboard = screen.getByRole('radio', { name: /callout.whiteboard/i, checked: true });
    expect(whiteboard).toBeInTheDocument();
    const memo = screen.getByRole('radio', { name: /callout.memo/i, checked: false });
    expect(memo).toBeInTheDocument();
  });

  test('allowedChips renders only the listed chips (in CHIPS order)', () => {
    render(<FramingChipStrip value="none" onChange={vi.fn()} allowedChips={['poll', 'cta']} />);
    const chips = screen.getAllByRole('radio');
    expect(chips).toHaveLength(2);
    // Rendered in CHIPS order (cta precedes poll), not in `allowedChips` order.
    expect(chips.map(chip => chip.getAttribute('aria-label'))).toEqual(['callout.callToAction', 'callout.poll']);
    expect(screen.getByRole('radio', { name: /callout.callToAction/i })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /callout.poll/i })).toBeInTheDocument();
    expect(screen.queryByRole('radio', { name: /callout.memo/i })).toBeNull();
  });

  test('allowedChips of [] renders no chips', () => {
    render(<FramingChipStrip value="none" onChange={vi.fn()} allowedChips={[]} />);
    expect(screen.queryAllByRole('radio')).toHaveLength(0);
  });

  test('disabledChips greys the menu item, keeps its reason readable, and ignores clicks', async () => {
    const onChange = vi.fn();
    render(
      <FramingChipStrip
        value="none"
        onChange={onChange}
        disabledChips={{ document: { tooltip: 'Office documents not enabled' } }}
      />
    );
    const items = await openMore();
    const doc = items.find(item => item.textContent === 'callout.document') as HTMLElement;
    expect(doc).toHaveAttribute('aria-disabled', 'true');
    // The reason stays on the element — the item is inert via aria + a prevented
    // select rather than Radix's `disabled`, which would kill the tooltip.
    expect(doc).toHaveAttribute('title', 'Office documents not enabled');
    await userEvent.click(doc);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('disabledChips still greys a chip that is in the row', async () => {
    const onChange = vi.fn();
    render(
      <FramingChipStrip value="none" onChange={onChange} disabledChips={{ memo: { tooltip: 'Memos not enabled' } }} />
    );
    const memo = screen.getByRole('radio', { name: /callout.memo/i });
    expect(memo).toHaveAttribute('aria-disabled', 'true');
    expect(memo).toHaveAttribute('title', 'Memos not enabled');
    await userEvent.click(memo);
    expect(onChange).not.toHaveBeenCalled();
  });
});
