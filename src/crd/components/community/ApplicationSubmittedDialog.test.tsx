import { render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import spaceEn from '@/crd/i18n/space/space.en.json';
import { ApplicationSubmittedDialog } from './ApplicationSubmittedDialog';

// A real i18next instance, not a mocked `t`. The review copy is rendered through
// <Trans> and carries a custom `<bell/>` tag; a stubbed `t` returning the key
// would silently hide a broken tag-to-component substitution.
const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-space': spaceEn } },
    interpolation: { escapeValue: false },
  });
});

const renderDialog = () =>
  render(
    <I18nextProvider i18n={i18n}>
      <ApplicationSubmittedDialog open={true} onOpenChange={vi.fn()} communityName="Welcome Sub" />
    </I18nextProvider>
  );

describe('ApplicationSubmittedDialog', () => {
  it('names the community the user applied to', () => {
    renderDialog();

    expect(screen.getByText('Your application to Welcome Sub has been submitted.')).toBeInTheDocument();
  });

  it('explains the review step and where to enter the community afterwards', () => {
    renderDialog();

    const review = screen.getByText(/Your application will be reviewed/);
    expect(review).toHaveTextContent(/you will get a notification/);
    expect(review).toHaveTextContent(/enter the community from your Home dashboard/);
  });

  it('renders the bell icon inline, matching the top-bar notifications button', () => {
    renderDialog();

    // <Trans> must swap the `<bell/>` tag for the lucide icon — if the tag were
    // dropped or left as literal text, this query fails.
    const review = screen.getByText(/Your application will be reviewed/);
    const bell = review.querySelector('svg.lucide-bell');

    expect(bell).not.toBeNull();
    expect(bell).toHaveAttribute('aria-hidden', 'true');
    expect(review.textContent).not.toContain('<bell');
  });
});
