import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { MatchedTerms } from './MatchedTerms';

// CollapsibleTagList pulls its `+N` aria-label from the crd-common namespace;
// stub i18n so the test asserts on deterministic keys.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

describe('MatchedTerms', () => {
  // FR-004 / FR-005: matched query terms render as chips, in query order.
  test('renders every matched term as a chip in query order', () => {
    render(<MatchedTerms terms={['alpha', 'beta']} />);

    const container = screen.getByTestId('matched-terms');
    expect(container).toBeInTheDocument();
    // Each term is rendered (CollapsibleTagList also renders a hidden
    // measurement mirror, so a term may appear more than once — assert presence
    // via getAllByText).
    expect(screen.getAllByText('alpha').length).toBeGreaterThan(0);
    expect(screen.getAllByText('beta').length).toBeGreaterThan(0);

    // Query order is preserved (alpha before beta) in the rendered DOM.
    expect(container.textContent?.indexOf('alpha')).toBeLessThan(container.textContent?.indexOf('beta') ?? -1);
  });

  // FR-004: the full query-ordered array is passed whole so CollapsibleTagList
  // can derive an exact `+N`. The hidden measurement mirror always carries a
  // `+{tags.length}` token sourced from the WHOLE set (never a pre-sliced one),
  // which is the invariant that keeps the overflow count exact for large sets.
  test('passes the full array so the overflow count reflects every term (no pre-slice)', () => {
    const terms = ['one', 'two', 'three', 'four', 'five', 'six', 'seven'];
    render(<MatchedTerms terms={terms} />);

    expect(screen.getByTestId('matched-terms')).toBeInTheDocument();
    // The measurement mirror's `+N` token is computed against the full length,
    // proving the mapper-side array was not capped before the component.
    expect(screen.getByText(`+${terms.length}`)).toBeInTheDocument();
  });

  // FR-004 edge case + no-empty-box: empty/undefined terms render NOTHING.
  test('renders nothing for an empty terms array', () => {
    const { container } = render(<MatchedTerms terms={[]} />);
    expect(screen.queryByTestId('matched-terms')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });

  test('renders nothing when terms is undefined', () => {
    const { container } = render(<MatchedTerms />);
    expect(screen.queryByTestId('matched-terms')).not.toBeInTheDocument();
    expect(container).toBeEmptyDOMElement();
  });
});
