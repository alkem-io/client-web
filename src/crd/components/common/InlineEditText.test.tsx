import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { InlineEditText } from './InlineEditText';

describe('InlineEditText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('commits the full draft, including the last keystroke, when the idle timer fires', () => {
    const onChange = vi.fn();
    render(<InlineEditText value="" onChange={onChange} ariaLabel="Tagline" editAriaLabel="Edit tagline" />);

    fireEvent.click(screen.getByRole('button', { name: 'Edit tagline' }));
    const input = screen.getByRole('textbox', { name: 'Tagline' });
    fireEvent.change(input, { target: { value: 'Fan of the first hou' } });
    fireEvent.change(input, { target: { value: 'Fan of the first hour' } });

    act(() => {
      vi.advanceTimersByTime(2000);
    });

    expect(onChange).toHaveBeenCalledTimes(1);
    expect(onChange).toHaveBeenCalledWith('Fan of the first hour');
  });
});
