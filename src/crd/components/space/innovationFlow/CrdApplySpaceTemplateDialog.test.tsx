import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { CrdApplySpaceTemplateDialog } from './CrdApplySpaceTemplateDialog';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
  Trans: ({ i18nKey }: { i18nKey: string }) => i18nKey,
}));

const renderDialog = (showSidebarNote?: boolean) =>
  render(
    <CrdApplySpaceTemplateDialog open={true} onClose={vi.fn()} onConfirm={vi.fn()} showSidebarNote={showSidebarNote} />
  );

describe('CrdApplySpaceTemplateDialog sidebar note', () => {
  test('renders the sidebar note when requested', () => {
    renderDialog(true);
    expect(screen.getByText('layout.replaceFlow.applyDialog.sidebarNote')).toBeInTheDocument();
  });

  test('omits the sidebar note by default', () => {
    renderDialog();
    expect(screen.queryByText('layout.replaceFlow.applyDialog.sidebarNote')).not.toBeInTheDocument();
  });
});
