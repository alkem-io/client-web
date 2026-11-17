import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { SettingsCrdRoute } from './SettingsCrdRoute';

const IDENTITY = 'https://identity.alkem.io';
const APEX = 'https://alkem.io';
const replaceSpy = vi.fn();
let mockFlow: unknown;

vi.mock('@/domain/platform/routes/usePlatformOrigin', () => ({ default: () => APEX }));
vi.mock('@/core/auth/authentication/hooks/useKratosFlow', () => ({
  default: () => ({ flow: mockFlow, loading: false, error: undefined, refetch: vi.fn() }),
  FlowTypeName: { Settings: 'Settings' },
}));
vi.mock('@/crd/components/auth/SettingsCard', () => ({
  SettingsCard: ({ isLoading }: { isLoading?: boolean }) => (
    <div data-testid="settings-card">{isLoading ? 'loading' : 'set-new-password'}</div>
  ),
}));
vi.mock('./AuthShellWrapper', () => ({
  AuthShellWrapper: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
vi.mock('./flowDescriptorAdapter', () => ({ flowDescriptorAdapter: () => ({}) }));
vi.mock('./useKratosMessageCopy', () => ({ useTranslateDescriptor: () => (descriptor: unknown) => descriptor }));
vi.mock('@/core/analytics/SentryTransactionScopeContext', () => ({ useTransactionScope: () => {} }));
vi.mock('@/core/routing/usePageTitle', () => ({ usePageTitle: () => {} }));
vi.mock('@/core/routing/useQueryParams', () => ({ useQueryParams: () => new URLSearchParams('flow=flow-1') }));
vi.mock('react-i18next', () => ({ useTranslation: () => ({ t: (key: string) => key }) }));

const renderRoute = () =>
  render(
    <MemoryRouter initialEntries={['/settings?flow=flow-1']}>
      <Routes>
        <Route path="/settings" element={<SettingsCrdRoute />} />
        <Route path="/second-factor" element={<div data-testid="second-factor-page" />} />
      </Routes>
    </MemoryRouter>
  );

describe('SettingsCrdRoute resume', () => {
  beforeEach(() => {
    replaceSpy.mockReset();
    vi.stubGlobal('location', { ...window.location, origin: IDENTITY, replace: replaceSpy });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('leaves for an absolute platform-origin target and never renders the set-new-password card', () => {
    mockFlow = { id: 'flow-1', return_to: `${APEX}/second-factor`, ui: { nodes: [], messages: [] } };

    renderRoute();

    expect(replaceSpy).toHaveBeenCalledWith(`${APEX}/second-factor?flow=flow-1`);
    expect(screen.getByTestId('settings-card')).toHaveTextContent('loading');
  });

  it('navigates in-app to a same-origin target', () => {
    mockFlow = { id: 'flow-1', return_to: `${IDENTITY}/second-factor`, ui: { nodes: [], messages: [] } };

    renderRoute();

    expect(screen.getByTestId('second-factor-page')).toBeInTheDocument();
    expect(replaceSpy).not.toHaveBeenCalled();
  });

  it('renders the set-new-password card for a recovery-issued flow', () => {
    mockFlow = { id: 'flow-1', ui: { nodes: [], messages: [] } };

    renderRoute();

    expect(screen.getByTestId('settings-card')).toHaveTextContent('set-new-password');
    expect(replaceSpy).not.toHaveBeenCalled();
  });
});
