import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { CalloutDeletionSummary } from './CalloutDeletionSummary';
import type { CalloutDeletionSummaryModel } from './calloutDeletionSummary.types';
import { DeleteCalloutDialog } from './DeleteCalloutDialog';

// CRD components resolve text via the crd namespaces; we stub i18n so the
// rendered strings are deterministic keys. Interpolated values are appended
// (`key:content:count`) so header/plural assertions stay meaningful.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, options?: Record<string, unknown>) => {
      const parts = [key];
      if (options && typeof options.content === 'string') parts.push(options.content);
      if (options && typeof options.count === 'number') parts.push(String(options.count));
      return parts.join(':');
    },
  }),
}));

const emptySummary: CalloutDeletionSummaryModel = {
  contributionCount: 0,
  contributions: [],
  links: [],
  commentCount: 0,
};
const summary = (overrides: Partial<CalloutDeletionSummaryModel>): CalloutDeletionSummaryModel => ({
  ...emptySummary,
  ...overrides,
});
const items = (labels: string[]) => labels.map((label, i) => ({ id: `i${i}`, label }));

describe('CalloutDeletionSummary', () => {
  it('heads the table with the contribution total when there is no rich framing content (FR-002)', () => {
    render(
      <CalloutDeletionSummary summary={summary({ contributionCount: 20, contributions: items(['A', 'B', 'C']) })} />
    );

    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('deleteCallout.headerContributions:20')).toBeInTheDocument();
  });

  it('heads the table with "The <kind> and N contributions will be deleted" when framing content exists (FR-004, FR-006)', () => {
    render(
      <CalloutDeletionSummary
        summary={summary({ richContent: 'whiteboard', contributionCount: 20, contributions: items(['A']) })}
      />
    );

    expect(
      screen.getByText('deleteCallout.headerRichContributions:deleteCallout.contentType.whiteboard:20')
    ).toBeInTheDocument();
  });

  it('heads the table with "The <kind> will be deleted" when only framing content exists (FR-004, FR-006)', () => {
    render(<CalloutDeletionSummary summary={summary({ richContent: 'memo' })} />);

    expect(screen.getByText('deleteCallout.headerRich:deleteCallout.contentType.memo')).toBeInTheDocument();
  });

  it('names the poll results in the header — "The poll and its results will be deleted" (FR-006)', () => {
    render(<CalloutDeletionSummary summary={summary({ richContent: 'poll' })} />);

    expect(screen.getByText('deleteCallout.headerRichPoll')).toBeInTheDocument();
  });

  it('keeps the poll-results wording when contributions exist too (FR-006)', () => {
    render(
      <CalloutDeletionSummary summary={summary({ richContent: 'poll', contributionCount: 20, contributions: [] })} />
    );

    expect(screen.getByText('deleteCallout.headerRichPollContributions:20')).toBeInTheDocument();
  });

  it('lists up to 3 contributions as rows — bold title left, one-line markdown description (FR-002, FR-003)', () => {
    render(
      <CalloutDeletionSummary
        summary={summary({
          contributionCount: 5,
          contributions: [
            { id: 'c1', label: 'One', description: 'Plain description' },
            { id: 'c2', label: 'Two', description: '**Bold** markdown description' },
            { id: 'c3', label: 'Three' },
            { id: 'c4', label: 'Four' },
          ],
        })}
      />
    );

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Two')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
    expect(screen.queryByText('Four')).not.toBeInTheDocument();
    // Titles are row headers (bold, left).
    expect(screen.getByText('One').tagName).toBe('TH');
    // Descriptions render as markdown (not raw source) clamped to a single line.
    expect(screen.getByText('Plain description')).toBeInTheDocument();
    expect(screen.getByText('Bold')).toBeInTheDocument();
    expect(screen.queryByText('**Bold** markdown description')).not.toBeInTheDocument();
  });

  it('renders the attachments row with the clip icon as the last row when contributions exist (FR-007)', () => {
    const { container } = render(
      <CalloutDeletionSummary summary={summary({ contributionCount: 2, contributions: items(['A']) })} />
    );

    expect(screen.getByText('deleteCallout.attachmentsNote')).toBeInTheDocument();
    const rows = container.querySelectorAll('tbody tr');
    expect(rows[rows.length - 1].textContent).toContain('deleteCallout.attachmentsNote');
  });

  it('shows the 4th contribution as a row when there are exactly 4 (no overflow line)', () => {
    render(
      <CalloutDeletionSummary
        summary={summary({ contributionCount: 4, contributions: items(['One', 'Two', 'Three', 'Four']) })}
      />
    );

    expect(screen.getByText('Four')).toBeInTheDocument();
    expect(screen.queryByText(/deleteCallout\.moreContributions/)).not.toBeInTheDocument();
  });

  it('shows an "N-3 contributions more..." row when more than 4 exist (FR-003)', () => {
    render(
      <CalloutDeletionSummary
        summary={summary({ contributionCount: 20, contributions: items(['One', 'Two', 'Three', 'Four', 'Five']) })}
      />
    );

    expect(screen.getByText('Three')).toBeInTheDocument();
    expect(screen.queryByText('Four')).not.toBeInTheDocument();
    expect(screen.getByText('deleteCallout.moreContributions:17')).toBeInTheDocument();
  });

  it('counts unnameable contributions into the overflow row (count is authoritative)', () => {
    render(
      <CalloutDeletionSummary summary={summary({ contributionCount: 6, contributions: items(['Only titled one']) })} />
    );

    expect(screen.getByText('Only titled one')).toBeInTheDocument();
    expect(screen.getByText('deleteCallout.moreContributions:5')).toBeInTheDocument();
  });

  it('omits the attachments row when there are no contributions (FR-007)', () => {
    render(<CalloutDeletionSummary summary={summary({ richContent: 'poll', commentCount: 2 })} />);

    expect(screen.queryByText('deleteCallout.attachmentsNote')).not.toBeInTheDocument();
  });

  it('renders the comments row before the attachments row (FR-014)', () => {
    const { container } = render(
      <CalloutDeletionSummary
        summary={summary({ contributionCount: 2, contributions: items(['A']), commentCount: 27 })}
      />
    );

    expect(screen.getByText('deleteCallout.comments:27')).toBeInTheDocument();
    const rowTexts = [...container.querySelectorAll('tbody tr')].map(row => row.textContent ?? '');
    expect(rowTexts.indexOf('deleteCallout.comments:27')).toBeLessThan(
      rowTexts.findIndex(text => text.includes('deleteCallout.attachmentsNote'))
    );
  });

  it('renders a comments-only table when only comments exist (FR-014)', () => {
    render(<CalloutDeletionSummary summary={summary({ commentCount: 5 })} />);

    expect(screen.getByText('deleteCallout.comments:5')).toBeInTheDocument();
    expect(screen.queryByText(/deleteCallout\.header/)).not.toBeInTheDocument();
  });

  it('lists named links below the table, capping at 3 with an "and N more links" line (FR-003, FR-005)', () => {
    render(<CalloutDeletionSummary summary={summary({ links: items(['One', 'Two', 'Three', 'Four', 'Five']) })} />);

    expect(screen.getByText('One')).toBeInTheDocument();
    expect(screen.getByText('Three')).toBeInTheDocument();
    expect(screen.queryByText('Four')).not.toBeInTheDocument();
    expect(screen.getByText('deleteCallout.moreLinks:2')).toBeInTheDocument();
    // Links alone produce no table.
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('truncates long contribution titles and link labels so the dialog stays readable', () => {
    const longTitle = 'A very long contribution title that would otherwise stretch the dialog beyond readable width';
    const longLabel = 'A very long link label that would otherwise stretch the dialog beyond its readable width';
    render(
      <CalloutDeletionSummary
        summary={summary({
          contributionCount: 1,
          contributions: [{ id: 'c1', label: longTitle }],
          links: [{ id: 'l1', label: longLabel }],
        })}
      />
    );

    expect(screen.getByText(longTitle)).toHaveClass('truncate');
    expect(screen.getByText(longLabel)).toHaveClass('truncate');
  });

  it('renders nothing at all for an all-empty summary (FR-008)', () => {
    const { container } = render(<CalloutDeletionSummary summary={emptySummary} />);

    expect(container).toBeEmptyDOMElement();
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
    render(
      <DeleteCalloutDialog
        {...baseProps}
        content={summary({ contributionCount: 2, contributions: items(['A', 'B']), commentCount: 1 })}
      />
    );

    expect(screen.getByRole('button', { name: 'deleteCallout.confirmAll' })).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(screen.getByText('A')).toBeInTheDocument();
  });

  it('keeps the plain confirm label and omits the content body for an empty callout (FR-008, FR-009)', () => {
    render(<DeleteCalloutDialog {...baseProps} content={emptySummary} />);

    expect(screen.getByRole('button', { name: 'deleteCallout.confirm' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('behaves as the concise form when no summary is provided at all', () => {
    render(<DeleteCalloutDialog {...baseProps} />);

    expect(screen.getByRole('button', { name: 'deleteCallout.confirm' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).not.toBeInTheDocument();
  });

  it('offers an X close control in the title bar that closes without deleting', () => {
    const onOpenChange = vi.fn();
    const onConfirm = vi.fn();
    render(<DeleteCalloutDialog {...baseProps} onOpenChange={onOpenChange} onConfirm={onConfirm} />);

    const closeButton = screen.getByRole('button', { name: 'dialogs.close' });
    closeButton.click();

    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
