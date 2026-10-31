import type { ExcalidrawImperativeAPI } from '@excalidraw-yjs/excalidraw/types';
import { act, render, screen } from '@testing-library/react';
import { type ReactNode, useState } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { useDialogCloseGuard } from '@/crd/components/dialogs/useDialogCloseGuard';
import { WhiteboardEditorShell } from '@/crd/components/whiteboard/WhiteboardEditorShell';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/crd/primitives/dialog';
import { handleExcalidrawEscape } from '@/domain/common/whiteboard/excalidraw/excalidrawEscape';
import { APP_BACK_CONTRACT_VERSION, handleAppBack, installAppBack } from './appBack';

const back = () => {
  let result = false;
  act(() => {
    result = handleAppBack();
  });
  return result;
};

type TestDialogProps = {
  label: string;
  onOpenChange?: (open: boolean) => void;
  onEscapeKeyDown?: (event: KeyboardEvent) => void;
  children?: ReactNode;
};

/** A controlled CRD dialog that unmounts when Radix asks it to close. */
const TestDialog = ({ label, onOpenChange, onEscapeKeyDown, children }: TestDialogProps) => {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      open={open}
      onOpenChange={next => {
        onOpenChange?.(next);
        setOpen(next);
      }}
    >
      <DialogContent aria-describedby={undefined} onEscapeKeyDown={onEscapeKeyDown}>
        <DialogTitle>{label}</DialogTitle>
        {children}
      </DialogContent>
    </Dialog>
  );
};

const GuardedDialog = ({ onClose }: { onClose: () => void }) => {
  const [open, setOpen] = useState(true);
  const { handleOpenChange, guardElement } = useDialogCloseGuard({
    isDirty: true,
    onClose: () => {
      onClose();
      setOpen(false);
    },
  });
  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogTitle>Draft</DialogTitle>
          <DialogDescription>Unsaved input</DialogDescription>
        </DialogContent>
      </Dialog>
      {guardElement}
    </>
  );
};

type StubAppState = Record<string, unknown> & { activeTool: { type: string; locked: boolean } };

/** A stand-in for the Excalidraw API that keeps the app state the escape handler reads and writes. */
const stubExcalidrawAPI = (overrides: Partial<StubAppState> = {}) => {
  const state: StubAppState = {
    activeTool: { type: 'selection', locked: false },
    preferredSelectionTool: { type: 'selection', initialized: true },
    editingTextElement: null,
    selectedLinearElement: null,
    newElement: null,
    multiElement: null,
    croppingElementId: null,
    selectedElementIds: {},
    selectedGroupIds: {},
    editingGroupId: null,
    ...overrides,
  };
  const api = {
    getAppState: () => state,
    setActiveTool: vi.fn((tool: { type: string }) => {
      state.activeTool = { ...state.activeTool, type: tool.type };
    }),
    updateScene: vi.fn(({ appState }: { appState: Record<string, unknown> }) => {
      Object.assign(state, appState);
    }),
  };
  return { state, api, excalidrawAPI: api as unknown as ExcalidrawImperativeAPI };
};

/** The whiteboard editor dialog, wired to the escape handler the way the whiteboard page wires it. */
const WhiteboardDialog = ({
  excalidrawAPI,
  onClose,
}: {
  excalidrawAPI: ExcalidrawImperativeAPI;
  onClose: () => void;
}) => {
  const [open, setOpen] = useState(true);
  return (
    <WhiteboardEditorShell
      open={open}
      title="Board"
      onClose={() => {
        onClose();
        setOpen(false);
      }}
      onEscapeKeyDown={event => handleExcalidrawEscape(excalidrawAPI, event)}
    >
      <div className="excalidraw excalidraw-container">canvas</div>
    </WhiteboardEditorShell>
  );
};

