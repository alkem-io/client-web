/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { render, screen } from '@/main/test/testUtils';
import { ClassificationGroupList } from './ClassificationGroupList';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-space');
});

describe('ClassificationGroupList', () => {
  it('renders each entry as a labelled group with values beneath, in the given (sortOrder) order — FR-018, FR-018b', () => {
    render(
      <ClassificationGroupList
        entries={[
          {
            id: 'first',
            displayLabel: 'SDGs',
            values: ['13 · Climate Action', '14 · Life Below Water'],
            hidden: false,
          },
          { id: 'second', displayLabel: 'Sector', values: ['Healthcare'], hidden: false },
        ]}
        canEdit={false}
      />
    );
    const headings = screen.getAllByRole('heading', { level: 3 }).map(h => h.textContent);
    expect(headings).toEqual(['SDGs', 'Sector']);
    expect(screen.getByText('13 · Climate Action')).toBeInTheDocument();
    expect(screen.getByText('14 · Life Below Water')).toBeInTheDocument();
    expect(screen.getByText('Healthcare')).toBeInTheDocument();
  });

  it('preserves the authored value order within a group, never re-sorting (FR-002b)', () => {
    render(
      <ClassificationGroupList
        entries={[{ id: 'e1', displayLabel: 'SDGs', values: ['Zebra goal', 'Alpha goal'], hidden: false }]}
        canEdit={false}
      />
    );
    const items = screen.getAllByRole('listitem').map(li => li.textContent);
    expect(items).toEqual(['Zebra goal', 'Alpha goal']);
  });

  it('renders nothing when there are no entries to show (caller already filtered by audience)', () => {
    const { container } = render(<ClassificationGroupList entries={[]} canEdit={false} />);
    expect(container).toBeEmptyDOMElement();
  });

  it('marks a hidden entry for an editor, worded "not shown on the Space page" — never "private" (C-4, FR-010d)', () => {
    render(
      <ClassificationGroupList
        entries={[{ id: 'e1', displayLabel: 'SDGs', values: ['13'], hidden: true }]}
        canEdit={true}
      />
    );
    expect(screen.getByText('Not shown on the Space page')).toBeInTheDocument();
    expect(screen.queryByText(/private/i)).not.toBeInTheDocument();
  });

  it('shows an edit affordance for an editor that deep-links via onEditEntry', async () => {
    const onEditEntry = vi.fn();
    render(
      <ClassificationGroupList
        entries={[{ id: 'e1', displayLabel: 'SDGs', values: ['13'], hidden: false }]}
        canEdit={true}
        onEditEntry={onEditEntry}
      />
    );
    screen.getByRole('button', { name: 'Edit in Settings' }).click();
    expect(onEditEntry).toHaveBeenCalledWith('e1');
  });
});
