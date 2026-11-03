/** @vitest-environment jsdom */
import { act, fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { InnovationPackForm } from './InnovationPackForm';
import type { InnovationPackFormProps, InnovationPackFormValues } from './types';

vi.mock('react-i18next', () => {
  const t = (key: string) => key;
  return { useTranslation: () => ({ t }) };
});

vi.mock('@/crd/forms/markdown/MarkdownEditor', () => ({
  MarkdownEditor: () => null,
}));

const initialValue: InnovationPackFormValues = {
  name: 'Pack',
  description: '',
  tags: [],
  references: [{ name: '', uri: '', description: '' }],
  listedInStore: false,
  searchVisibility: 'public',
};

const baseProps = (overrides: Partial<InnovationPackFormProps> = {}): InnovationPackFormProps => ({
  value: initialValue,
  errors: {},
  onChange: vi.fn(),
  onSubmit: vi.fn(),
  submitting: false,
  isDirty: true,
  providerName: 'Provider',
  onAvatarFileSelected: vi.fn(),
  onReferenceFileUpload: vi.fn(),
  ...overrides,
});

const createControlledUpload = () => {
  const resolvers: Array<(url: string) => void> = [];
  const upload = vi.fn((_file: File) => new Promise<string | null>(resolve => resolvers.push(resolve)));
  return { upload, resolvers };
};

/** Keeps the whole value in state and replaces it from `onChange`, as `useInnovationPackAdmin` does. */
function Host({ onReferenceFileUpload }: { onReferenceFileUpload: (file: File) => Promise<string | null> }) {
  const [value, setValue] = useState(initialValue);
  return <InnovationPackForm {...baseProps({ value, onChange: setValue, onReferenceFileUpload })} />;
}

const pdf = (name: string) => new File(['x'], name);
const paperclips = () => screen.getAllByRole('button', { name: 'references.attachFile' });
const pickReferenceFiles = (files: File[]) =>
  fireEvent.change(paperclips()[0].previousElementSibling as HTMLInputElement, { target: { files } });
const nameInput = () => screen.getByLabelText('packForm.name');
const uriValues = () => (screen.getAllByLabelText('references.uriLabel') as HTMLInputElement[]).map(i => i.value);

describe('InnovationPackForm while reference files upload', () => {
  it('with uploading, Save is disabled and a form submit calls no onSubmit', () => {
    const onSubmit = vi.fn();
    render(<InnovationPackForm {...baseProps({ uploading: true, onSubmit })} />);

    const save = screen.getByRole('button', { name: 'packForm.save' });
    expect(save).toBeDisabled();
    fireEvent.submit(save.closest('form') as HTMLFormElement);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('without uploading, a form submit calls onSubmit', () => {
    const onSubmit = vi.fn();
    render(<InnovationPackForm {...baseProps({ onSubmit })} />);

    const save = screen.getByRole('button', { name: 'packForm.save' });
    expect(save).toBeEnabled();
    fireEvent.submit(save.closest('form') as HTMLFormElement);
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('with submitting, the references paperclips are disabled', () => {
    render(
      <InnovationPackForm
        {...baseProps({
          submitting: true,
          value: { ...initialValue, references: [initialValue.references[0], { name: '', uri: '' }] },
        })}
      />
    );

    expect(paperclips()).toHaveLength(2);
    for (const clip of paperclips()) expect(clip).toBeDisabled();
  });

  it('a one-file result keeps the pack name typed while it uploaded', async () => {
    const user = userEvent.setup();
    const { upload, resolvers } = createControlledUpload();
    render(<Host onReferenceFileUpload={upload} />);

    pickReferenceFiles([pdf('alpha.pdf')]);
    await user.clear(nameInput());
    await user.type(nameInput(), 'Renamed');
    await act(async () => resolvers[0]('https://cdn/alpha'));

    expect(nameInput()).toHaveValue('Renamed');
    expect(uriValues()).toEqual(['https://cdn/alpha']);
  });

  it('each result of a three-file pick keeps the pack name typed before it', async () => {
    const user = userEvent.setup();
    const { upload, resolvers } = createControlledUpload();
    render(<Host onReferenceFileUpload={upload} />);

    pickReferenceFiles([pdf('a.pdf'), pdf('b.pdf'), pdf('c.pdf')]);
    for (const [index, letter] of ['a', 'b', 'c'].entries()) {
      await user.type(nameInput(), letter);
      await act(async () => resolvers[index](`https://cdn/${letter}`));
      expect(nameInput()).toHaveValue(`Pack${'abc'.slice(0, index + 1)}`);
    }

    expect(uriValues()).toEqual(['https://cdn/a', 'https://cdn/b', 'https://cdn/c']);
  });
});
