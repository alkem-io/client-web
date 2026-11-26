import { act, renderHook } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const changeLanguage = vi.fn();
vi.mock('react-i18next', () => ({
  useTranslation: () => ({ t: (key: string) => key, i18n: { language: 'en', changeLanguage } }),
}));
vi.mock('react-router-dom', () => ({
  useLocation: () => ({ pathname: '/spaces', search: '?view=all', hash: '#cards' }),
}));
vi.mock('@/core/i18n/config', () => ({ supportedLngs: ['en', 'nl', 'inContextTool'] }));
vi.mock('@/core/apollo/generated/apollo-hooks', () => ({
  useUpdateUserSettingsMutation: () => {
    throw new Error('Unserved mutation');
  },
}));
vi.mock('@/domain/community/userCurrent/useCurrentUserContext', () => ({
  useCurrentUserContext: () => {
    throw new Error('Unserved current user');
  },
}));
vi.mock('@/domain/platform/config/useConfig', () => ({
  useConfig: () => {
    return {
      language: { eligible: ['nl', 'en'], default: 'nl' },
      locations: { terms: 'https://platform.test/terms', privacy: 'https://platform.test/privacy' },
    };
  },
}));

import { useCrdNavigation } from './useCrdNavigation';

afterEach(() => vi.clearAllMocks());
describe('increment1 local navigation boundary', () => {
  it('uses the real same-origin BFF login with the issued return path and does not assert a viewer', () => {
    const { result } = renderHook(useCrdNavigation);
    expect(result.current.navigationHrefs.login).toBe('/api/auth/oidc/login?returnTo=%2Fspaces%3Fview%3Dall%23cards');
    expect(result.current.platformNavigationItems.map(item => item.href)).toEqual(['/spaces']);
    expect(result.current.footerLinks).toEqual({
      terms: 'https://platform.test/terms',
      privacy: 'https://platform.test/privacy',
      security: undefined,
      about: undefined,
    });
    expect('authenticated' in result.current).toBe(false);
  });
  it('changes only local display language while settings persistence is unavailable', () => {
    const { result } = renderHook(useCrdNavigation);
    act(() => result.current.handleLanguageChange('nl'));
    expect(changeLanguage).toHaveBeenCalledWith('nl');
    expect(result.current.languages.map(language => language.code)).toEqual(['nl', 'en']);
  });
});
