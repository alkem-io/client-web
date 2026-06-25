import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { CollaboraDocumentResultCard, type CollaboraDocumentResultCardData } from './CollaboraDocumentResultCard';

// CRD components resolve text via the crd namespaces; for a pure-render test we
// stub i18n so the labels we assert on are deterministic. Interpolation params
// are appended so we can assert against the underlying business values.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: Record<string, unknown>) => (params ? `${key} ${Object.values(params).join(' ')}` : key),
  }),
}));

const framingDocument: CollaboraDocumentResultCardData = {
  id: 'doc-1',
  title: 'Quarterly Plan',
  isContribution: false,
  author: { name: 'Ada Lovelace' },
  date: 'Jan 1, 2026',
  spaceName: 'Engineering',
  parentPostTitle: 'Roadmap',
  href: '/spaces/eng/collabora/doc-1',
};

const contributionDocument: CollaboraDocumentResultCardData = {
  ...framingDocument,
  id: 'doc-2',
  isContribution: true,
};

describe('CollaboraDocumentResultCard', () => {
  // US3 acceptance scenario 1: renders as a standard card and is openable in one action.
  test('renders a standard card and opens the document in one click', () => {
    const onClick = vi.fn();
    render(<CollaboraDocumentResultCard document={framingDocument} onClick={onClick} />);

    // Standard card: title + a single button that is the one-action open path.
    expect(screen.getByText('Quarterly Plan')).toBeInTheDocument();
    const card = screen.getByRole('button', { name: 'Quarterly Plan' });
    card.click();
    expect(onClick).toHaveBeenCalledTimes(1);

    // It carries the standard document type badge, not a match-source label.
    expect(screen.getByText('search.postTypes.collaboraDocument')).toBeInTheDocument();
  });

  // US3 acceptance scenario 2 / FR-013: NO excerpt of the document text and NO
  // indicator that the match originated from document content.
  test('shows no excerpt and no match-source indicator (FR-013)', () => {
    render(<CollaboraDocumentResultCard document={framingDocument} onClick={vi.fn()} />);

    // There is no snippet/excerpt element — the card never receives document body
    // text, so no document-content string is rendered.
    expect(screen.queryByText(/matched in document/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/document content/i)).not.toBeInTheDocument();
    // No excerpt prop exists on the card data; assert no stray prose paragraph
    // beyond the title/badge/context is rendered for a framing document.
    expect(screen.queryByText('search.responseTo Roadmap')).not.toBeInTheDocument();
  });

  // A contribution-placed document shows its owning Post context (standard
  // contribution card behaviour) — still no excerpt, still no match-source badge.
  test('contribution document shows owning Post context', () => {
    render(<CollaboraDocumentResultCard document={contributionDocument} onClick={vi.fn()} />);

    expect(screen.getByText('search.responseTo Roadmap')).toBeInTheDocument();
    expect(screen.getByText('search.postTypes.collaboraDocument')).toBeInTheDocument();
  });
});
