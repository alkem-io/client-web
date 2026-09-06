import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskBoardColumn } from './TaskBoardColumn';

describe('TaskBoardColumn', () => {
  it('renders the name and the count badge from the prop', () => {
    render(<TaskBoardColumn name="To do" count={7} />);
    expect(screen.getByText('To do')).toBeInTheDocument();
    expect(screen.getByText('7')).toBeInTheDocument();
  });

  it('renders a zero count rather than hiding it', () => {
    render(<TaskBoardColumn name="Done" count={0} />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('does not derive the count from the rendered children', () => {
    render(
      <TaskBoardColumn name="Backlog" count={2}>
        <div>card a</div>
        <div>card b</div>
        <div>card c</div>
      </TaskBoardColumn>
    );
    // Three cards render, but the badge shows the authoritative prop value.
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.queryByText('3')).not.toBeInTheDocument();
  });

  it('shows the add affordance only when onAdd is provided', () => {
    const onAdd = vi.fn();
    const { rerender } = render(<TaskBoardColumn name="To do" count={0} addLabel="Add task" />);
    expect(screen.queryByRole('button', { name: 'Add task' })).not.toBeInTheDocument();

    rerender(<TaskBoardColumn name="To do" count={0} addLabel="Add task" onAdd={onAdd} />);
    fireEvent.click(screen.getByRole('button', { name: 'Add task' }));
    expect(onAdd).toHaveBeenCalledTimes(1);
  });

  it('renders the empty state when there are no children', () => {
    render(<TaskBoardColumn name="To do" count={0} emptyLabel="No tasks yet" />);
    expect(screen.getByText('No tasks yet')).toBeInTheDocument();
  });
});
