/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import type { CommunityGuidelinesTemplateValues } from '../types';
import { CommunityGuidelinesTemplateForm } from './CommunityGuidelinesTemplateForm';

vi.mock('react-i18next', () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }) };
});

vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: () => null,
}));

const initialValue: CommunityGuidelinesTemplateValues = {
  type: 'communityGuidelines',
  name: 'Template',
  description: 'Description',
  tags: [],
  title: 'Guidelines',
  guidelinesMarkdown: '',
  references: [{ name: '', uri: '', description: '' }],
};

const createControlledUpload = () => {
  const resolvers: Array<(url: string) => void> = [];
  const upload = vi.fn((_file: File) => new Promise<string | null>(resolve => resolvers.push(resolve)));
  return { upload, resolvers };
};

/** Keeps the whole value in state and replaces it from `onChange`, as `useTemplateForms` does. */
function Host({ onReferenceFileUpload }: { onReferenceFileUpload: (file: File) => Promise<string | null> }) {
  const [value, setValue] = useState(initialValue);
  return (
    <CommunityGuidelinesTemplateForm
      value={value}
      errors={{}}
      onChange={setValue}
      onReferenceFileUpload={onReferenceFileUpload}
    />
  );
}

const pdf = (name: string) => new File(['x'], name);
const fileInput = () => document.querySelector('input[type="file"]') as HTMLInputElement;
const titleInput = () => screen.getByLabelText('form.communityGuidelines.title');
const uriValues = () => (screen.getAllByLabelText('references.uriLabel') as HTMLInputElement[]).map(i => i.value);

describe('CommunityGuidelinesTemplateForm', () => {
  it('with disabled, the references paperclips are disabled', () => {
    const { upload } = createControlledUpload();
    render(
      <CommunityGuidelinesTemplateForm
        value={{ ...initialValue, references: [initialValue.references[0], { name: '', uri: '' }] }}
        errors={{}}
        onChange={vi.fn()}
        onReferenceFileUpload={upload}
        disabled={true}
      />
    );

    const paperclips = screen.getAllByRole('button', { name: 'references.attachFile' });
    expect(paperclips).toHaveLength(2);
    for (const clip of paperclips) expect(clip).toBeDisabled();
  });

  it('a one-file result keeps the title typed while it uploaded', async () => {
    const user = userEvent.setup();
    const { upload, resolvers } = createControlledUpload();
    render(<Host onReferenceFileUpload={upload} />);

    fireEvent.change(fileInput(), { target: { files: [pdf('alpha.pdf')] } });
    await user.clear(titleInput());
    await user.type(titleInput(), 'Renamed');
    await act(async () => resolvers[0]('https://cdn/alpha'));

    expect(titleInput()).toHaveValue('Renamed');
    expect(uriValues()).toEqual(['https://cdn/alpha']);
  });

  it('each result of a three-file pick keeps the title typed before it', async () => {
    const user = userEvent.setup();
    const { upload, resolvers } = createControlledUpload();
    render(<Host onReferenceFileUpload={upload} />);

    fireEvent.change(fileInput(), { target: { files: [pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')] } });
    for (const [index, letter] of ['a', 'b', 'c'].entries()) {
      await user.type(titleInput(), letter);
      await act(async () => resolvers[index](`https://cdn/${letter}`));
      expect(titleInput()).toHaveValue(`Guidelines${'abc'.slice(0, index + 1)}`);
    }

    expect(uriValues()).toEqual(['https://cdn/a', 'https://cdn/b', 'https://cdn/c']);
  });
});
