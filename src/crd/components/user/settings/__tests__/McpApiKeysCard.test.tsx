import { fireEvent, render, screen } from '@testing-library/react';
import { createInstance } from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import contributorSettingsEn from '@/crd/i18n/contributorSettings/contributorSettings.en.json';
import spaceEn from '@/crd/i18n/space/space.en.json';
import type { McpApiKeyRowData } from '../McpApiKeys.types';
import { McpApiKeysCard } from '../McpApiKeysCard';

const i18n = createInstance();

beforeAll(async () => {
  await i18n.init({
    lng: 'en',
    // ConfirmationDialog (used for revoke) reads its Cancel label from
    // 'crd-space' — provide it so the confirmation flow renders real copy.
    resources: { en: { 'crd-contributorSettings': contributorSettingsEn, 'crd-space': spaceEn } },
    interpolation: { escapeValue: false },
  });
});

const baseKey: McpApiKeyRowData = {
  id: 'key-1',
  name: 'Claude Desktop',
  operations: ['read'],
  createdDate: new Date('2026-01-01T00:00:00Z'),
  expiresAt: undefined,
  lastUsedAt: undefined,
  lastUsedFromIp: undefined,
  status: 'active',
};

const renderCard = (props: Partial<Parameters<typeof McpApiKeysCard>[0]> = {}) =>
  render(
    <I18nextProvider i18n={i18n}>
      <McpApiKeysCard
        loading={false}
        keys={[]}
        revokingId={undefined}
        interruptedRevealKeyId={undefined}
        onCreate={vi.fn()}
        onRevoke={vi.fn()}
        {...props}
      />
    </I18nextProvider>
  );

describe('McpApiKeysCard', () => {
  it('status precedence: a key that is both expired and revoked renders Revoked, with expiry as a secondary detail', () => {
    const key: McpApiKeyRowData = {
      ...baseKey,
      status: 'revoked',
      expiresAt: new Date('2020-01-01T00:00:00Z'),
    };
    renderCard({ keys: [key] });

    expect(screen.getByText('Revoked')).toBeInTheDocument();
    expect(screen.queryByText('Expired')).not.toBeInTheDocument();
    // Expiry date is still shown as a secondary detail.
    expect(screen.getByText(/Jan 1, 2020/)).toBeInTheDocument();
  });

  it('renders the explanatory empty state with a create action when there are no keys', () => {
    renderCard({ keys: [] });

    expect(screen.getByText('No API keys yet')).toBeInTheDocument();
    expect(screen.getByText('Create a key to connect an MCP client to your account.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Create API key' })).toBeInTheDocument();
  });

  it('calling onCreate from the empty state', () => {
    const onCreate = vi.fn();
    renderCard({ keys: [], onCreate });

    fireEvent.click(screen.getByRole('button', { name: 'Create API key' }));
    expect(onCreate).toHaveBeenCalledTimes(1);
  });

  it('no rendered output contains a key value or hash for any listed key', () => {
    const key: McpApiKeyRowData = { ...baseKey, id: 'key-2', name: 'Test Key' };
    renderCard({ keys: [key] });

    // Nothing resembling a minted key value (mcp_ prefix) or a hash appears anywhere.
    expect(screen.queryByText(/mcp_/)).not.toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/mcp_[a-zA-Z0-9]/);
  });

  it('no delete control exists — only revoke', () => {
    renderCard({ keys: [baseKey] });

    expect(screen.queryByRole('button', { name: /delete/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Revoke' })).toBeInTheDocument();
  });

  it('a revoked key has no revoke control (it is already terminal)', () => {
    renderCard({ keys: [{ ...baseKey, status: 'revoked' }] });

    expect(screen.queryByRole('button', { name: 'Revoke' })).not.toBeInTheDocument();
  });

  it('the revoke flow requires an explicit confirmation naming the key before calling the mutation', () => {
    const onRevoke = vi.fn();
    renderCard({ keys: [baseKey], onRevoke });

    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));

    // The mutation is not called yet — a confirmation dialog naming the key appears first.
    expect(onRevoke).not.toHaveBeenCalled();
    expect(
      screen.getByText(/Revoking "Claude Desktop" will immediately stop it from authenticating/)
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Revoke key' }));
    expect(onRevoke).toHaveBeenCalledWith(baseKey);
  });

  it('cancelling the revoke confirmation calls no mutation', () => {
    const onRevoke = vi.fn();
    renderCard({ keys: [baseKey], onRevoke });

    fireEvent.click(screen.getByRole('button', { name: 'Revoke' }));
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onRevoke).not.toHaveBeenCalled();
  });

  it('renders a loading skeleton while loading', () => {
    renderCard({ loading: true });

    expect(screen.queryByText('No API keys yet')).not.toBeInTheDocument();
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });
});
