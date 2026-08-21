import { fireEvent, render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { type TaskBoardColumnModel, TaskBoardView } from './TaskBoardView';

const columns: TaskBoardColumnModel[] = [
  { name: 'Backlog', count: 1, cards: [{ id: 'a', title: 'Task A' }] },
  { name: 'To do', count: 0, cards: [] },
  { name: 'Done', count: 1, cards: [{ id: 'b', title: 'Task B' }] },
];

describe('TaskBoardView', () => {
  it('renders columns in the given order', () => {
    render(<TaskBoardView columns={columns} />);
    const headings = screen.getAllByText(/Backlog|To do|Done/).map(node => node.textContent);
    expect(headings).toEqual(['Backlog', 'To do', 'Done']);
  });

  it('lays out columns in a horizontally scrolling non-wrapping row', () => {
    const { container } = render(<TaskBoardView columns={columns} />);
    const row = container.firstChild as HTMLElement;
    expect(row.className).toContain('overflow-x-auto');
    expect(row.className).toContain('flex-nowrap');
  });

  it('renders cards under their columns', () => {
    render(<TaskBoardView columns={columns} />);
    expect(screen.getByText('Task A')).toBeInTheDocument();
    expect(screen.getByText('Task B')).toBeInTheDocument();
  });

  it('hides the add affordance in read-only mode', () => {
    render(<TaskBoardView columns={columns} addLabel="Add task" onAddTask={vi.fn()} canAdd={false} />);
    expect(screen.queryByRole('button', { name: 'Add task' })).not.toBeInTheDocument();
  });

  it('shows the add affordance and forwards the column when allowed', () => {
    const onAddTask = vi.fn();
    render(<TaskBoardView columns={columns} addLabel="Add task" onAddTask={onAddTask} canAdd={true} />);
    const addButtons = screen.getAllByRole('button', { name: 'Add task' });
    fireEvent.click(addButtons[0]);
    expect(onAddTask).toHaveBeenCalledWith('Backlog');
  });

  it('opens a task on card click', () => {
    const onOpenTask = vi.fn();
    render(<TaskBoardView columns={columns} onOpenTask={onOpenTask} />);
    fireEvent.click(screen.getByText('Task A'));
    expect(onOpenTask).toHaveBeenCalledWith('a');
  });

  it('lets a connector wrap each card via renderCard', () => {
    render(
      <TaskBoardView
        columns={columns}
        renderCard={(card, column, defaultCard) => (
          <div data-testid={`wrap-${card.id}`} data-column={column}>
            {defaultCard}
          </div>
        )}
      />
    );
    const wrapped = screen.getByTestId('wrap-a');
    expect(wrapped.getAttribute('data-column')).toBe('Backlog');
    expect(within(wrapped).getByText('Task A')).toBeInTheDocument();
  });
});
