import { fireEvent, render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import dashboardEn from '@/crd/i18n/dashboard/dashboard.en.json';
import { UnreadSummaryRow } from './UnreadSummaryRow';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-dashboard': dashboardEn } },
    interpolation: { escapeValue: false },
  });
});

const renderRow = (props: Parameters<typeof UnreadSummaryRow>[0]) =>
  render(
    <I18nextProvider i18n={i18n}>
      <UnreadSummaryRow {...props} />
    </I18nextProvider>
  );

describe('UnreadSummaryRow', () => {
  it('renders nothing when the count is 0', () => {
    const { container } = renderRow({ kind: 'messages', count: 0, onOpen: vi.fn() });

    expect(container).toBeEmptyDOMElement();
  });

  it('shows the heading and a plural count phrase in bold', () => {
    renderRow({ kind: 'messages', count: 2, onOpen: vi.fn() });

    expect(screen.getByRole('heading', { level: 2, name: 'Messages' })).toBeInTheDocument();
    expect(screen.getByText('2 unread messages').tagName).toBe('STRONG');
  });

  it('uses the singular form for a count of 1', () => {
    renderRow({ kind: 'notifications', count: 1, onOpen: vi.fn() });

    expect(screen.getByText('1 new notification').tagName).toBe('STRONG');
    expect(screen.getByRole('button', { name: 'You have 1 new notification. Open Notifications' })).toBeInTheDocument();
  });

  it('is one button named after the count and the destination, which calls onOpen', () => {
    const onOpen = vi.fn();
    renderRow({ kind: 'notifications', count: 3, onOpen });

    const button = screen.getByRole('button', { name: 'You have 3 new notifications. Open Notifications' });
    expect(screen.getAllByRole('button')).toHaveLength(1);

    fireEvent.click(button);
    expect(onOpen).toHaveBeenCalledTimes(1);
  });

  it('is hidden at md and up', () => {
    renderRow({ kind: 'messages', count: 2, onOpen: vi.fn() });

    expect(screen.getByRole('heading', { name: 'Messages' }).closest('section')).toHaveClass('md:hidden');
  });
});
