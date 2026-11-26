import { describe, expect, it } from 'vitest';
import { Audience } from '@/core/apollo/generated-v2/graphql-schema';
import { mapPrivacy, mapPrivacyToAudience } from './settingsMapper';

describe('privacy ↔ audience', () => {
  it('maps PUBLIC and RESTRICTED to the two legacy options', () => {
    expect(mapPrivacy(Audience.Public)).toBe('public');
    expect(mapPrivacy(Audience.Restricted)).toBe('private');
    expect(mapPrivacyToAudience('public')).toBe(Audience.Public);
    expect(mapPrivacyToAudience('private')).toBe(Audience.Restricted);
  });

  it('maps the signed-in-users option to REGISTERED both ways (signed FC-S4)', () => {
    expect(mapPrivacy(Audience.Registered)).toBe('registered');
    expect(mapPrivacyToAudience('registered')).toBe(Audience.Registered);
  });
});
