import { readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { Page } from '@playwright/test';
import { expect, test } from '../fixtures/authFixture';

/**
 * @foundry-acceptance
 * 101-profile-hover-cards — US5: the Keywords helper text in the user, organisation and VC
 * settings Profile tabs says the keywords are the tags shown on the hover card, in all six
 * languages (FR-009).
 *
 * Walks it the way a manual tester does: open the settings Profile tab, switch the display
 * language through the footer language menu, expand the collapsed sections, read the hint.
 * Expected strings are read from the shipped CRD translation files, so the walk proves the
 * rendered page shows each language's value. It does not restate a hard-coded copy.
 *
 * Switching the language persists it on the signed-in account, so every test restores English.
 *
 * Required env: ALKEMIO_BASE_URL (default http://localhost:3000), AUTH_TEST_HARNESS_EMAIL
 * (default admin@alkem.io), AUTH_TEST_HARNESS_PASSWORD.
 * Optional: E2E_ORG_NAMEID (default `eco1host`, the bootstrap organisation; the account must
 * be able to edit it), E2E_VC_NAMEID (a virtual contributor the account can edit; US5-AS3 is
 * skipped when unset, because the bootstrap data has none and creating one needs an
 * account-VC entitlement).
 */
const BASE = process.env.ALKEMIO_BASE_URL || 'http://localhost:3000';
const ORG_NAMEID = process.env.E2E_ORG_NAMEID || 'eco1host';
const VC_NAMEID = process.env.E2E_VC_NAMEID;

const here = path.dirname(fileURLToPath(import.meta.url));
const I18N_DIR = path.resolve(here, '../../src/crd/i18n/contributorSettings');

/** Footer language-menu order (the menu labels themselves are localised, so select by position). */
const LANGUAGES = [
  { code: 'en', native: 'English' },
  { code: 'nl', native: 'Nederlands' },
  { code: 'es', native: 'Español' },
  { code: 'bg', native: 'Български' },
  { code: 'de', native: 'Deutsch' },
  { code: 'fr', native: 'Français' },
] as const;

type KeywordsCopy = { label: string; hint: string };
type ContributorSettings = {
  user: { profile: { aboutYou: { keywords: KeywordsCopy } } };
  org: { profile: { about: { keywords: KeywordsCopy } } };
  vc: { profile: { keywords: KeywordsCopy } };
};

const translations = (code: string): ContributorSettings =>
  JSON.parse(readFileSync(path.join(I18N_DIR, `contributorSettings.${code}.json`), 'utf8'));

const languageButton = (page: Page) =>
  page.locator('footer').getByRole('button', { name: new RegExp(`^(${LANGUAGES.map(l => l.native).join('|')})$`) });

const switchLanguage = async (page: Page, code: string) => {
  const index = LANGUAGES.findIndex(l => l.code === code);
  const target = LANGUAGES[index];
  const button = languageButton(page);
  await button.waitFor();
  if ((await button.textContent())?.trim() === target.native) return;
  await button.scrollIntoViewIfNeeded();
  await button.click();
  // The menu opens upward from the footer and can sit partly outside the viewport, so the item
  // is chosen with the keyboard (focus + Enter), which is also how a keyboard user picks it.
  await page.getByRole('menu').getByRole('menuitem').nth(index).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('footer').getByRole('button', { name: target.native, exact: true })).toBeVisible();
  await expect(page.locator('html')).toHaveAttribute('lang', code);
};

/** Expand the collapsed settings sections (not toolbar popovers inside the editors). */
const expandSections = async (page: Page) => {
  const collapsed = page.locator('main button[aria-expanded=false]:not([role=toolbar] *)');
  for (let i = 0; i < 10 && (await collapsed.count()) > 0; i++) {
    await collapsed.first().click();
  }
  await page.keyboard.press('Escape');
};

const expectKeywordsHint = async (page: Page, url: string, code: string, copy: KeywordsCopy) => {
  await page.goto(`${BASE}${url}`);
  await switchLanguage(page, code);
  await page.locator('main').getByRole('textbox').first().waitFor();
  await expandSections(page);
  await expect(page.getByText(copy.label, { exact: true }).first()).toBeVisible();
  await expect(page.getByText(copy.hint, { exact: true }).first()).toBeVisible();
};

test.describe.configure({ mode: 'serial' });

test.describe('101 US5 — Keywords hint mentions the hover card', () => {
  test.afterEach(async ({ authedPage: page }) => {
    await switchLanguage(page, 'en').catch(() => undefined);
  });

  for (const { code } of LANGUAGES) {
    test(`US5-AS1 user settings Profile tab [${code}]`, async ({ authedPage: page }) => {
      const res = await page.context().request.post(`${BASE}/api/private/graphql`, {
        data: { query: 'query { me { user { nameID } } }' },
      });
      const nameID: string = (await res.json()).data.me.user.nameID;
      await expectKeywordsHint(
        page,
        `/user/${nameID}/settings/profile`,
        code,
        translations(code).user.profile.aboutYou.keywords
      );
    });

    test(`US5-AS2 organisation settings Profile tab [${code}]`, async ({ authedPage: page }) => {
      await expectKeywordsHint(
        page,
        `/organization/${ORG_NAMEID}/settings/profile`,
        code,
        translations(code).org.profile.about.keywords
      );
    });

    test(`US5-AS3 VC settings Profile tab [${code}]`, async ({ authedPage: page }) => {
      test.skip(!VC_NAMEID, 'E2E_VC_NAMEID not set: no editable virtual contributor in this environment');
      await expectKeywordsHint(page, `/vc/${VC_NAMEID}/settings/profile`, code, translations(code).vc.profile.keywords);
    });
  }
});
