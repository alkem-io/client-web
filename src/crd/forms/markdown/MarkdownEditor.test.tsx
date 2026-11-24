import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { Editor } from '@tiptap/react';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MarkdownEditor } from './MarkdownEditor';
import { htmlToMarkdown } from './markdownConverter';

vi.mock('./markdownConverter', async importOriginal => {
  const actual = await importOriginal<typeof import('./markdownConverter')>();
  return { ...actual, htmlToMarkdown: vi.fn(actual.htmlToMarkdown) };
});

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { current?: string; max?: string }) =>
      params && 'current' in params ? `${key}:${params.current}/${params.max}` : key,
  }),
}));

const COUNTER_KEY = 'editor.charCount';

type EditorExtras = { maxLength?: number; error?: string };

const renderEditor = (value: string, extra: EditorExtras = {}) =>
  render(<MarkdownEditor value={value} onChange={vi.fn()} {...extra} />);

const counterLabel = (current: number, max: number) =>
  `${COUNTER_KEY}:${current.toLocaleString()}/${max.toLocaleString()}`;

const findCounter = (current: number, max: number) => screen.findByRole('button', { name: counterLabel(current, max) });

const ringProgress = (counter: HTMLElement) => counter.querySelectorAll('circle')[1];

describe('MarkdownEditor — character counter', () => {
  // The validators applied to this value measure the markdown string, so the
  // counter must too — a link's URL counts even though only its text is visible.
  test('counts the markdown source, not the visible text', async () => {
    const value = '[docs](https://example.com/a/very/long/path)';
    renderEditor(value, { maxLength: 100 });
    expect(await findCounter(value.length, 100)).toBeInTheDocument();
  });

  test('is hidden below 20% of maxLength', async () => {
    renderEditor('a'.repeat(19), { maxLength: 100 });
    await screen.findByRole('toolbar');
    expect(screen.queryByRole('button', { name: new RegExp(COUNTER_KEY) })).not.toBeInTheDocument();
  });

  test('appears at 20% of maxLength as a ring in the primary style', async () => {
    renderEditor('a'.repeat(20), { maxLength: 100 });
    expect(ringProgress(await findCounter(20, 100))).toHaveClass('stroke-primary');
  });

  test('turns destructive once the ring is full', async () => {
    renderEditor('a'.repeat(100), { maxLength: 100 });
    expect(ringProgress(await findCounter(100, 100))).toHaveClass('stroke-destructive');
  });

  test('renders below the editor box, on the same row as the validation error', async () => {
    renderEditor('a'.repeat(101), { maxLength: 100, error: 'Too long' });
    const counter = await findCounter(101, 100);
    const error = screen.getByText('Too long');
    expect(counter.parentElement).toBe(error.parentElement);
    expect(counter.closest('.crd-markdown-editor')).toBeNull();
  });

  test('the tooltip shows the count grouped using the browser locale', async () => {
    renderEditor('a'.repeat(12345), { maxLength: 50000 });
    await userEvent.hover(await findCounter(12345, 50000));
    expect((await screen.findAllByText(counterLabel(12345, 50000))).length).toBeGreaterThan(0);
  });

  test('the tooltip omits the formatting hint below 80% of maxLength', async () => {
    renderEditor('a'.repeat(79), { maxLength: 100 });
    await userEvent.hover(await findCounter(79, 100));
    await screen.findAllByText(counterLabel(79, 100));
    expect(screen.queryByText('editor.charCountHint')).not.toBeInTheDocument();
  });

  test('the tooltip adds the formatting hint from 80% of maxLength', async () => {
    renderEditor('a'.repeat(80), { maxLength: 100 });
    await userEvent.hover(await findCounter(80, 100));
    expect((await screen.findAllByText('editor.charCountHint')).length).toBeGreaterThan(0);
  });
});

type EditorDom = HTMLElement & { editor: Editor };

function ControlledEditor({ initial, onChange }: { initial: string; onChange: (md: string) => void }) {
  const [value, setValue] = useState(initial);
  return (
    <MarkdownEditor
      value={value}
      onChange={md => {
        setValue(md);
        onChange(md);
      }}
    />
  );
}

const longDocument = Array.from({ length: 40 }, (_, i) => `Paragraph number ${i + 1} about topic ${i + 1}.`).join(
  '\n\n'
);

