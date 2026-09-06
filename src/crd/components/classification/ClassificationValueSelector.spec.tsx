/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { render, screen } from '@/main/test/testUtils';
import { ClassificationValueSelector } from './ClassificationValueSelector';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-spaceSettings');
});

const VALUES = [
  { id: 'sdg-13', label: '13 · Climate Action' },
  { id: 'sdg-14', label: '14 · Life Below Water' },
  { id: 'sdg-1', label: '1 · No Poverty' },
];

describe('ClassificationValueSelector', () => {
  it('renders values in authored order, never re-sorted', () => {
    render(
      <ClassificationValueSelector
        entryId="e1"
        cardinality="MULTI_SELECT"
        values={VALUES}
        selectedValueIDs={[]}
        onChange={vi.fn()}
      />
    );
    const labels = screen.getAllByRole('checkbox').map(el => el.closest('div')?.textContent);
    expect(labels).toEqual(['13 · Climate Action', '14 · Life Below Water', '1 · No Poverty']);
  });

  it('single-select: choosing a second value REPLACES the first, never accumulates', async () => {
    const onChange = vi.fn();
    render(
      <ClassificationValueSelector
        entryId="e1"
        cardinality="SINGLE_SELECT"
        values={VALUES}
        selectedValueIDs={['sdg-13']}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole('radio', { name: '14 · Life Below Water' }));
    expect(onChange).toHaveBeenCalledWith(['sdg-14']);
  });

  it('multi-select: choosing another value ACCUMULATES onto the existing selection', async () => {
    const onChange = vi.fn();
    render(
      <ClassificationValueSelector
        entryId="e1"
        cardinality="MULTI_SELECT"
        values={VALUES}
        selectedValueIDs={['sdg-13']}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole('checkbox', { name: '14 · Life Below Water' }));
    expect(onChange).toHaveBeenCalledWith(['sdg-13', 'sdg-14']);
  });

  it('multi-select: unchecking emits the complete remaining list (full replacement, FR-012d)', async () => {
    const onChange = vi.fn();
    render(
      <ClassificationValueSelector
        entryId="e1"
        cardinality="MULTI_SELECT"
        values={VALUES}
        selectedValueIDs={['sdg-13', 'sdg-14']}
        onChange={onChange}
      />
    );
    await userEvent.click(screen.getByRole('checkbox', { name: '13 · Climate Action' }));
    expect(onChange).toHaveBeenCalledWith(['sdg-14']);
  });
});
