import { act, render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, test } from 'vitest';
import layoutDe from '@/crd/i18n/layout/layout.de.json';
import layoutEn from '@/crd/i18n/layout/layout.en.json';
import { MobileBreadcrumbs } from './MobileBreadcrumbs';

// Companion to MobileBreadcrumbs.test.tsx (which stubs react-i18next entirely,
// per house convention). This file uses a real i18next instance against the
// actual layout.*.json bundles to prove the trigger's accessible name and the
// panel copy genuinely resolve per locale — not a hardcoded English literal.
const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: {
      en: { 'crd-layout': layoutEn },
      de: { 'crd-layout': layoutDe },
    },
    interpolation: { escapeValue: false },
  });
});

function renderMobileBreadcrumbs() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MobileBreadcrumbs items={[{ label: 'Green Energy', href: '/spaces/green-energy' }]} homeHref="/home" />
    </I18nextProvider>
  );
}

describe('MobileBreadcrumbs real i18n resolution', () => {
  test('resolves the English copy by default', () => {
    renderMobileBreadcrumbs();
    expect(screen.getByRole('button', { name: layoutEn.breadcrumbs.openLocationHierarchy })).toBeInTheDocument();
  });

  test('re-resolves to the German copy after i18n.changeLanguage("de") — proving no hardcoded literal', async () => {
    renderMobileBreadcrumbs();
    await act(async () => {
      await i18n.changeLanguage('de');
    });
    expect(screen.getByRole('button', { name: layoutDe.breadcrumbs.openLocationHierarchy })).toBeInTheDocument();
    expect(layoutDe.breadcrumbs.openLocationHierarchy).not.toBe(layoutEn.breadcrumbs.openLocationHierarchy);
    await act(async () => {
      await i18n.changeLanguage('en');
    });
  });
});
