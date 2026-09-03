import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import type { ReactElement } from 'react';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { SearchMatchSummary } from '@/crd/components/space/sidebar/SearchMatchSummary';
import commonEnJson from '@/crd/i18n/common/common.en.json';
import spaceEnJson from '@/crd/i18n/space/space.en.json';

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['crd-space', 'crd-common'],
    defaultNS: 'crd-space',
    resources: { en: { 'crd-space': spaceEnJson, 'crd-common': commonEnJson } },
    // Mirrors the app's i18n config (src/core/i18n/config.ts).
    interpolation: { escapeValue: false },
  });
});

const renderSummary = (ui: ReactElement) => render(<I18nextProvider i18n={i18n}>{ui}</I18nextProvider>);

/** The summary sentence as read by a screen reader: the live region's flattened text. */
const summaryText = () => screen.getByRole('status').textContent;

describe('SearchMatchSummary', () => {
  it('renders the text-only sentence with the count and text bolded', () => {
    renderSummary(<SearchMatchSummary count={12} hasMore={false} text="climate" tags={[]} onClear={vi.fn()} />);

    expect(screen.getByText('12', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('"climate"', { selector: 'strong' })).toBeInTheDocument();
    expect(summaryText()).toBe('12 items related to "climate"');
  });

  it('renders the tags-only sentence with the tags joined in selection order', () => {
    renderSummary(
      <SearchMatchSummary count={5} hasMore={false} text="" tags={['Policy', 'Solar']} onClear={vi.fn()} />
    );

    expect(screen.getByText('"Policy" + "Solar"', { selector: 'strong' })).toBeInTheDocument();
    expect(summaryText()).toBe('5 items related to tags "Policy" + "Solar"');
  });

  it('renders the combined sentence when both text and tags are active', () => {
    renderSummary(
      <SearchMatchSummary count={3} hasMore={false} text="climate" tags={['Policy', 'Solar']} onClear={vi.fn()} />
    );

    expect(screen.getByText('"Policy" + "Solar"', { selector: 'strong' })).toBeInTheDocument();
    expect(screen.getByText('"climate"', { selector: 'strong' })).toBeInTheDocument();
    expect(summaryText()).toBe('3 items related to "climate" and tags "Policy" + "Solar"');
  });

  // Plurals engage on the numeric count: one result is "1 item", and the
  // singular/plural "tag" follows the number of selected tags.
  it('pluralizes on the numeric count and on the number of tags', () => {
    const { unmount } = renderSummary(
      <SearchMatchSummary count={1} hasMore={false} text="climate" tags={[]} onClear={vi.fn()} />
    );
    expect(summaryText()).toBe('1 item related to "climate"');
    unmount();

    renderSummary(<SearchMatchSummary count={1} hasMore={false} text="" tags={['Policy']} onClear={vi.fn()} />);
    expect(summaryText()).toBe('1 item related to tag "Policy"');
  });

  // While more pages remain the count reads "N+" — the "+" comes from the
  // translation, never from the page pre-formatting a string.
  it('renders "N+ items" while more pages remain', () => {
    renderSummary(<SearchMatchSummary count={10} hasMore={true} text="report" tags={[]} onClear={vi.fn()} />);

    expect(screen.getByText('10+', { selector: 'strong' })).toBeInTheDocument();
    expect(summaryText()).toBe('10+ items related to "report"');
  });

  it('renders a zero count with the plural noun', () => {
    renderSummary(<SearchMatchSummary count={0} hasMore={false} text="zzqx" tags={[]} onClear={vi.fn()} />);
    expect(summaryText()).toBe('0 items related to "zzqx"');
  });

  it('the clear button has the shared "Clear filters" accessible name and fires onClear', () => {
    const onClear = vi.fn();
    renderSummary(<SearchMatchSummary count={1} hasMore={false} text="x" tags={[]} onClear={onClear} />);

    const button = screen.getByRole('button', { name: 'Clear filters' });
    button.click();
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  // The count changes as pages load and filters change: announce it politely,
  // as a single atomic sentence, without the clear button (a11y pattern shared
  // with AdminSearchableTable / SearchOverlay).
  it('exposes the sentence as a polite, atomic live region that excludes the clear button', () => {
    renderSummary(<SearchMatchSummary count={2} hasMore={false} text="x" tags={[]} onClear={vi.fn()} />);

    const status = screen.getByRole('status');
    expect(status).toHaveAttribute('aria-live', 'polite');
    expect(status).toHaveAttribute('aria-atomic', 'true');
    expect(status).not.toContainElement(screen.getByRole('button', { name: 'Clear filters' }));
  });

  it('renders an unsafe tag name as literal text without creating any element or executing script', () => {
    renderSummary(
      <SearchMatchSummary count={1} hasMore={false} text="" tags={['<img src=x onerror=alert(1)>']} onClear={vi.fn()} />
    );

    // The tag name reaches the screen verbatim — never interpreted as markup.
    expect(screen.getByText('"<img src=x onerror=alert(1)>"', { selector: 'strong' })).toBeInTheDocument();

    // Never an actual element — no attribute (in particular no onerror handler) ever
    // reaches the live DOM, so nothing can execute.
    expect(document.querySelector('img')).toBeNull();
    expect(document.querySelector('[onerror]')).toBeNull();
  });

  it('renders a tag name containing ampersand, quote and angle-bracket characters as literal text', () => {
    renderSummary(
      <SearchMatchSummary count={2} hasMore={false} text="" tags={['R&D "beta" > v2']} onClear={vi.fn()} />
    );

    expect(screen.getByText('"R&D "beta" > v2"', { selector: 'strong' })).toBeInTheDocument();
  });

  it('renders a search term containing markup-like text as literal text', () => {
    renderSummary(<SearchMatchSummary count={4} hasMore={false} text="<b>bold</b>" tags={[]} onClear={vi.fn()} />);

    expect(screen.getByText('"<b>bold</b>"', { selector: 'strong' })).toBeInTheDocument();
    expect(document.querySelector('b')).toBeNull();
  });

  // <Trans> re-interpolates its text nodes after t() has run, so a typed term
  // that looks like an interpolation variable must still render literally —
  // never be substituted with the count or another value.
  it('renders a search term or tag that looks like an interpolation variable literally', () => {
    const { unmount } = renderSummary(
      <SearchMatchSummary count={7} hasMore={false} text="{{count}}" tags={[]} onClear={vi.fn()} />
    );
    expect(screen.getByText('"{{count}}"', { selector: 'strong' })).toBeInTheDocument();
    expect(summaryText()).toBe('7 items related to "{{count}}"');
    unmount();

    renderSummary(
      <SearchMatchSummary count={7} hasMore={false} text="{{matches}}" tags={['{{tagLabel}}']} onClear={vi.fn()} />
    );
    expect(summaryText()).toBe('7 items related to "{{matches}}" and tag "{{tagLabel}}"');
  });
});
