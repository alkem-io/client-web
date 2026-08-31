import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import commonEnJson from '@/crd/i18n/common/common.en.json';
import spaceEnJson from '@/crd/i18n/space/space.en.json';
import { SearchMatchSummary } from './SearchMatchSummary';

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['crd-space', 'crd-common'],
    defaultNS: 'crd-space',
    resources: { en: { 'crd-space': spaceEnJson, 'crd-common': commonEnJson } },
    interpolation: { escapeValue: false },
  });
});

const renderSummary = (ui: ReactElement) => render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

describe('SearchMatchSummary', () => {
  it('renders the text-only sentence with the count and text bolded', () => {
    renderSummary(<SearchMatchSummary matchCount="12" text="climate" tags={[]} onClear={vi.fn()} />);

    expect(screen.getByText('12', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('"climate"', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText(/items match search for/)).toBeInTheDocument();
  });

  it('renders the tags-only sentence with the tags joined in selection order', () => {
    renderSummary(<SearchMatchSummary matchCount="5" text="" tags={['Policy', 'Solar']} onClear={vi.fn()} />);

    expect(screen.getByText('"Policy" + "Solar"', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText(/items match tagged/)).toBeInTheDocument();
  });

  it('renders the combined sentence when both text and tags are active', () => {
    renderSummary(<SearchMatchSummary matchCount="3" text="climate" tags={['Policy', 'Solar']} onClear={vi.fn()} />);

    expect(screen.getByText(/items match tagged/)).toBeInTheDocument();
    expect(screen.getByText(/and search for/)).toBeInTheDocument();
    expect(screen.getByText('"Policy" + "Solar"', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('"climate"', { selector: 'strong' })).toBeInTheDocument();
  });

  it('renders the "N+" placeholder verbatim', () => {
    renderSummary(<SearchMatchSummary matchCount="10+" text="report" tags={[]} onClear={vi.fn()} />);
    expect(screen.getByText('10+', { selector: 'strong' })).toBeInTheDocument();
  });

  it('the clear button has the shared "Clear filters" accessible name and fires onClear', () => {
    const onClear = vi.fn();
    renderSummary(<SearchMatchSummary matchCount="1" text="x" tags={[]} onClear={onClear} />);

    const button = screen.getByRole('button', { name: 'Clear filters' });
    button.click();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  it('renders an unsafe tag name as literal text without creating any element or executing script', () => {
    renderSummary(
      <SearchMatchSummary matchCount="1" text="" tags={['<img src=x onerror=alert(1)>']} onClear={vi.fn()} />
    );

    // The tag name reaches the screen verbatim — never interpreted as markup.
    expect(screen.getByText('"<img src=x onerror=alert(1)>"', { selector: 'strong' })).toBeInTheDocument();

    // Never an actual element — no attribute (in particular no onerror handler) ever
    // reaches the live DOM, so nothing can execute.
    expect(document.querySelector('img')).toBeNull();
    expect(document.querySelector('[onerror]')).toBeNull();
  });

  it('renders a tag name containing ampersand, quote and angle-bracket characters as literal text', () => {
    renderSummary(<SearchMatchSummary matchCount="2" text="" tags={['R&D "beta" > v2']} onClear={vi.fn()} />);

    expect(screen.getByText('"R&D "beta" > v2"', { selector: 'strong' })).toBeInTheDocument();
  });

  it('renders a search term containing markup-like text as literal text', () => {
    renderSummary(<SearchMatchSummary matchCount="4" text="<b>bold</b>" tags={[]} onClear={vi.fn()} />);

    expect(screen.getByText('"<b>bold</b>"', { selector: 'strong' })).toBeInTheDocument();
    expect(document.querySelector('b')).toBeNull();
  });
});
