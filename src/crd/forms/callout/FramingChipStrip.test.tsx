import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, test, vi } from 'vitest';
import { type FramingChipId, FramingChipStrip } from './FramingChipStrip';

/** The three chips kept in the row; everything else is behind "More". */
const ROW_LABELS = ['callout.whiteboard', 'callout.memo', 'callout.mediaGallery'];

/** Opens the More menu and returns its items. */
const openMore = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'forms.moreFramingTypesHeading' }));
  return screen.findAllByRole('menuitem');
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

/** Holds the selection, as the consumer does, so a clear actually re-renders the row. */
const Controlled = ({ initial, editMode }: { initial: FramingChipId | 'none'; editMode?: boolean }) => {
  const [value, setValue] = useState(initial);
  return <FramingChipStrip value={value} onChange={setValue} editMode={editMode} />;
};

describe('FramingChipStrip', () => {
  test('renders the three most-used chips in the row, the rest behind More', async () => {
    render(<FramingChipStrip value="none" onChange={vi.fn()} />);
    expect(screen.getByRole('radiogroup')).toBeInTheDocument();
    const chips = screen.getAllByRole('radio');
    expect(chips.map(chip => chip.getAttribute('aria-label'))).toEqual(ROW_LABELS);

    // The remaining six — including the admin-gated `contributors` (008),
    // `spaces` (013) and `form` (080) — are reachable from the menu, in CHIPS
    // order. The component renders every chip by default; the consumer
    // (CalloutFormConnector) leaves the admin chips out of `allowedChips` for
    // anyone who is not a space admin.
    const items = await openMore();
    expect(items.map(item => item.textContent)).toEqual([
      'callout.document',
      'callout.callToAction',
      'callout.poll',
      'callout.contributors',
      'callout.subspaces',
      'callout.form',
    ]);
    // Document stays interactive (Collabora wired in 085-collabora-callout)
    expect(items[0]).not.toHaveAttribute('aria-disabled', 'true');
  });

  test('the More trigger is not one of the radio options', () => {
    render(<FramingChipStrip value="none" onChange={vi.fn()} />);
    const more = screen.getByRole('button', { name: 'forms.moreFramingTypesHeading' });
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

  test("with a single chip left over there is no More menu — that chip takes the trigger's slot", () => {
    render(<FramingChipStrip value="none" onChange={vi.fn()} allowedChips={['whiteboard', 'memo', 'image', 'poll']} />);
    expect(screen.getAllByRole('radio')).toHaveLength(4);
    expect(screen.queryByRole('button', { name: 'forms.moreFramingTypesHeading' })).toBeNull();
  });

  test('clearing a chip picked from the menu keeps it in the row, so focus stays on it', async () => {
    render(<Controlled initial="none" />);
    const items = await openMore();
    await userEvent.click(items.find(item => item.textContent === 'callout.poll') as HTMLElement);
    const poll = screen.getByRole('radio', { name: 'callout.poll', checked: true });
    await userEvent.click(poll);
    expect(poll).toBeInTheDocument();
    expect(poll).toHaveAttribute('aria-checked', 'false');
    expect(poll).toHaveFocus();
  });

  test('edit mode: confirming the clear of a menu chip keeps it in the row for focus to return to', async () => {
    render(<Controlled initial="poll" editMode={true} />);
    const poll = screen.getByRole('radio', { name: 'callout.poll', checked: true });
    await userEvent.click(poll);
    await userEvent.click(await screen.findByRole('button', { name: 'dialogs.deleteFraming.confirm' }));
    expect(poll).toBeInTheDocument();
    expect(poll).toHaveAttribute('aria-checked', 'false');
  });

  test('edit mode: the More trigger stays focusable but inert, and carries the lock hint', async () => {
    render(<FramingChipStrip value="poll" onChange={vi.fn()} editMode={true} />);
    const more = screen.getByRole('button', { name: 'forms.moreFramingTypesHeading' });
    expect(more).not.toBeDisabled();
    expect(more).toHaveAttribute('aria-disabled', 'true');
    expect(more).toHaveAttribute('title', 'forms.typeLockedHint');
    await userEvent.click(more);
    expect(screen.queryByRole('menu')).toBeNull();
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

  test('edit mode: a fixed-kind active chip has no clear dialog and is aria-disabled', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="form" onChange={onChange} editMode={true} fixedKindChips={['form']} />);
    const form = screen.getByRole('radio', { name: /callout.form/i });
    expect(form).toHaveAttribute('aria-disabled', 'true');
    expect(form).toHaveAttribute('title', 'forms.typeLockedHint');
    await userEvent.click(form);
    expect(onChange).not.toHaveBeenCalled();
    expect(screen.queryByRole('button', { name: 'dialogs.deleteFraming.confirm' })).toBeNull();
  });

  test('edit mode: other active chips stay clearable when fixedKindChips lists a different chip', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="poll" onChange={onChange} editMode={true} fixedKindChips={['form']} />);
    const poll = screen.getByRole('radio', { name: /callout.poll/i });
    expect(poll).not.toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(poll);
    await userEvent.click(screen.getByRole('button', { name: 'dialogs.deleteFraming.confirm' }));
    expect(onChange).toHaveBeenCalledWith('none');
  });

  test('create mode: the form chip selects and clears like any other chip', async () => {
    const onChange = vi.fn();
    render(<FramingChipStrip value="none" onChange={onChange} fixedKindChips={['form']} />);
    // Form sits behind More; picking it there selects it like any other chip.
    const items = await openMore();
    const form = items.find(item => item.textContent === 'callout.form');
    expect(form).toBeDefined();
    if (form) await userEvent.click(form);
    expect(onChange).toHaveBeenCalledWith('form');
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
    const doc = items.find(item => item.textContent?.startsWith('callout.document')) as HTMLElement;
    expect(doc).toHaveAttribute('aria-disabled', 'true');
    // The reason is text in the item, so it is read with it when the arrow keys
    // land there — not a `title` only a mouse can reach. The item stays in the
    // roving focus because it is inert via aria rather than Radix's `disabled`.
    expect(doc).toHaveTextContent('Office documents not enabled');
    expect(doc).not.toHaveAttribute('data-disabled');
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
    // pointer-events-none would swallow the hover that shows that title.
    expect(memo).not.toHaveClass('pointer-events-none');
    await userEvent.click(memo);
    expect(onChange).not.toHaveBeenCalled();
  });
});
