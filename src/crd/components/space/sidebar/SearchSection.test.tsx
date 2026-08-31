import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { SearchSection } from './SearchSection';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  // SearchMatchSummary (rendered by SearchSection once a filter is active)
  // resolves its sentence through <Trans> — the exact wording is covered by
  // SearchMatchSummary's own tests; here a trivial pass-through is enough to
  // keep the tree renderable.
  Trans: ({ i18nKey }: { i18nKey: string }) => <span>{i18nKey}</span>,
}));

const baseProps = {
  text: '',
  onTextChange: vi.fn(),
  appliedText: '',
  allTags: [] as string[],
  selectedTags: [] as string[],
  onToggleTag: vi.fn(),
  onClear: vi.fn(),
};

describe('SearchSection', () => {
  test('renders the input with the current text value', () => {
    render(<SearchSection {...baseProps} text="climate" />);
    expect(screen.getByRole('searchbox')).toHaveValue('climate');
  });

  test('typing calls onTextChange with the new value', async () => {
    const onTextChange = vi.fn();
    render(<SearchSection {...baseProps} onTextChange={onTextChange} />);

    await userEvent.type(screen.getByRole('searchbox'), 'c');
    expect(onTextChange).toHaveBeenCalledWith('c');
  });

  test('renders no tag list when allTags is empty', () => {
    render(<SearchSection {...baseProps} />);
    expect(screen.queryByRole('button', { name: 'Policy' })).not.toBeInTheDocument();
  });

  test('clicking a chip calls onToggleTag with that tag', async () => {
    const onToggleTag = vi.fn();
    render(<SearchSection {...baseProps} allTags={['Policy', 'Solar']} onToggleTag={onToggleTag} />);

    await userEvent.click(screen.getByRole('button', { name: 'Policy' }));
    expect(onToggleTag).toHaveBeenCalledWith('Policy');
  });

  test('renders no summary when matchCount is undefined even with an active filter', () => {
    render(<SearchSection {...baseProps} appliedText="climate" />);
    expect(screen.queryByRole('button', { name: 'crd-common:filters.clear' })).not.toBeInTheDocument();
  });

  test('renders no summary when nothing is active even with a matchCount', () => {
    render(<SearchSection {...baseProps} matchCount="0" />);
    expect(screen.queryByRole('button', { name: 'crd-common:filters.clear' })).not.toBeInTheDocument();
  });

  test('renders the summary once a filter is active and matchCount is known, and its clear button fires onClear', async () => {
    const onClear = vi.fn();
    render(<SearchSection {...baseProps} appliedText="x" matchCount="3" onClear={onClear} />);

    const clearButton = screen.getByRole('button', { name: 'crd-common:filters.clear' });
    expect(clearButton).toBeInTheDocument();
    await userEvent.click(clearButton);
    expect(onClear).toHaveBeenCalledTimes(1);
  });
});
