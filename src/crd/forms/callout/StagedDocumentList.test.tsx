import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { StagedDocumentList, type StagedDocumentItem } from './StagedDocumentList';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const items: StagedDocumentItem[] = [
  { key: 'a', name: 'alpha.docx', size: 2048, status: 'staged' },
  { key: 'b', name: 'beta.xlsx', size: 1536 * 1024, status: 'importing' },
  { key: 'c', name: 'gamma.pptx', size: 10, status: 'failed', error: 'It broke' },
];

describe('StagedDocumentList', () => {
  test('lists each item with its name, size and status', () => {
    render(<StagedDocumentList items={items} busy={false} onRemove={vi.fn()} />);

    const rows = screen.getAllByRole('listitem');
    expect(rows).toHaveLength(3);
    expect(rows[0]).toHaveTextContent('alpha.docx');
    expect(rows[0]).toHaveTextContent('2.0 KB');
    expect(rows[1]).toHaveTextContent('beta.xlsx');
    expect(rows[1]).toHaveTextContent('1.5 MB');
    expect(rows[1]).toHaveTextContent('callout.documentImporting');
    expect(rows[2]).toHaveTextContent('It broke');
  });

  test('the remove button calls onRemove with the key', async () => {
    const onRemove = vi.fn();
    render(<StagedDocumentList items={items} busy={false} onRemove={onRemove} />);

    await userEvent.click(screen.getAllByRole('button', { name: 'callout.documentImportRemoveFile' })[2]);
    expect(onRemove).toHaveBeenCalledWith('c');
  });

  test('remove buttons are disabled while busy', () => {
    render(<StagedDocumentList items={items} busy={true} onRemove={vi.fn()} />);

    for (const button of screen.getAllByRole('button', { name: 'callout.documentImportRemoveFile' })) {
      expect(button).toBeDisabled();
    }
  });
});
