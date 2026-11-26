/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { act, fireEvent, render, waitFor } from '@/main/test/testUtils';
import { CommunityGuidelinesEditor, type CommunityGuidelinesEditorProps } from './CommunityGuidelinesEditor';

vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: () => null,
}));

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces(['crd-spaceSettings', 'crd-common']);
});

describe('CommunityGuidelinesEditor — a Discard during a multi-file pick', () => {
  const pdf = (name: string) => new File(['x'], name);
  const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;
  const uriValues = () =>
    Array.from(document.querySelectorAll('input[type="url"]')).map(i => (i as HTMLInputElement).value);

  it('a new referencesKey drops the uploads still running', async () => {
    const resolvers: Array<(url: string) => void> = [];
    const onReferenceFileUpload = vi.fn(
      (_file: File) => new Promise<string | null>(resolve => resolvers.push(resolve))
    );
    const onChange = vi.fn();
    const props = (referencesKey: number): CommunityGuidelinesEditorProps => ({
      value: { title: 'Guidelines', body: '', references: [{ name: '', uri: '', description: '' }] },
      loading: false,
      submitting: false,
      canSave: false,
      onChange,
      onSave: vi.fn(),
      onReferenceFileUpload,
      hideActions: true,
      referencesKey,
    });

    const { rerender } = render(<CommunityGuidelinesEditor {...props(0)} />);
    await waitFor(() => expect(fileInput()).not.toBeNull());
    fireEvent.change(fileInput(), { target: { files: [pdf('a.pdf'), pdf('b.pdf')] } });
    expect(onReferenceFileUpload).toHaveBeenCalledTimes(2);

    rerender(<CommunityGuidelinesEditor {...props(1)} />);
    await act(async () => {
      for (const resolve of resolvers) resolve('https://cdn/late');
    });

    expect(onChange).not.toHaveBeenCalled();
    expect(uriValues()).toEqual(['']);
  });
});
