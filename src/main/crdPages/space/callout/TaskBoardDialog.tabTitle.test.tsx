/**
 * @vitest-environment jsdom
 *
 * A Tasks board callout opens in this dialog (from the feed card and from the
 * callout URL) instead of the callout detail dialog, so it puts the callout
 * title in the browser tab itself.
 */
import { render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setBaseTitle } from '@/core/routing/documentTitle';
import { useDialogTitle } from '@/core/routing/useDialogTitle';
import { TaskBoardDialog } from './TaskBoardDialog';

const translations: Record<string, string> = {
  'pages.titles.separator': ' | ',
  'pages.titles.alkemio': 'Alkemio',
};

vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => translations[key] ?? key, i18n: { language: 'en' } }),
}));
vi.mock('@/core/ui/fullscreen/useFullscreen', () => ({
  useFullscreen: () => ({ fullscreen: false, setFullscreen: vi.fn() }),
}));
vi.mock('@/crd/components/common/CrdFullscreenButton', () => ({ CrdFullscreenButton: () => null }));
vi.mock('./TaskBoardConnector', () => ({ TaskBoardConnector: () => null }));
vi.mock('./TaskBoardManageColumnsButton', () => ({ TaskBoardManageColumnsButton: () => null }));

const PAGE_TITLE = 'Building the A-team | Alkemio';

/** Stands in for the task's detail dialog, which claims the same title on top of the board. */
function TaskDialog({ open }: { open: boolean }) {
  useDialogTitle('Sprint board', open);
  return null;
}

describe('TaskBoardDialog tab title', () => {
  beforeEach(() => {
    setBaseTitle(PAGE_TITLE);
  });

  afterEach(() => {
    setBaseTitle('');
  });

  it('shows the board title while open and the page title once closed', () => {
    const view = render(<TaskBoardDialog calloutId="c1" title="Sprint board" open={true} onOpenChange={vi.fn()} />);
    expect(document.title).toBe('Sprint board | Alkemio');

    view.rerender(<TaskBoardDialog calloutId="c1" title="Sprint board" open={false} onOpenChange={vi.fn()} />);
    expect(document.title).toBe(PAGE_TITLE);
  });

  it('keeps the board title after a task opened on top of it closes', () => {
    const board = (taskOpen: boolean) => (
      <>
        <TaskBoardDialog calloutId="c1" title="Sprint board" open={true} onOpenChange={vi.fn()} />
        <TaskDialog open={taskOpen} />
      </>
    );
    const view = render(board(true));
    expect(document.title).toBe('Sprint board | Alkemio');

    view.rerender(board(false));
    expect(document.title).toBe('Sprint board | Alkemio');
  });
});
