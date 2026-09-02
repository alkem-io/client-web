import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { LinkDetails } from '@/domain/collaboration/calloutContributions/link/models/LinkDetails';
import { mapLinkToCallToActionProps } from './callToActionDataMapper';

describe('mapLinkToCallToActionProps', () => {
  beforeEach(() => {
    vi.spyOn(window, 'location', 'get').mockReturnValue({
      ...window.location,
      origin: 'https://app.alkem.io',
    } as Location);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns undefined when the link is undefined', () => {
    expect(mapLinkToCallToActionProps(undefined)).toBeUndefined();
  });

  it('returns undefined when the URI is empty', () => {
    const link: LinkDetails = { uri: '', profile: { displayName: 'Empty' } };
    expect(mapLinkToCallToActionProps(link)).toBeUndefined();
  });

  it('returns undefined when the URI is whitespace only', () => {
    const link: LinkDetails = { uri: '   ', profile: { displayName: 'Blank' } };
    expect(mapLinkToCallToActionProps(link)).toBeUndefined();
  });

  it('marks malformed URIs invalid without throwing', () => {
    const link: LinkDetails = { uri: 'not a url', profile: { displayName: 'Broken' } };
    const result = mapLinkToCallToActionProps(link);
    expect(result).toEqual({ url: 'not a url', displayName: 'Broken', isExternal: false, isValid: false });
  });

  it('marks non-http protocols invalid', () => {
    const link: LinkDetails = { uri: 'ftp://example.com/file', profile: { displayName: 'FTP' } };
    const result = mapLinkToCallToActionProps(link);
    expect(result).toEqual({ url: 'ftp://example.com/file', displayName: 'FTP', isExternal: false, isValid: false });
  });

  it('classifies a different-origin https URL as external and valid', () => {
    const link: LinkDetails = { uri: 'https://example.com/path', profile: { displayName: 'Example' } };
    expect(mapLinkToCallToActionProps(link)).toEqual({
      url: 'https://example.com/path',
      displayName: 'Example',
      isExternal: true,
      isValid: true,
    });
  });

  it('classifies a same-origin URL as internal and valid', () => {
    const link: LinkDetails = { uri: 'https://app.alkem.io/spaces/my-space', profile: { displayName: 'My Space' } };
    expect(mapLinkToCallToActionProps(link)).toEqual({
      url: 'https://app.alkem.io/spaces/my-space',
      displayName: 'My Space',
      isExternal: false,
      isValid: true,
    });
  });

  it('falls back to the URI as the display name when the profile displayName is missing', () => {
    const link: LinkDetails = { uri: 'https://example.com', profile: { displayName: '' } };
    expect(mapLinkToCallToActionProps(link)).toEqual({
      url: 'https://example.com',
      displayName: 'https://example.com',
      isExternal: true,
      isValid: true,
    });
  });

  it('trims URI and displayName whitespace', () => {
    const link: LinkDetails = { uri: '  https://example.com  ', profile: { displayName: '  Example  ' } };
    expect(mapLinkToCallToActionProps(link)).toEqual({
      url: 'https://example.com',
      displayName: 'Example',
      isExternal: true,
      isValid: true,
    });
  });
});