// The editor is recreated once the initial markdown is converted, so re-query
// the DOM until the mounted instance holds the whole document.
const findEditor = () =>
  waitFor(() => {
    const editor = (document.querySelector('.ProseMirror') as EditorDom | null)?.editor;
    expect(editor?.getText()).toContain('Paragraph number 40');
    return editor as Editor;
  });

const textAroundCursor = (editor: Editor) => editor.state.selection.$from.parent.textContent;

describe('MarkdownEditor — toolbar keeps the cursor in place', () => {
  // jsdom has no layout, so give the editor's scroll-into-view empty rects.
  const { getClientRects, getBoundingClientRect } = Range.prototype;
  beforeEach(() => {
    Range.prototype.getClientRects = () => [] as unknown as DOMRectList;
    Range.prototype.getBoundingClientRect = () => new DOMRect();
  });
  afterEach(() => {
    vi.restoreAllMocks();
    Range.prototype.getClientRects = getClientRects;
    Range.prototype.getBoundingClientRect = getBoundingClientRect;
  });

  test.each([
    ['editor.bulletList', 'bulletList'],
    ['editor.orderedList', 'orderedList'],
    ['editor.heading2', 'heading'],
    ['editor.blockquote', 'blockquote'],
  ])('%s on a line near the top leaves the cursor on that line', async (buttonLabel, mark) => {
    const onChange = vi.fn();
    render(<ControlledEditor initial={longDocument} onChange={onChange} />);
    const editor = await findEditor();

    act(() => {
      // Cursor inside the second paragraph, near the top of a long document.
      editor.chain().focus().setTextSelection(45).run();
    });
    await waitFor(() => expect(editor.isFocused).toBe(true));
    expect(textAroundCursor(editor)).toBe('Paragraph number 2 about topic 2.');
    const cursorOffset = editor.state.selection.$from.parentOffset;

    // Clicking a toolbar button blurs the editor; the command re-focuses it on
    // the next animation frame. In a browser the parent's echo of the new
    // markdown can land before that frame, so hold the re-focus back from here
    // on to reproduce that ordering.
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation(cb => window.setTimeout(() => cb(0), 300));

    await userEvent.click(screen.getByRole('button', { name: buttonLabel }));

    // The formatting change is still saved through onChange...
    await waitFor(() => expect(onChange).toHaveBeenCalled());
    expect(editor.isActive(mark)).toBe(true);
    // ...and the value echoed back by the parent must not reset the document.
    await new Promise(resolve => setTimeout(resolve, 400));
    expect(textAroundCursor(editor)).toBe('Paragraph number 2 about topic 2.');
    expect(editor.state.selection.$from.parentOffset).toBe(cursorOffset);
  });

  test('a value set from outside still loads when the editor is not focused', async () => {
    const { rerender } = render(<MarkdownEditor value="first" onChange={vi.fn()} />);
    await waitFor(() => expect(document.querySelector('.ProseMirror')?.textContent).toBe('first'));
    rerender(<MarkdownEditor value="second value" onChange={vi.fn()} />);
    await waitFor(() => expect(document.querySelector('.ProseMirror')?.textContent).toBe('second value'));
  });

  test('an edit still being converted does not overwrite a value set from outside', async () => {
    const onChange = vi.fn();
    function Host() {
      const [value, setValue] = useState('first');
      return (
        <>
          <MarkdownEditor
            value={value}
            onChange={md => {
              setValue(md);
              onChange(md);
            }}
          />
          <button type="button" onClick={() => setValue('second value')}>
            load
          </button>
        </>
      );
    }
    render(<Host />);
    const editor = await waitFor(() => {
      const mounted = (document.querySelector('.ProseMirror') as EditorDom | null)?.editor;
      expect(mounted?.getText()).toBe('first');
      return mounted as Editor;
    });

    // Hold the conversion of the next edit open, as the first one is while the
    // converter is still loading.
    const { htmlToMarkdown: convert } =
      await vi.importActual<typeof import('./markdownConverter')>('./markdownConverter');
    vi.mocked(htmlToMarkdown).mockImplementationOnce(async html => {
      await new Promise(resolve => setTimeout(resolve, 100));
      return convert(html);
    });

    act(() => {
      editor.commands.insertContentAt(1, 'edited ');
    });
    fireEvent.click(screen.getByRole('button', { name: 'load' }));
    await waitFor(() => expect(editor.getText()).toBe('second value'));

    await new Promise(resolve => setTimeout(resolve, 200));
    expect(onChange).not.toHaveBeenCalled();
    expect(editor.getText()).toBe('second value');
  });
});
