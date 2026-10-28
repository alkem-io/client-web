import { fireEvent, render, screen } from '@testing-library/react';
import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { CityAutocompleteInput, type CityOption } from './CityAutocompleteInput';

const OPTIONS: CityOption[] = [
  { id: 'NL.amsterdam', name: 'Amsterdam', countryCode: 'NL', countryName: 'Netherlands' },
  { id: 'CH.zurich', name: 'Zürich', countryCode: 'CH', countryName: 'Switzerland' },
  { id: 'BR.sao_paulo', name: 'São Paulo', countryCode: 'BR', countryName: 'Brazil' },
  { id: 'NL.rotterdam', name: 'Rotterdam', countryCode: 'NL', countryName: 'Netherlands' },
  { id: 'NL.the_hague', name: 'The Hague', countryCode: 'NL', countryName: 'Netherlands' },
];

const Harness = ({
  onSelect,
  options = OPTIONS,
}: {
  onSelect?: (o: CityOption) => void;
  options?: CityOption[] | null;
}) => {
  const [value, setValue] = useState('');
  return (
    <CityAutocompleteInput
      value={value}
      onChange={setValue}
      onSelect={option => {
        setValue(option.name);
        onSelect?.(option);
      }}
      options={options ?? undefined}
      aria-label="City"
    />
  );
};

const type = (text: string) => {
  const input = screen.getByRole('combobox', { name: 'City' });
  fireEvent.focus(input);
  fireEvent.change(input, { target: { value: text } });
  return input as HTMLInputElement;
};

describe('CityAutocompleteInput', () => {
  it('suggests accent-insensitive matches, prefix matches first', () => {
    render(<Harness />);
    type('r');
    // "Rotterdam" starts with "r" so it ranks above the alphabetically earlier "Amsterdam", which only contains it.
    expect(screen.getAllByRole('option').map(o => o.textContent)).toEqual([
      'RotterdamNetherlands',
      'AmsterdamNetherlands',
      'ZürichSwitzerland',
    ]);

    type('zur');
    expect(screen.getByRole('option', { name: /Zürich/ })).toBeTruthy();

    type('sao');
    expect(screen.getByRole('option', { name: /São Paulo/ })).toBeTruthy();
  });

  it('selecting a suggestion reports the option and fills the input', () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    const input = type('ams');
    fireEvent.click(screen.getByRole('option', { name: /Amsterdam/ }));
    expect(onSelect).toHaveBeenCalledWith(OPTIONS[0]);
    expect(input.value).toBe('Amsterdam');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('supports keyboard selection and only consumes Enter while an option is active', () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    const input = type('t');

    const enterWithoutActive = fireEvent.keyDown(input, { key: 'Enter' });
    expect(enterWithoutActive).toBe(true); // not prevented — the form keeps its Enter
    expect(onSelect).not.toHaveBeenCalled();

    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(input.getAttribute('aria-activedescendant')).toBeTruthy();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSelect).toHaveBeenCalledTimes(1);
  });

  it('keeps free text and shows no list when nothing matches', () => {
    const onSelect = vi.fn();
    render(<Harness onSelect={onSelect} />);
    const input = type('Smallville');
    expect(input.value).toBe('Smallville');
    expect(screen.queryByRole('listbox')).toBeNull();
    expect(onSelect).not.toHaveBeenCalled();
  });

  it('works as a plain input while options are not loaded', () => {
    render(<Harness options={null} />);
    const input = type('ams');
    expect(input.value).toBe('ams');
    expect(screen.queryByRole('listbox')).toBeNull();
  });

  it('closes on Escape', () => {
    render(<Harness />);
    const input = type('ams');
    expect(screen.getByRole('listbox')).toBeTruthy();
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByRole('listbox')).toBeNull();
  });
});
