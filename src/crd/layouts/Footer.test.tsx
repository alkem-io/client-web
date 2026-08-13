import { render, screen, within } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';
import { Footer } from './Footer';

// Stub i18n so `t(key)` returns the key, letting us assert against the stable
// `footer.*` keys instead of the resolved copy.
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key }),
}));

const baseProps = {
  languages: [
    { code: 'en', label: 'English' },
    { code: 'nl', label: 'Nederlands' },
  ],
  currentLanguage: 'en',
  onLanguageChange: vi.fn(),
  links: {
    terms: '/terms',
    privacy: '/privacy',
    security: '/security',
    about: '/about',
  },
};

describe('Footer (#10057 — platform attribution logo)', () => {
  test('renders the Alkemio logo immediately before the copyright line', () => {
    render(<Footer {...baseProps} />);

    const copyright = screen.getByText('footer.copyright');
    // The logo and the copyright text share the same flex container.
    const copyrightGroup = copyright.parentElement as HTMLElement;
    const logo = within(copyrightGroup).getByRole('img', { name: 'Alkemio' });

    // The logo precedes the copyright text in DOM order (GitHub-style prefix),
    // so it reads as platform attribution.
    expect(logo.compareDocumentPosition(copyright) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  test('the copyright logo is exposed to assistive technology (not aria-hidden)', () => {
    render(<Footer {...baseProps} />);

    const copyright = screen.getByText('footer.copyright');
    const copyrightGroup = copyright.parentElement as HTMLElement;
    const logo = within(copyrightGroup).getByRole('img', { name: 'Alkemio' });

    // The logo announces "Alkemio" right before the copyright — it must NOT be
    // hidden from screen readers, otherwise the attribution goal is lost.
    expect(logo.closest('[aria-hidden="true"]')).toBeNull();
  });

  test('does not regress existing footer links', () => {
    render(<Footer {...baseProps} />);

    expect(screen.getByRole('link', { name: 'footer.terms' })).toHaveAttribute('href', '/terms');
    expect(screen.getByRole('link', { name: 'footer.privacy' })).toHaveAttribute('href', '/privacy');
    expect(screen.getByRole('link', { name: 'footer.security' })).toHaveAttribute('href', '/security');
    expect(screen.getByRole('link', { name: 'footer.about' })).toHaveAttribute('href', '/about');
  });
});
