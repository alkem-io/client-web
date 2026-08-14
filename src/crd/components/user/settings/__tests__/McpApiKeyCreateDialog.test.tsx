import { act, fireEvent, render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';
import { McpApiKeyCreateDialog } from '../McpApiKeyCreateDialog';

// Capture the Calendar's props so a test can drive `onSelect` directly. The
// real picker refuses past dates via `disabled={[{ before: new Date() }]}`, so
// this is the only way to reach the submit-time guard behind it.
const calendarProps: { onSelect?: (date: Date | undefined) => void } = {};
vi.mock('@/crd/primitives/calendar', () => ({
  Calendar: (props: { onSelect?: (date: Date | undefined) => void }) => {
    calendarProps.onSelect = props.onSelect;
    return null;
  },
}));

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-contributorSettings': contributorSettingsEn } },
    interpolation: { escapeValue: false },
  });
});

const renderDialog = (props: Partial<Parameters<typeof McpApiKeyCreateDialog>[0]> = {}) =>
  render(
    <I18nextProvider i18n={i18n}>
      <McpApiKeyCreateDialog open={true} onOpenChange={vi.fn()} submitting={false} onCreate={vi.fn()} {...props} />
    </I18nextProvider>
  );

describe('McpApiKeyCreateDialog', () => {
  it('submitting with zero operations is refused with an actionable message and calls no mutation', () => {
    const onCreate = vi.fn();
    renderDialog({ onCreate });

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Claude Desktop' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create key' }));

    expect(screen.getByText('Choose at least one operation.')).toBeInTheDocument();
    expect(onCreate).not.toHaveBeenCalled();
  });

  it('refuses a past expiry and does not call onCreate (defense-in-depth behind the picker)', () => {
    // The Calendar's `disabled={[{ before: new Date() }]}` keeps a past date
    // from being SELECTABLE, so this exercises the second line of defence:
    // handleSubmit's `expiresAt.getTime() <= Date.now()` guard. Reaching it
    // needs a past Date in the form's internal state, which the UI will not
    // produce — so drive the Calendar's onSelect directly, which is the same
    // entry point the picker uses.
    const onCreate = vi.fn();
    renderDialog({ onCreate });

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Claude Desktop' } });
    fireEvent.click(screen.getByText('Read'));

    // The Calendar lives inside PopoverContent, which does not mount until the
    // popover opens — so open it before reaching for onSelect.
    fireEvent.click(screen.getByRole('button', { name: /expiry \(optional\)/i }));
    expect(calendarProps.onSelect).toBeDefined();

    const past = new Date(Date.now() - 24 * 60 * 60 * 1000);
    act(() => {
      calendarProps.onSelect?.(past);
    });

    fireEvent.click(screen.getByRole('button', { name: 'Create key' }));

    expect(onCreate).not.toHaveBeenCalled();
    expect(screen.getByText(/must be in the future/i)).toBeInTheDocument();
  });

  it('submits with the trimmed name and selected operations when valid', () => {
    const onCreate = vi.fn();
    renderDialog({ onCreate });

    fireEvent.change(screen.getByLabelText('Name'), { target: { value: '  Claude Desktop  ' } });
    fireEvent.click(screen.getByText('Read'));
    fireEvent.click(screen.getByText('Tools'));
    fireEvent.click(screen.getByRole('button', { name: 'Create key' }));

    expect(onCreate).toHaveBeenCalledWith({
      name: 'Claude Desktop',
      operations: ['read', 'tools'],
      expiresAt: undefined,
    });
  });

  it('renders the server-provided error (e.g. cap reached) inline', () => {
    renderDialog({ serverError: "You've reached the limit of 10 active API keys." });

    expect(screen.getByText("You've reached the limit of 10 active API keys.")).toBeInTheDocument();
  });

  it('disables the submit button and shows a busy state while submitting', () => {
    renderDialog({ submitting: true });

    const submit = screen.getByRole('button', { name: 'Creating…' });
    expect(submit).toBeDisabled();
    expect(submit).toHaveAttribute('aria-busy', 'true');
  });
});
