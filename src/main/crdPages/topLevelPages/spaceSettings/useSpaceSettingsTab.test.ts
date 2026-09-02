import { describe, expect, it } from 'vitest';
import { buildSpaceSettingsTabPath, parseSpaceSettingsTab } from './useSpaceSettingsTab';

describe('parseSpaceSettingsTab', () => {
  it('returns "about" when the URL has no tab segment', () => {
    expect(parseSpaceSettingsTab('/space/green-energy/settings')).toBe('about');
  });

  it('returns "about" when the URL has an unknown tab segment', () => {
    expect(parseSpaceSettingsTab('/space/green-energy/settings/unknown-tab')).toBe('about');
  });

  it('returns the valid tab id when present', () => {
    expect(parseSpaceSettingsTab('/space/green-energy/settings/layout')).toBe('layout');
    expect(parseSpaceSettingsTab('/space/green-energy/settings/community')).toBe('community');
    expect(parseSpaceSettingsTab('/space/green-energy/settings/subspaces')).toBe('subspaces');
    expect(parseSpaceSettingsTab('/space/green-energy/settings/templates')).toBe('templates');
    expect(parseSpaceSettingsTab('/space/green-energy/settings/storage')).toBe('storage');
    expect(parseSpaceSettingsTab('/space/green-energy/settings/settings')).toBe('settings');
    expect(parseSpaceSettingsTab('/space/green-energy/settings/account')).toBe('account');
  });

  it('ignores trailing path segments after the tab id', () => {
    // The parser anchors on the first `settings` segment and reads the
    // segment immediately after it. Trailing sub-segments don't change the active tab.
    expect(parseSpaceSettingsTab('/space/green-energy/settings/layout/extra/bits')).toBe('layout');
  });

  it('normalizes to "about" when the path has no settings segment at all', () => {
    expect(parseSpaceSettingsTab('/space/green-energy/dashboard')).toBe('about');
  });

  it('supports the Settings tab anchored under the admin section: /settings/settings', () => {
    // The first `settings` segment is the admin anchor; the second is the active tab.
    expect(parseSpaceSettingsTab('/space/green-energy/settings/settings')).toBe('settings');
  });
});

describe('buildSpaceSettingsTabPath', () => {
  it('appends the tab id after the settings segment', () => {
    expect(buildSpaceSettingsTabPath('/space/green-energy/settings', 'layout')).toBe(
      '/space/green-energy/settings/layout'
    );
  });

  it('replaces any previous tab segment when building a new path', () => {
    expect(buildSpaceSettingsTabPath('/space/green-energy/settings/community', 'templates')).toBe(
      '/space/green-energy/settings/templates'
    );
  });

  it('returns the input path unchanged if there is no settings segment', () => {
    expect(buildSpaceSettingsTabPath('/space/green-energy/dashboard', 'layout')).toBe('/space/green-energy/dashboard');
  });

  it('round-trips: parse(build(path, tab)) === tab for every tab', () => {
    const tabs = ['about', 'layout', 'community', 'subspaces', 'templates', 'storage', 'settings', 'account'] as const;
    for (const tab of tabs) {
      const built = buildSpaceSettingsTabPath('/space/x/settings', tab);
      expect(parseSpaceSettingsTab(built)).toBe(tab);
    }
  });
});
