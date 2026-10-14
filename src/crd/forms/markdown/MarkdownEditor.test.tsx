import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test, vi } from 'vitest';
import { MarkdownEditor } from './MarkdownEditor';

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

  test('the tooltip omits the formatting hint below 90% of maxLength', async () => {
    renderEditor('a'.repeat(89), { maxLength: 100 });
    await userEvent.hover(await findCounter(89, 100));
    await screen.findAllByText(counterLabel(89, 100));
    expect(screen.queryByText('editor.charCountHint')).not.toBeInTheDocument();
  });

  test('the tooltip adds the formatting hint from 90% of maxLength', async () => {
    renderEditor('a'.repeat(90), { maxLength: 100 });
    await userEvent.hover(await findCounter(90, 100));
    expect((await screen.findAllByText('editor.charCountHint')).length).toBeGreaterThan(0);
  });
});
