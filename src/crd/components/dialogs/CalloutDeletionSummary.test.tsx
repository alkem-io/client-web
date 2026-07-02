import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutDeletionSummary } from './CalloutDeletionSummary';
import type { CalloutDeletionSummaryModel } from './calloutDeletionSummary.types';
import { DeleteCalloutDialog } from './DeleteCalloutDialog';

// CRD components resolve text via the crd namespaces; we stub i18n so the
// rendered strings are deterministic keys. Counted/interpolated keys carry
// their value (`key:3`) so plural-count assertions stay meaningful.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      if (options && typeof options.count === 'number') return `${key}:${options.count}`;
      if (options && typeof options.content === 'string') return `${key}:${options.content}`;
      return key;
    },
  }),
}));

const emptySummary: CalloutDeletionSummaryModel = { contributionCount: 0, links: [], commentCount: 0 };
const summary = (overrides: Partial<CalloutDeletionSummaryModel>): CalloutDeletionSummaryModel => ({
  ...emptySummary,
  ...overrides,
});

describe('CalloutDeletionSummary', () => {
  it('renders the intro line and the pluralized contribution count with the attachments note (FR-002, FR-007)', () => {
    render(<CalloutDeletionSummary summary={summary({ contributionCount: 3 })} />);

    expect(screen.getByText('deleteCallout.contentsIntro')).toBeInTheDocument();
    expect(screen.getByText('deleteCallout.contributions:3')).toBeInTheDocument();
    expect(screen.getByText('deleteCallout.attachmentsNote')).toBeInTheDocument();
  });

  it('omits the attachments note when there are no contributions (FR-007)', () => {
    render(<CalloutDeletionSummary summary={summary({ commentCount: 2 })} />);

    expect(screen.queryByText('deleteCallout.attachmentsNote')).not.toBeInTheDocument();
  });

  it('names the rich framing content by kind (FR-004, FR-006)', () => {
    render(<CalloutDeletionSummary summary={summary({ richContent: 'whiteboard' })} />);

    expect(screen.getByText('deleteCallout.including:deleteCallout.contentType.whiteboard')).toBeInTheDocument();
  });

  it('lists named links, capping at 3 with an "and N more links" line (FR-003, FR-005)', () => {
    const links = ['One', 'Two', 'Three', 'Four', 'Five'].map((label, i) => ({ id: `l${i}`, label }));
    render(<CalloutDeletionSummary summary={summary({ links })} />);

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
    expect(screen.queryByText('Four')).not.toBeInTheDocument();
    expect(screen.queryByText('Five')).not.toBeInTheDocument();
    expect(screen.getByText('deleteCallout.moreLinks:2')).toBeInTheDocument();
  });

  it('renders the comment count line (FR-014)', () => {
    render(<CalloutDeletionSummary summary={summary({ commentCount: 5 })} />);

    expect(screen.getByText('deleteCallout.comments:5')).toBeInTheDocument();
  });

  it('truncates long link labels so the dialog stays readable', () => {
    const longLabel = 'A very long link label that would otherwise stretch the dialog beyond its readable width';
    render(<CalloutDeletionSummary summary={summary({ links: [{ id: 'l1', label: longLabel }] })} />);

    expect(screen.getByText(longLabel)).toHaveClass('truncate');
  });

  it('renders nothing at all for an all-empty summary (FR-008)', () => {
    const { container } = render(<CalloutDeletionSummary summary={emptySummary} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});

describe('DeleteCalloutDialog', () => {
  const baseProps = {
    open: true,
    onOpenChange: vi.fn(),
    calloutTitle: 'My callout',
    onConfirm: vi.fn(),
  };

  it('uses the scope-reflecting confirm label and renders the summary when content is present (FR-009)', () => {
    render(<DeleteCalloutDialog {...baseProps} content={summary({ contributionCount: 2, commentCount: 1 })} />);

    expect(screen.getByRole('button', { name: 'deleteCallout.confirmAll' })).toBeInTheDocument();
    expect(screen.getByRole('list')).toBeInTheDocument();
  });

  it('keeps the plain confirm label and omits the content body for an empty callout (FR-008, FR-009)', () => {
    render(<DeleteCalloutDialog {...baseProps} content={emptySummary} />);

    expect(screen.getByRole('button', { name: 'deleteCallout.confirm' })).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
    expect(screen.queryByText('deleteCallout.contentsIntro')).not.toBeInTheDocument();
  });

  it('behaves as the concise form when no summary is provided at all', () => {
    render(<DeleteCalloutDialog {...baseProps} />);

    expect(screen.getByRole('button', { name: 'deleteCallout.confirm' })).toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
