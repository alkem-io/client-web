/** @vitest-environment jsdom */
import '@testing-library/jest-dom/vitest';
import userEvent from '@testing-library/user-event';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import i18n from '@/core/i18n/config';
import { render, screen } from '@/main/test/testUtils';
import type { ClassificationTemplateValues } from '../types';
import { ClassificationTemplateForm } from './ClassificationTemplateForm';

beforeAll(async () => {
  await i18n.changeLanguage('en');
  await i18n.loadNamespaces('crd-templates');
});

function baseValue(overrides: Partial<ClassificationTemplateValues> = {}): ClassificationTemplateValues {
  return {
    type: 'classification',
    name: 'SDGs',
    description: 'UN Sustainable Development Goals',
    tags: [],
    cardinality: 'MULTI_SELECT',
    values: [{ label: '13 · Climate Action' }, { label: '14 · Life Below Water' }],
    ...overrides,
  };
}

describe('ClassificationTemplateForm', () => {
  it('the value-id field is optional and blank by default (FR-002c)', () => {
    render(<ClassificationTemplateForm value={baseValue()} errors={{}} onChange={vi.fn()} />);
    const idInputs = screen.getAllByLabelText('Custom id (optional)') as HTMLInputElement[];
    expect(idInputs).toHaveLength(2);
    for (const input of idInputs) {
      expect(input.required).toBe(false);
      expect(input.value).toBe('');
    }
  });

  it('cardinality selection is required and reflects the current value', () => {
    render(
      <ClassificationTemplateForm value={baseValue({ cardinality: 'SINGLE_SELECT' })} errors={{}} onChange={vi.fn()} />
    );
    expect(screen.getByRole('radio', { name: 'Single-select (one value)' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Multi-select (one or more values)' })).not.toBeChecked();
  });

  it('changing cardinality emits the new value', async () => {
    const onChange = vi.fn();
    render(
      <ClassificationTemplateForm value={baseValue({ cardinality: 'MULTI_SELECT' })} errors={{}} onChange={onChange} />
    );
    await userEvent.click(screen.getByRole('radio', { name: 'Single-select (one value)' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ cardinality: 'SINGLE_SELECT' }));
  });

  it('the value list preserves authored order — no alphabetical re-sorting', () => {
    render(
      <ClassificationTemplateForm
        value={baseValue({ values: [{ label: 'Zebra' }, { label: 'Alpha' }] })}
        errors={{}}
        onChange={vi.fn()}
      />
    );
    const labelInputs = screen.getAllByPlaceholderText('Value label') as HTMLInputElement[];
    expect(labelInputs.map(i => i.value)).toEqual(['Zebra', 'Alpha']);
  });

  it('adding a value appends to the end, preserving order', async () => {
    const onChange = vi.fn();
    render(
      <ClassificationTemplateForm value={baseValue({ values: [{ label: 'Alpha' }] })} errors={{}} onChange={onChange} />
    );
    await userEvent.click(screen.getByRole('button', { name: 'Add value' }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ values: [{ label: 'Alpha' }, { label: '' }] }));
  });

  it('removing a value drops only that row', async () => {
    const onChange = vi.fn();
    render(
      <ClassificationTemplateForm
        value={baseValue({ values: [{ label: 'Alpha' }, { label: 'Beta' }] })}
        errors={{}}
        onChange={onChange}
      />
    );
    const removeButtons = screen.getAllByRole('button', { name: 'Remove value' });
    await userEvent.click(removeButtons[0]);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ values: [{ label: 'Beta' }] }));
  });
});
