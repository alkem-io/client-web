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
  // Radix Select needs these DOM APIs, which jsdom does not implement.
  window.HTMLElement.prototype.scrollIntoView = vi.fn();
  window.HTMLElement.prototype.hasPointerCapture = vi.fn().mockReturnValue(false);
  window.HTMLElement.prototype.releasePointerCapture = vi.fn();
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

  it('the selection-type dropdown reflects the current cardinality (design 04)', () => {
    render(
      <ClassificationTemplateForm value={baseValue({ cardinality: 'SINGLE_SELECT' })} errors={{}} onChange={vi.fn()} />
    );
    expect(screen.getByRole('combobox', { name: 'Selection type' })).toHaveTextContent(
      'Single-select — users pick one value'
    );
  });

  it('changing the selection type emits the new cardinality', async () => {
    const onChange = vi.fn();
    render(
      <ClassificationTemplateForm value={baseValue({ cardinality: 'MULTI_SELECT' })} errors={{}} onChange={onChange} />
    );
    await userEvent.click(screen.getByRole('combobox', { name: 'Selection type' }));
    await userEvent.click(screen.getByRole('option', { name: 'Single-select — users pick one value' }));
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

  it('quick-add: typing a value and pressing Enter appends it to the end (design 04)', async () => {
    const onChange = vi.fn();
    render(
      <ClassificationTemplateForm value={baseValue({ values: [{ label: 'Alpha' }] })} errors={{}} onChange={onChange} />
    );
    const quickAdd = screen.getByPlaceholderText('e.g. SDG 1 – No Poverty');
    await userEvent.type(quickAdd, 'Beta{Enter}');
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ values: [{ label: 'Alpha' }, { label: 'Beta' }] }));
  });

  it('quick-add via the + button, and a blank draft is not addable', async () => {
    const onChange = vi.fn();
    render(
      <ClassificationTemplateForm value={baseValue({ values: [{ label: 'Alpha' }] })} errors={{}} onChange={onChange} />
    );
    const addButton = screen.getByRole('button', { name: 'Add value' });
    expect(addButton).toBeDisabled();
    await userEvent.type(screen.getByPlaceholderText('e.g. SDG 1 – No Poverty'), 'Gamma');
    await userEvent.click(addButton);
    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({ values: [{ label: 'Alpha' }, { label: 'Gamma' }] })
    );
  });

  it('shows the defined-values counter', () => {
    render(
      <ClassificationTemplateForm
        value={baseValue({ values: [{ label: 'Alpha' }, { label: '  ' }] })}
        errors={{}}
        onChange={vi.fn()}
      />
    );
    expect(screen.getByText('1 value defined')).toBeInTheDocument();
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
