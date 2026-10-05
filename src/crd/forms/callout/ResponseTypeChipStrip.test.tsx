import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { ResponseTypeChipStrip } from './ResponseTypeChipStrip';

/** Opens the More menu and returns its items. */
const openMore = async () => {
  await userEvent.click(screen.getByRole('button', { name: 'contributionSettings.moreTypes' }));
  return screen.findAllByRole('menuitem');
};
const labels = (els: HTMLElement[]) => els.map(el => el.getAttribute('aria-label') ?? el.textContent);

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

  test('without Tasks, the row is Links, Posts and Whiteboards; the rest sit behind More', async () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} />);
    expect(labels(screen.getAllByRole('radio'))).toEqual([
      'contributionSettings.types.link',
      'contributionSettings.types.post',
      'contributionSettings.types.whiteboard',
    ]);
    // Documents (story #10083) is still reachable, from the menu.
    const items = await openMore();
    expect(items.map(item => item.textContent)).toEqual([
      'contributionSettings.types.memo',
      'contributionSettings.types.document',
    ]);
  });

  test('with Tasks enabled it takes the third slot and Whiteboards moves to the menu', async () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} showTasksChip={true} tasksLabel="Tasks" />);
    expect(labels(screen.getAllByRole('radio'))).toEqual([
      'contributionSettings.types.link',
      'contributionSettings.types.post',
      'Tasks',
    ]);
    const items = await openMore();
    expect(items.map(item => item.textContent)).toEqual([
      'contributionSettings.types.memo',
      'contributionSettings.types.whiteboard',
      'contributionSettings.types.document',
    ]);
  });

  test('the More trigger is not one of the radio options', () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} />);
    const more = screen.getByRole('button', { name: 'contributionSettings.moreTypes' });
    expect(more).not.toHaveAttribute('role', 'radio');
    expect(screen.getByRole('radiogroup')).not.toContainElement(more);
  });

  test('choosing Documents from the menu selects it', async () => {
    const onChange = vi.fn();
    render(<ResponseTypeChipStrip value="none" onChange={onChange} />);
    const items = await openMore();
    await userEvent.click(items.find(i => i.textContent === 'contributionSettings.types.document') as HTMLElement);
    expect(onChange).toHaveBeenCalledWith('document');
  });

  test('a type chosen from the menu joins the row and drops out of the menu', async () => {
    render(<ResponseTypeChipStrip value="document" onChange={vi.fn()} />);
    expect(labels(screen.getAllByRole('radio'))).toContain('contributionSettings.types.document');
    expect(screen.getByRole('radio', { name: /types.document/i, checked: true })).toBeInTheDocument();
    const items = await openMore();
    expect(items.map(i => i.textContent)).not.toContain('contributionSettings.types.document');
  });

  test('fewer than five available types renders them all with no More menu', () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} allowedChips={['link', 'post', 'memo']} />);
    expect(screen.getAllByRole('radio')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'contributionSettings.moreTypes' })).toBeNull();
  });

  test('locked mode: the More trigger is inert', () => {
    render(<ResponseTypeChipStrip value="post" onChange={vi.fn()} locked={true} />);
    const more = screen.getByRole('button', { name: 'contributionSettings.moreTypes' });
    expect(more).toBeDisabled();
    expect(more).toHaveAttribute('title', 'contributionSettings.typeLockedHint');
  });

  test('Documents chip is not disabled and is excludable via allowedChips like any other chip', () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} allowedChips={['post', 'link']} />);
    expect(screen.queryByRole('radio', { name: /contributionSettings.types.document/i })).toBeNull();
  });

  test('disabledChips: the Documents menu item is aria-disabled, keeps its reason, and cannot be selected', async () => {
    const onChange = vi.fn();
    render(
      <ResponseTypeChipStrip
        value="none"
        onChange={onChange}
        disabledChips={{ document: { tooltip: 'framing.officeDocumentsNotEnabled' } }}
      />
    );
    const items = await openMore();
    const document = items.find(i => i.textContent === 'contributionSettings.types.document') as HTMLElement;
    expect(document).toHaveAttribute('aria-disabled', 'true');
    expect(document).toHaveAttribute('title', 'framing.officeDocumentsNotEnabled');
    await userEvent.click(document);
    expect(onChange).not.toHaveBeenCalled();
  });

  test('disabledChips gates only the named chip — the other response chips stay interactive', async () => {
    const onChange = vi.fn();
    render(
      <ResponseTypeChipStrip
        value="none"
        onChange={onChange}
        disabledChips={{ document: { tooltip: 'framing.officeDocumentsNotEnabled' } }}
      />
    );
    const post = screen.getByRole('radio', { name: /contributionSettings.types.post/i });
    expect(post).not.toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(post);
    expect(onChange).toHaveBeenCalledWith('post');
  });

  test('locked mode: an active type from the menu joins the row and is inert there', async () => {
    const onChange = vi.fn();
    render(<ResponseTypeChipStrip value="document" onChange={onChange} locked={true} />);
    const document = screen.getByRole('radio', { name: /contributionSettings.types.document/i, checked: true });
    expect(document).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(document);
    expect(onChange).not.toHaveBeenCalled();
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
    render(<ResponseTypeChipStrip value="post" onChange={onChange} />);
    const post = screen.getByRole('radio', { name: /contributionSettings.types.post/i });
    await userEvent.click(post);
    expect(onChange).toHaveBeenCalledWith('none');
  });

  test('locked mode: every chip click is a no-op — the response type cannot be changed or cleared', async () => {
    const onChange = vi.fn();
    render(<ResponseTypeChipStrip value="post" onChange={onChange} locked={true} />);
    const whiteboard = screen.getByRole('radio', { name: /contributionSettings.types.whiteboard/i });
    await userEvent.click(whiteboard);
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
    const whiteboard = screen.getByRole('radio', { name: /contributionSettings.types.whiteboard/i });
    expect(whiteboard).toHaveAttribute('aria-disabled', 'true');
    expect(whiteboard).toHaveAttribute('title', 'contributionSettings.typeLockedHint');
  });

  test('allowedChips limits the strip to the listed response types (VC KB: post + link)', () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} allowedChips={['post', 'link']} />);
    const chips = screen.getAllByRole('radio');
    expect(chips).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'contributionSettings.moreTypes' })).toBeNull();
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

  test('the Tasks chip is absent by default and joins the row when enabled', () => {
    const { rerender } = render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} />);
    expect(screen.queryByRole('radio', { name: 'Tasks' })).toBeNull();

    rerender(<ResponseTypeChipStrip value="none" onChange={vi.fn()} showTasksChip={true} tasksLabel="Tasks" />);
    expect(screen.getByRole('radio', { name: 'Tasks' })).toBeInTheDocument();
  });

  test('clicking the Tasks chip fires onSelectTasks', async () => {
    const onSelectTasks = vi.fn();
    render(
      <ResponseTypeChipStrip
        value="none"
        onChange={vi.fn()}
        showTasksChip={true}
        tasksLabel="Tasks"
        onSelectTasks={onSelectTasks}
      />
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Tasks' }));
    expect(onSelectTasks).toHaveBeenCalledTimes(1);
  });

  test('when Tasks is active no response chip reads as selected and clicking one switches away', async () => {
    const onChange = vi.fn();
    render(
      <ResponseTypeChipStrip
        value="post"
        onChange={onChange}
        showTasksChip={true}
        tasksActive={true}
        tasksLabel="Tasks"
        onSelectTasks={vi.fn()}
      />
    );
    // The Tasks chip owns the selection; the (seeded) Post chip must not read checked.
    expect(screen.getByRole('radio', { name: 'Tasks', checked: true })).toBeInTheDocument();
    expect(screen.getByRole('radio', { name: /contributionSettings.types.post/i, checked: false })).toBeInTheDocument();
    // Clicking a real chip selects that response type (the consumer clears the board).
    await userEvent.click(screen.getByRole('radio', { name: /contributionSettings.types.link/i }));
    expect(onChange).toHaveBeenCalledWith('link');
  });
});
