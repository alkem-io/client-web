import { render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { MarkdownEditor } from './MarkdownEditor';

vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string, params?: { count?: number; max?: number }) =>
      params && 'count' in params ? `${key}:${params.count}/${params.max}` : key,
  }),
}));

const COUNTER_KEY = 'editor.charCount';

const renderEditor = (value: string, extra: { maxLength?: number; counterThreshold?: number } = {}) =>
  render(<MarkdownEditor value={value} onChange={vi.fn()} {...extra} />);

describe('MarkdownEditor — character counter', () => {
  // The validators applied to this value measure the markdown string, so the
  // counter must too — a link's URL counts even though only its text is visible.
  test('counts the markdown source, not the visible text', async () => {
    const value = '[docs](https://example.com/a/very/long/path)';
    renderEditor(value, { maxLength: 100 });
    expect(await screen.findByText(`${COUNTER_KEY}:${value.length}/100`)).toBeInTheDocument();
  });

  test('is hidden below the threshold', async () => {
    renderEditor('a'.repeat(89), { maxLength: 100, counterThreshold: 90 });
    await screen.findByRole('toolbar');
    expect(screen.queryByText(new RegExp(COUNTER_KEY))).not.toBeInTheDocument();
  });

  test('appears at the threshold in the muted style', async () => {
    renderEditor('a'.repeat(90), { maxLength: 100, counterThreshold: 90 });
    const counter = await screen.findByText(`${COUNTER_KEY}:90/100`);
    expect(counter).toHaveClass('text-muted-foreground');
    expect(counter).not.toHaveClass('text-destructive');
  });

  test('turns destructive once the limit is exceeded', async () => {
    renderEditor('a'.repeat(101), { maxLength: 100, counterThreshold: 90 });
    expect(await screen.findByText(`${COUNTER_KEY}:101/100`)).toHaveClass('text-destructive');
  });

  test('without a threshold the counter is always shown when maxLength is set', async () => {
    renderEditor('', { maxLength: 100 });
    expect(await screen.findByText(`${COUNTER_KEY}:0/100`)).toBeInTheDocument();
  });
});
