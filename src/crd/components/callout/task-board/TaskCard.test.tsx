import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { TaskCard, TaskCardSkeleton } from './TaskCard';

describe('TaskCard', () => {
  it('renders the title clamped to two lines', () => {
    render(<TaskCard title="A task title" />);
    const title = screen.getByText('A task title');
    expect(title.className).toContain('line-clamp-2');
  });

  it('clamps the description to two lines', () => {
    const { container } = render(<TaskCard title="t" description="some description" />);
    const description = container.querySelector('.line-clamp-2.text-body');
    expect(description).toBeInTheDocument();
  });

  it('renders the author and comment count', () => {
    render(<TaskCard title="t" author={{ name: 'Ada' }} commentCount={3} />);
    expect(screen.getByText('Ada')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('hides the comment counter when the count is zero', () => {
    render(<TaskCard title="t" commentCount={0} />);
    expect(screen.queryByText('0')).not.toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<TaskCard title="t" tags={['alpha', 'beta']} />);
    expect(screen.getAllByText('alpha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('beta').length).toBeGreaterThan(0);
  });

  it('invokes onClick on click and on Enter', () => {
    const onClick = vi.fn();
    render(<TaskCard title="t" onClick={onClick} />);
    const card = screen.getByRole('button');
    fireEvent.click(card);
    fireEvent.keyDown(card, { key: 'Enter' });
    expect(onClick).toHaveBeenCalledTimes(2);
  });
});

describe('TaskCardSkeleton', () => {
  it('renders placeholder bars', () => {
    const { container } = render(<TaskCardSkeleton />);
    expect(container.querySelectorAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
  });
});
