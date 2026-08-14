import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';
import { McpApiKeyRevealPanel } from '../McpApiKeyRevealPanel';
import type { McpApiKeyRevealData } from '../McpApiKeys.types';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    resources: { en: { 'crd-contributorSettings': contributorSettingsEn } },
    interpolation: { escapeValue: false },
  });
});

const sampleData: McpApiKeyRevealData = {
  apiKey: 'mcp_abcdef123456',
  key: {
    id: 'key-1',
    name: 'Claude Desktop',
    operations: ['read'],
    createdDate: new Date('2026-08-01T00:00:00Z'),
    expiresAt: undefined,
    lastUsedAt: undefined,
    lastUsedFromIp: undefined,
    status: 'active',
  },
};

const renderPanel = (props: Partial<Parameters<typeof McpApiKeyRevealPanel>[0]> = {}) =>
  render(
    <I18nextProvider i18n={i18n}>
      <McpApiKeyRevealPanel open={true} data={sampleData} baseAddress="https://alkem.io" onClose={vi.fn()} {...props} />
    </I18nextProvider>
  );

describe('McpApiKeyRevealPanel', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    // @ts-expect-error test-only cleanup of a jsdom-absent API
    delete navigator.clipboard;
  });

  it('renders the value once', () => {
    renderPanel();
    expect(screen.getByDisplayValue('mcp_abcdef123456')).toBeInTheDocument();
  });

  it('renders nothing when data is undefined (closed after clearing) — the value never re-appears', () => {
    const { rerender } = renderPanel();
    expect(screen.getByDisplayValue('mcp_abcdef123456')).toBeInTheDocument();

    rerender(
      <I18nextProvider i18n={i18n}>
        <McpApiKeyRevealPanel open={false} data={undefined} baseAddress="https://alkem.io" onClose={vi.fn()} />
      </I18nextProvider>
    );

    expect(screen.queryByDisplayValue('mcp_abcdef123456')).not.toBeInTheDocument();
    expect(screen.queryByText('mcp_abcdef123456', { exact: false })).not.toBeInTheDocument();
  });

  it('a re-render after the container clears data never shows the value again, even if reopened with stale state', () => {
    // Simulates the container: on close it clears `revealData` to undefined
    // (FR-026) — a subsequent render with open=true but data=undefined must
    // not resurrect the value from anywhere.
    const { rerender } = renderPanel();

    rerender(
      <I18nextProvider i18n={i18n}>
        <McpApiKeyRevealPanel open={true} data={undefined} baseAddress="https://alkem.io" onClose={vi.fn()} />
      </I18nextProvider>
    );

    expect(screen.queryByDisplayValue('mcp_abcdef123456')).not.toBeInTheDocument();
  });

  it('renders the connection recipe with the /rest/mcp endpoint and the Bearer header with the key substituted, using the runtime base address (not a literal)', () => {
    renderPanel({ baseAddress: 'https://acc-alkem.io' });

    expect(screen.getByText('https://acc-alkem.io/rest/mcp')).toBeInTheDocument();
    expect(screen.getByText('Authorization: Bearer mcp_abcdef123456')).toBeInTheDocument();
  });

  it('focuses into the panel on open (Radix dialog default focus behaviour)', async () => {
    renderPanel();
    await waitFor(() => {
      expect(document.activeElement).not.toBe(document.body);
    });
  });

  it('the warning is in an assertive live region', () => {
    renderPanel();
    const warning = screen.getByText(/You will not be able to see it again/i);
    expect(warning.closest('[aria-live="assertive"]')).not.toBeNull();
  });

  it('the value sits in a focusable read-only field', () => {
    renderPanel();
    const field = screen.getByDisplayValue('mcp_abcdef123456');
    expect(field).toHaveAttribute('readonly');
    expect(field.tagName).toBe('INPUT');
  });

  it('announces the copy result via a live region when copy succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });

    renderPanel();
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => {
      expect(screen.getByText('API key copied to clipboard.')).toBeInTheDocument();
    });
    expect(writeText).toHaveBeenCalledWith('mcp_abcdef123456');
  });

  it('calls onCopied when the copy succeeds', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText },
      configurable: true,
    });
    const onCopied = vi.fn();

    renderPanel({ onCopied });
    fireEvent.click(screen.getByRole('button', { name: 'Copy' }));

    await waitFor(() => expect(onCopied).toHaveBeenCalledTimes(1));
  });

  it('shows a manual-copy fallback hint when the Clipboard API is unavailable', () => {
    // @ts-expect-error simulating an environment without navigator.clipboard
    delete navigator.clipboard;
    renderPanel();

    expect(screen.getByText(/select the field above and copy manually/i)).toBeInTheDocument();
    const copyButton = screen.getByRole('button', { name: 'Copy' });
    expect(copyButton).toBeDisabled();
    // The value remains selectable in the read-only field regardless.
    expect(screen.getByDisplayValue('mcp_abcdef123456')).toBeInTheDocument();
  });
});
