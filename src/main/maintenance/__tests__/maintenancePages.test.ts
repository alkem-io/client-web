import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { JSDOM } from 'jsdom';
import { afterEach, describe, expect, it } from 'vitest';

/**
 * `public/maintenance/*.html` are shipped verbatim and served by nginx without the
 * app, so they are read from disk and run in their own JSDOM.
 */
const STATUS_URL = 'https://alkemio.statuspage.io';
const LANG_KEY = 'alkemio-maintenance-lang';

const SHARED = {
  en: { status: 'View status page', help: 'Questions? We’re happy to help:' },
  nl: { status: 'Bekijk statuspagina', help: 'Vragen? We helpen je graag:' },
};

// Keys are the element ids the page writes its copy into.
const COPY = {
  planned: {
    en: {
      title: 'Alkemio is offline for planned maintenance',
      p1: 'This work keeps Alkemio running smoothly, and we’ll bring everything back online as soon as it’s done. Our apologies for the inconvenience, and thank you for your patience.',
      p2: 'You can follow the progress on our status page.',
      ...SHARED.en,
    },
    nl: {
      title: 'Alkemio is offline voor gepland onderhoud',
      p1: 'Met dit onderhoud zorgen we dat Alkemio soepel blijft werken. Zodra we klaar zijn, zetten we alles weer online. Onze excuses voor het ongemak, en bedankt voor je geduld.',
      p2: 'Op onze statuspagina kun je de voortgang volgen.',
      ...SHARED.nl,
    },
  },
  unexpected: {
    en: {
      title: 'Sorry, Alkemio is offline right now',
      p1: 'We’ve run into an unexpected problem, and we’re working hard to restore the service as soon as possible. Our apologies for the inconvenience.',
      p2: 'You can follow the latest on our status page.',
      ...SHARED.en,
    },
    nl: {
      title: 'Sorry, Alkemio is op dit moment offline',
      p1: 'We hebben te maken met een onverwacht probleem en werken hard om alles zo snel mogelijk weer beschikbaar te maken. Onze excuses voor het ongemak.',
      p2: 'Op onze statuspagina lees je het laatste nieuws.',
      ...SHARED.nl,
    },
  },
};

type Page = keyof typeof COPY;
const PAGES = Object.keys(COPY) as Page[];

const read = (page: Page) => readFileSync(resolve(process.cwd(), 'public/maintenance', `${page}.html`), 'utf8');

const doms: JSDOM[] = [];
afterEach(() => {
  for (const dom of doms.splice(0)) dom.window.close();
});

const render = (
  page: Page,
  {
    language = 'en-GB',
    stored,
    storageThrows = false,
  }: { language?: string; stored?: string; storageThrows?: boolean } = {}
) => {
  const dom = new JSDOM(read(page), {
    url: 'https://alkem.io/',
    runScripts: 'dangerously',
    beforeParse(window) {
      Object.defineProperty(window.navigator, 'language', { value: language });
      if (storageThrows) {
        Object.defineProperty(window, 'localStorage', {
          get() {
            throw new Error('storage blocked');
          },
        });
      } else if (stored) {
        window.localStorage.setItem(LANG_KEY, stored);
      }
    },
  });
  doms.push(dom);
  return dom.window;
};

const shownCopy = (document: Document) =>
  Object.fromEntries(Object.keys(COPY.planned.en).map(id => [id, document.getElementById(id)?.textContent]));

describe.each(PAGES)('maintenance page %s', page => {
  const html = read(page);
  const other = PAGES.find(p => p !== page) as Page;
  const markup = new JSDOM(html).window.document;

  it('carries every EN and NL string of its own copy and neither title of the other page', () => {
    for (const text of [...Object.values(COPY[page].en), ...Object.values(COPY[page].nl)]) {
      expect(html).toContain(text);
    }
    expect(html).not.toContain(COPY[other].en.title);
    expect(html).not.toContain(COPY[other].nl.title);
  });

  it('makes no request beyond the document', () => {
    const links = html.match(/<link\b[^>]*>/gi) ?? [];
    expect(links).toHaveLength(1);
    expect(links[0]).toMatch(/rel="icon"/);
    expect(links[0]).toMatch(/href="data:/);

    const parsed = new DOMParser().parseFromString(html, 'text/html');
    // By local name, so an SVG `xlink:href` counts and an element with both attributes has both read.
    const urls = [...parsed.querySelectorAll('*')].flatMap(element =>
      [...element.attributes]
        .filter(attribute => attribute.localName === 'href' || attribute.localName === 'src')
        .map(attribute => attribute.value)
    );
    for (const script of parsed.querySelectorAll('script')) {
      expect(script.textContent).not.toMatch(/\b(?:href|src)\s*=|https?:|\/\//);
    }
    expect(urls.length).toBeGreaterThan(0);
    for (const url of urls) {
      expect(url.startsWith('data:') || url === STATUS_URL || url === 'mailto:support@alkem.io').toBe(true);
    }
    expect(urls).toContain(STATUS_URL);
    expect(html).not.toMatch(/@import/i);
    expect(html).not.toMatch(/url\([^)]*\/\//i);
  });

  it('opens the status page in a new tab without an opener', () => {
    const anchor = markup.querySelector(`a[href="${STATUS_URL}"]`);
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toMatch(/\bnoopener\b/);
  });

  it('reloads itself every 60 s and carries the maintenance marker', () => {
    expect(html).toContain('<meta http-equiv="refresh" content="60">');
    expect(markup.documentElement.hasAttribute('data-alkemio-maintenance')).toBe(true);
  });

  it('shows Dutch when the browser prefers Dutch', () => {
    const { document } = render(page, { language: 'nl-NL' });
    expect(shownCopy(document)).toEqual(COPY[page].nl);
    expect(document.documentElement.lang).toBe('nl');
  });

  it('shows English otherwise', () => {
    const { document } = render(page, { language: 'en-GB' });
    expect(shownCopy(document)).toEqual(COPY[page].en);
    expect(document.documentElement.lang).toBe('en');
  });

  it('lets a stored choice win over the browser language', () => {
    const { document } = render(page, { language: 'nl-NL', stored: 'en' });
    expect(document.getElementById('title')?.textContent).toBe(COPY[page].en.title);
  });

  it('switches language from the footer and stores the choice', () => {
    const window = render(page, { language: 'en-GB' });
    window.document.querySelector<HTMLButtonElement>('footer button')?.click();
    expect(window.document.getElementById('title')?.textContent).toBe(COPY[page].nl.title);
    expect(window.localStorage.getItem(LANG_KEY)).toBe('nl');
  });

  it('still renders when browser storage throws', () => {
    const { document } = render(page, { language: 'nl-NL', storageThrows: true });
    expect(document.getElementById('title')?.textContent).toBe(COPY[page].nl.title);
    document.querySelector<HTMLButtonElement>('footer button')?.click();
    expect(document.getElementById('title')?.textContent).toBe(COPY[page].en.title);
  });

  it('names the current year and Alkemio B.V. in the footer', () => {
    const { document } = render(page);
    const footer = document.querySelector('footer')?.textContent ?? '';
    expect(footer).toContain(String(new Date().getFullYear()));
    expect(footer).toContain('Alkemio B.V.');
  });
});

it('links both pages to the same status page', () => {
  const statusUrls = PAGES.map(page =>
    new JSDOM(read(page)).window.document.querySelector('a[target="_blank"]')?.getAttribute('href')
  );
  expect(statusUrls).toEqual([STATUS_URL, STATUS_URL]);
});
