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

  test('renders the five response chips, including Documents (story #10083)', () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} />);
    const chips = screen.getAllByRole('radio');
    expect(chips).toHaveLength(5);
    expect(screen.getByRole('radio', { name: /contributionSettings.types.document/i })).toBeInTheDocument();
  });

  test('clicking the inactive Documents chip selects it', async () => {
    const onChange = vi.fn();
    render(<ResponseTypeChipStrip value="none" onChange={onChange} />);
    const document = screen.getByRole('radio', { name: /contributionSettings.types.document/i });
    await userEvent.click(document);
    expect(onChange).toHaveBeenCalledWith('document');
  });

  test('Documents chip is not disabled and is excludable via allowedChips like any other chip', () => {
    render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} allowedChips={['post', 'link']} />);
    expect(screen.queryByRole('radio', { name: /contributionSettings.types.document/i })).toBeNull();
  });

  test('disabledChips: the Documents chip is aria-disabled with the entitlement tooltip and cannot be selected', async () => {
    const onChange = vi.fn();
    render(
      <ResponseTypeChipStrip
        value="none"
        onChange={onChange}
        disabledChips={{ document: { tooltip: 'framing.officeDocumentsNotEnabled' } }}
      />
    );
    const document = screen.getByRole('radio', { name: /contributionSettings.types.document/i });
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

  test('locked mode: the Documents chip is also inert when active', async () => {
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

  test('the Tasks chip is absent by default and appears as a sixth chip when enabled', () => {
    const { rerender } = render(<ResponseTypeChipStrip value="none" onChange={vi.fn()} />);
    expect(screen.getAllByRole('radio')).toHaveLength(5);

    rerender(<ResponseTypeChipStrip value="none" onChange={vi.fn()} showTasksChip={true} tasksLabel="Tasks" />);
    const chips = screen.getAllByRole('radio');
    expect(chips).toHaveLength(6);
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
    await userEvent.click(screen.getByRole('radio', { name: /contributionSettings.types.memo/i }));
    expect(onChange).toHaveBeenCalledWith('memo');
  });
});