describe('handleAppBack', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('answers false when nothing is open, so the shell navigates history', () => {
    render(<div>page</div>);
    expect(back()).toBe(false);
  });

  it('closes an open dialog exactly once and answers true', () => {
    const onOpenChange = vi.fn();
    render(<TestDialog label="Callout" onOpenChange={onOpenChange} />);
    expect(screen.getByRole('dialog', { name: 'Callout' })).toBeInTheDocument();

    expect(back()).toBe(true);

    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange).toHaveBeenCalledWith(false);
    expect(screen.queryByRole('dialog', { name: 'Callout' })).not.toBeInTheDocument();
  });

  it('closes only the topmost of two stacked dialogs', () => {
    const outer = vi.fn();
    const inner = vi.fn();
    render(
      <TestDialog label="Outer" onOpenChange={outer}>
        <TestDialog label="Inner" onOpenChange={inner} />
      </TestDialog>
    );

    expect(back()).toBe(true);

    expect(inner).toHaveBeenCalledWith(false);
    expect(outer).not.toHaveBeenCalled();
    expect(screen.queryByRole('dialog', { name: 'Inner' })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: 'Outer' })).toBeInTheDocument();
  });

  it('answers true without closing a layer that refuses Escape', () => {
    render(
      <Dialog open={true}>
        <DialogContent aria-describedby={undefined} onEscapeKeyDown={e => e.preventDefault()}>
          <DialogTitle>Editor</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(back()).toBe(true);
    expect(screen.getByRole('dialog', { name: 'Editor' })).toBeInTheDocument();
  });

  it('answers false without dispatching anything while a pass-through gate is mounted', () => {
    const onOpenChange = vi.fn();
    const listener = vi.fn();
    document.addEventListener('keydown', listener, true);
    try {
      render(
        <>
          <div data-app-back="pass" />
          <TestDialog label="Gate" onOpenChange={onOpenChange} />
        </>
      );

      expect(back()).toBe(false);
      expect(listener).not.toHaveBeenCalled();
      expect(onOpenChange).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog', { name: 'Gate' })).toBeInTheDocument();
    } finally {
      document.removeEventListener('keydown', listener, true);
    }
  });

  it('is not made true by a focused element that swallows Escape (dispatch on body, not the focus)', () => {
    const onKeyDown = vi.fn((e: React.KeyboardEvent) => e.preventDefault());
    render(
      // biome-ignore lint/a11y/noStaticElementInteractions: a stand-in for a focused canvas that handles keys itself
      // biome-ignore lint/a11y/noNoninteractiveTabindex: the canvas stand-in must be focusable
      <div data-testid="canvas" tabIndex={0} onKeyDown={onKeyDown} />
    );
    screen.getByTestId('canvas').focus();
    expect(document.activeElement).toBe(screen.getByTestId('canvas'));

    expect(back()).toBe(false);
    expect(onKeyDown).not.toHaveBeenCalled();
  });

  it('never throws, answering false when the document cannot be used', () => {
    expect(() => handleAppBack({ body: null, querySelector: () => null } as unknown as Document)).not.toThrow();
    expect(handleAppBack({ body: null, querySelector: () => null } as unknown as Document)).toBe(false);
    expect(handleAppBack({ body: null } as unknown as Document)).toBe(false);
  });

  it('routes Back through a discard guard: first press asks, second press closes only the prompt', () => {
    const onClose = vi.fn();
    render(<GuardedDialog onClose={onClose} />);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();

    expect(back()).toBe(true);
    expect(screen.getByRole('alertdialog')).toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    // Behind the prompt the draft is aria-hidden (no accessible name), but still mounted.
    expect(screen.getByText('Draft')).toBeInTheDocument();

    expect(back()).toBe(true);
    expect(screen.queryByRole('alertdialog')).not.toBeInTheDocument();
    expect(onClose).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog', { name: 'Draft' })).toBeInTheDocument();
  });

  describe('inside a whiteboard editor', () => {
    it('first switches an armed tool back to selection, then closes the editor', () => {
      const onClose = vi.fn();
      const { state, api, excalidrawAPI } = stubExcalidrawAPI({ activeTool: { type: 'freedraw', locked: false } });
      render(<WhiteboardDialog excalidrawAPI={excalidrawAPI} onClose={onClose} />);

      expect(back()).toBe(true);
      expect(api.setActiveTool).toHaveBeenCalledWith({ type: 'selection' });
      expect(state.activeTool.type).toBe('selection');
      expect(onClose).not.toHaveBeenCalled();
      expect(screen.getByRole('dialog', { name: 'Board' })).toBeInTheDocument();

      expect(back()).toBe(true);
      expect(onClose).toHaveBeenCalledTimes(1);
      expect(screen.queryByRole('dialog', { name: 'Board' })).not.toBeInTheDocument();
    });

    it('returns to the preferred lasso tool without looping on it', () => {
      const onClose = vi.fn();
      const { state, excalidrawAPI } = stubExcalidrawAPI({
        activeTool: { type: 'rectangle', locked: true },
        preferredSelectionTool: { type: 'lasso', initialized: true },
      });
      render(<WhiteboardDialog excalidrawAPI={excalidrawAPI} onClose={onClose} />);

      expect(back()).toBe(true);
      expect(state.activeTool.type).toBe('lasso');
      expect(onClose).not.toHaveBeenCalled();

      expect(back()).toBe(true);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it.each([
      // The line tool stays armed under the finished line, so it takes one press more.
      [
        'a multi-point line being drawn',
        { multiElement: { id: 'line' }, activeTool: { type: 'line', locked: false } },
        3,
      ],
      ['an image being cropped', { croppingElementId: 'image' }, 2],
    ])('first ends %s, then closes the editor', (_label, overrides, pressesToClose) => {
      const onClose = vi.fn();
      const { state, excalidrawAPI } = stubExcalidrawAPI(overrides as Partial<StubAppState>);
      render(<WhiteboardDialog excalidrawAPI={excalidrawAPI} onClose={onClose} />);

      expect(back()).toBe(true);
      expect(state.multiElement).toBeNull();
      expect(state.croppingElementId).toBeNull();

      for (let press = 2; press <= pressesToClose; press += 1) {
        expect(onClose).not.toHaveBeenCalled();
        expect(back()).toBe(true);
      }
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it('leaves an operation to Excalidraw when the Escape is pressed on its canvas', () => {
      const { state, api, excalidrawAPI } = stubExcalidrawAPI({ multiElement: { id: 'line' } });
      render(<WhiteboardDialog excalidrawAPI={excalidrawAPI} onClose={vi.fn()} />);
      const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, cancelable: true });

      act(() => {
        screen.getByText('canvas').dispatchEvent(escapeEvent);
      });

      expect(escapeEvent.defaultPrevented).toBe(true);
      expect(api.updateScene).not.toHaveBeenCalled();
      expect(state.multiElement).toEqual({ id: 'line' });
    });
  });
});

describe('installAppBack', () => {
  it('exposes the versioned handleBack entry point on the window', () => {
    const win = { document } as unknown as Window;
    installAppBack(win);

    expect(win.alkemioApp?.version).toBe(APP_BACK_CONTRACT_VERSION);
    expect(win.alkemioApp?.version).toBe(1);
    expect(typeof win.alkemioApp?.handleBack).toBe('function');
    expect(win.alkemioApp?.handleBack()).toBe(false);
  });
});
