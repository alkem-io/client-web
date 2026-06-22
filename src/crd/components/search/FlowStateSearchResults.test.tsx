import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { type FlowStateSearchLabels, FlowStateSearchResults } from './FlowStateSearchResults';
import type { PostResultCardData } from './PostResultCard';

// CRD components resolve text via the crd namespaces; for a pure-state render
// test we stub i18n so the labels we assert on are deterministic.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const labels: FlowStateSearchLabels = {
  emptyTitle: 'EMPTY_TITLE',
  emptyDescription: 'EMPTY_DESC',
  errorTitle: 'ERROR_TITLE',
  errorDescription: 'ERROR_DESC',
  retry: 'RETRY',
  loadingLabel: 'LOADING',
  appendingLabel: 'APPENDING',
  resultsLabel: 'RESULTS',
};

const result = (id: string): PostResultCardData => ({
  id,
  title: `Callout ${id}`,
  snippet: '',
  type: 'post',
  author: { name: 'Author' },
  date: '',
  spaceName: 'Space',
  href: `/callout/${id}`,
});

const baseProps = {
  results: [] as PostResultCardData[],
  appending: false,
  hasMore: false,
  onResultClick: vi.fn(),
  onRetry: vi.fn(),
  labels,
};

describe('FlowStateSearchResults', () => {
  // FR-015: an empty result set shows a clear empty state, distinct from error.
  test('empty state renders the empty message and not the error/retry (FR-015)', () => {
    render(<FlowStateSearchResults {...baseProps} status="empty" />);

    expect(screen.getByText('EMPTY_TITLE')).toBeInTheDocument();
    expect(screen.queryByText('ERROR_TITLE')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'RETRY' })).not.toBeInTheDocument();
    // The empty state must not be announced as an alert (it is not an error).
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // FR-021: a backend failure shows an inline error with a retry affordance,
  // visually/semantically distinct from the empty state, and keeps prior results.
  test('error state is distinct from empty and offers retry (FR-021)', () => {
    const onRetry = vi.fn();
    render(<FlowStateSearchResults {...baseProps} status="error" onRetry={onRetry} />);

    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('ERROR_TITLE');
    expect(screen.queryByText('EMPTY_TITLE')).not.toBeInTheDocument();

    const retry = screen.getByRole('button', { name: 'RETRY' });
    retry.click();
    expect(onRetry).toHaveBeenCalledTimes(1);
  });

  // FR-023: skeleton placeholder while the first page loads.
  test('loading state renders the skeleton with an accessible label (FR-023)', () => {
    render(<FlowStateSearchResults {...baseProps} status="loading" />);

    expect(screen.getByLabelText('LOADING')).toBeInTheDocument();
    // No results card and no empty/error in the skeleton state.
    expect(screen.queryByText('EMPTY_TITLE')).not.toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // FR-023: footer spinner while appending, with prior results still visible.
  test('appending shows the footer spinner while keeping prior results (FR-023)', () => {
    render(
      <FlowStateSearchResults {...baseProps} status="results" results={[result('a'), result('b')]} appending={true} />
    );

    // Prior results remain on screen during the append.
    expect(screen.getByText('Callout a')).toBeInTheDocument();
    expect(screen.getByText('Callout b')).toBeInTheDocument();
    // The footer append spinner is announced distinctly from the first-page load.
    expect(screen.getByLabelText('APPENDING')).toBeInTheDocument();
    expect(screen.queryByLabelText('LOADING')).not.toBeInTheDocument();
  });
});
