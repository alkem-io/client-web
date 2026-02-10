import { describe, expect, test } from 'vitest';
import type { DataURL } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { isFileRenderable, isUsableDataUrl, isUsableUrl, shouldStripDataUrlForBroadcast } from '../fileStore/fileAvailability';

describe('fileAvailability', () => {
  test('isUsableUrl returns false for empty/whitespace', () => {
    expect(isUsableUrl(undefined)).toBe(false);
    expect(isUsableUrl('')).toBe(false);
    expect(isUsableUrl('   ')).toBe(false);
    expect(isUsableUrl('https://example.com/file.png')).toBe(true);
  });

  test('isUsableDataUrl returns false for empty/whitespace', () => {
    expect(isUsableDataUrl(undefined)).toBe(false);
    expect(isUsableDataUrl('')).toBe(false);
    expect(isUsableDataUrl('   ')).toBe(false);
    expect(isUsableDataUrl('data:image/png;base64,AAAA')).toBe(true);
  });

  test('isFileRenderable is true when url or dataURL is present', () => {
    expect(isFileRenderable({ url: 'https://example.com/a.png', dataURL: '' as DataURL })).toBe(true);
    expect(isFileRenderable({ url: undefined, dataURL: 'data:image/png;base64,AAAA' as DataURL })).toBe(true);
    expect(isFileRenderable({ url: '', dataURL: '' as DataURL })).toBe(false);
  });

  test('shouldStripDataUrlForBroadcast is true only when url is usable', () => {
    expect(shouldStripDataUrlForBroadcast({ url: 'https://example.com/a.png' })).toBe(true);
    expect(shouldStripDataUrlForBroadcast({ url: '' })).toBe(false);
    expect(shouldStripDataUrlForBroadcast({ url: undefined })).toBe(false);
  });
});
