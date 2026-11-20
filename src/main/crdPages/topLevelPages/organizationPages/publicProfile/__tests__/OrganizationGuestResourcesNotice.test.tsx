import { render, screen } from '@testing-library/react';
import i18next from 'i18next';
import { I18nextProvider, initReactI18next } from 'react-i18next';
import { beforeAll, describe, expect, test } from 'vitest';
import profilePagesEnJson from '@/crd/i18n/profilePages/profilePages.en.json';
import { buildOrganizationGuestNotice, OrganizationGuestResourcesNotice } from '../CrdOrganizationProfilePage';

const i18n = i18next.createInstance();

beforeAll(async () => {
  await i18n.use(initReactI18next).init({
    lng: 'en',
    fallbackLng: 'en',
    ns: ['crd-profilePages'],
    defaultNS: 'crd-profilePages',
    resources: { en: { 'crd-profilePages': profilePagesEnJson } },
    // Mirrors the app-wide setting, which is what makes unescaped names unsafe.
    interpolation: { escapeValue: false },
  });
});

const renderNotice = (organizationName: string) =>
  render(
    <I18nextProvider i18n={i18n}>
      <OrganizationGuestResourcesNotice organizationName={organizationName} signUpHref="/sign_up?returnUrl=%2Forg" />
    </I18nextProvider>
  );

describe('OrganizationGuestResourcesNotice', () => {
  test('a normal name renders with the Sign up link', () => {
    const { container } = renderNotice('Acme Foundation');

    const link = screen.getByRole('link', { name: 'Sign up' });
    expect(link).toHaveAttribute('href', '/sign_up?returnUrl=%2Forg');
    expect(container.textContent).toBe('Sign up on Alkemio to see the resources hosted by Acme Foundation');
  });

  test('markup in the name renders as literal text, never as a Trans component', () => {
    const { container } = renderNotice('Evil <signUp>free prize</signUp> & Co');

    expect(container.textContent).toBe(
      'Sign up on Alkemio to see the resources hosted by Evil <signUp>free prize</signUp> & Co'
    );
    expect(container.textContent).not.toContain('&amp;');
    const links = screen.getAllByRole('link');
    expect(links).toHaveLength(1);
    expect(links[0]).toHaveTextContent(/^Sign up$/);
  });

  test('an already entity-like name is not unescaped beyond what was typed', () => {
    const { container } = renderNotice('Smith &amp; Sons');

    expect(container.textContent).toBe('Sign up on Alkemio to see the resources hosted by Smith &amp; Sons');
  });
});

describe('buildOrganizationGuestNotice', () => {
  const organization = { profile: { displayName: 'Acme Foundation', url: '/organization/acme' } };
  const renderSlot = (notice: ReturnType<typeof buildOrganizationGuestNotice>) =>
    render(<I18nextProvider i18n={i18n}>{notice}</I18nextProvider>);

  test('no notice while the organization is still loading', () => {
    expect(buildOrganizationGuestNotice({ organization: undefined, isAuthenticated: false, loadingMe: false })).toBe(
      undefined
    );
  });

  test('no notice while auth is resolving, nor for a signed-in viewer', () => {
    expect(buildOrganizationGuestNotice({ organization, isAuthenticated: false, loadingMe: true })).toBe(undefined);
    expect(buildOrganizationGuestNotice({ organization, isAuthenticated: true, loadingMe: false })).toBe(undefined);
  });

  test('once the organization is known a guest sees its name and a sign-up link back to it', () => {
    const { container } = renderSlot(
      buildOrganizationGuestNotice({ organization, isAuthenticated: false, loadingMe: false })
    );

    expect(container.textContent).toBe('Sign up on Alkemio to see the resources hosted by Acme Foundation');
    const href = screen.getByRole('link', { name: 'Sign up' }).getAttribute('href') ?? '';
    expect(href).toContain('returnUrl=');
    expect(decodeURIComponent(href)).toContain('/organization/acme');
  });
});
