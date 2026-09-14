/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { render, screen } from '@/main/test/testUtils';
import { ClassificationRemoveConfirm } from './ClassificationRemoveConfirm';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces(['crd-spaceSettings', 'crd-space']);
});

describe('ClassificationRemoveConfirm', () => {
  it('requires confirmation and states removal is permanent — no undo, no soft-delete (FR-014b, REM-AS1)', () => {
    render(<ClassificationRemoveConfirm open={true} onOpenChange={vi.fn()} displayLabel="SDGs" onConfirm={vi.fn()} />);
    expect(screen.getByText(/Remove this classification\?/i)).toBeInTheDocument();
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
    expect(screen.getByText(/SDGs/)).toBeInTheDocument();
  });

  it('requires confirmation identically for an entry with NO values selected (FR-014b applies always)', () => {
    // The dialog copy does not vary with whether values are selected — the caller
    // opens it identically either way, so a zero-value entry gets the same prompt.
    render(
      <ClassificationRemoveConfirm open={true} onOpenChange={vi.fn()} displayLabel="Sector" onConfirm={vi.fn()} />
    );
    expect(screen.getByText(/Remove this classification\?/i)).toBeInTheDocument();
  });

  it('only calls onConfirm when the destructive action is explicitly clicked', async () => {
    const onConfirm = vi.fn();
    render(
      <ClassificationRemoveConfirm open={true} onOpenChange={vi.fn()} displayLabel="SDGs" onConfirm={onConfirm} />
    );
    expect(onConfirm).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole('button', { name: 'Remove' }));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('cancelling does not call onConfirm', async () => {
    const onConfirm = vi.fn();
    const onOpenChange = vi.fn();
    render(
      <ClassificationRemoveConfirm open={true} onOpenChange={onOpenChange} displayLabel="SDGs" onConfirm={onConfirm} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(onConfirm).not.toHaveBeenCalled();
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
