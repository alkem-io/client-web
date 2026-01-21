import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { DataURL } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import type { BinaryFileDataWithOptionalUrl } from '../../types';
import { isFileRenderable, shouldStripDataUrlForBroadcast } from '../../fileStore/fileAvailability';

/**
 * Tests for Portal.broadcastScene file payload rules:
 * - Files with url should have dataURL stripped (bandwidth optimization)
 * - Files without url but with dataURL should keep dataURL (so peers can render)
 * - Files with neither url nor dataURL should be skipped (unrecoverable)
 */
describe('Portal broadcastScene file payload rules', () => {
  const createFile = (
    id: string,
    options: { url?: string; dataURL?: DataURL }
  ): BinaryFileDataWithOptionalUrl =>
    ({
      id,
      mimeType: 'image/png',
      created: Date.now(),
      url: options.url,
      dataURL: options.dataURL,
    }) as BinaryFileDataWithOptionalUrl;

  describe('isFileRenderable', () => {
    it('should return true when file has usable url', () => {
      const file = createFile('file-with-url', {
        url: 'https://example.com/image.png',
        dataURL: undefined,
      });
      expect(isFileRenderable(file)).toBe(true);
    });

    it('should return true when file has usable dataURL', () => {
      const file = createFile('file-with-dataurl', {
        url: undefined,
        dataURL: 'data:image/png;base64,abc123' as DataURL,
      });
      expect(isFileRenderable(file)).toBe(true);
    });

    it('should return true when file has both url and dataURL', () => {
      const file = createFile('file-with-both', {
        url: 'https://example.com/image.png',
        dataURL: 'data:image/png;base64,abc123' as DataURL,
      });
      expect(isFileRenderable(file)).toBe(true);
    });

    it('should return false when file has neither url nor dataURL', () => {
      const file = createFile('file-empty', {
        url: undefined,
        dataURL: undefined,
      });
      expect(isFileRenderable(file)).toBe(false);
    });

    it('should return false when url and dataURL are empty strings', () => {
      const file = createFile('file-empty-strings', {
        url: '',
        dataURL: '' as DataURL,
      });
      expect(isFileRenderable(file)).toBe(false);
    });
  });

  describe('shouldStripDataUrlForBroadcast', () => {
    it('should return true when file has usable url (strip dataURL for bandwidth)', () => {
      const file = createFile('file-with-url', {
        url: 'https://example.com/image.png',
        dataURL: 'data:image/png;base64,abc123' as DataURL,
      });
      expect(shouldStripDataUrlForBroadcast(file)).toBe(true);
    });

    it('should return false when file has no url (keep dataURL for peers)', () => {
      const file = createFile('file-no-url', {
        url: undefined,
        dataURL: 'data:image/png;base64,abc123' as DataURL,
      });
      expect(shouldStripDataUrlForBroadcast(file)).toBe(false);
    });

    it('should return false when url is empty string', () => {
      const file = createFile('file-empty-url', {
        url: '',
        dataURL: 'data:image/png;base64,abc123' as DataURL,
      });
      expect(shouldStripDataUrlForBroadcast(file)).toBe(false);
    });
  });

  describe('broadcast payload simulation', () => {
    /**
     * Simulates the Portal.broadcastScene file processing logic
     */
    const simulateBroadcastPayload = (
      files: Record<string, BinaryFileDataWithOptionalUrl>
    ): Record<string, BinaryFileDataWithOptionalUrl> => {
      const emptyDataURL = '' as DataURL;
      const result: Record<string, BinaryFileDataWithOptionalUrl> = {};

      for (const [fileId, file] of Object.entries(files)) {
        // Skip files that have no usable retrieval path
        if (!isFileRenderable(file)) {
          continue;
        }
        // Only strip dataURL when url is usable
        const dataURL = shouldStripDataUrlForBroadcast(file) ? emptyDataURL : file.dataURL;
        result[fileId] = { ...file, dataURL };
      }

      return result;
    };

    it('should include file with url and strip its dataURL', () => {
      const files = {
        'file-1': createFile('file-1', {
          url: 'https://example.com/image.png',
          dataURL: 'data:image/png;base64,abc123' as DataURL,
        }),
      };

      const payload = simulateBroadcastPayload(files);

      expect(payload['file-1']).toBeDefined();
      expect(payload['file-1'].url).toBe('https://example.com/image.png');
      expect(payload['file-1'].dataURL).toBe('');
    });

    it('should include file with only dataURL and preserve it', () => {
      const files = {
        'file-1': createFile('file-1', {
          url: undefined,
          dataURL: 'data:image/png;base64,abc123' as DataURL,
        }),
      };

      const payload = simulateBroadcastPayload(files);

      expect(payload['file-1']).toBeDefined();
      expect(payload['file-1'].url).toBeUndefined();
      expect(payload['file-1'].dataURL).toBe('data:image/png;base64,abc123');
    });

    it('should skip unrenderable files (no url, no dataURL)', () => {
      const files = {
        'file-1': createFile('file-1', {
          url: undefined,
          dataURL: undefined,
        }),
      };

      const payload = simulateBroadcastPayload(files);

      expect(payload['file-1']).toBeUndefined();
      expect(Object.keys(payload)).toHaveLength(0);
    });

    it('should handle mixed file states correctly', () => {
      const files = {
        'with-url': createFile('with-url', {
          url: 'https://example.com/1.png',
          dataURL: 'data:image/png;base64,abc' as DataURL,
        }),
        'only-dataurl': createFile('only-dataurl', {
          url: undefined,
          dataURL: 'data:image/png;base64,def' as DataURL,
        }),
        'unrenderable': createFile('unrenderable', {
          url: undefined,
          dataURL: undefined,
        }),
        'url-no-dataurl': createFile('url-no-dataurl', {
          url: 'https://example.com/2.png',
          dataURL: undefined,
        }),
      };

      const payload = simulateBroadcastPayload(files);

      // File with url: included, dataURL stripped
      expect(payload['with-url']).toBeDefined();
      expect(payload['with-url'].dataURL).toBe('');

      // File with only dataURL: included, dataURL preserved
      expect(payload['only-dataurl']).toBeDefined();
      expect(payload['only-dataurl'].dataURL).toBe('data:image/png;base64,def');

      // Unrenderable: skipped
      expect(payload['unrenderable']).toBeUndefined();

      // File with url but no dataURL: included, dataURL stays as undefined (becomes '')
      expect(payload['url-no-dataurl']).toBeDefined();
      expect(payload['url-no-dataurl'].url).toBe('https://example.com/2.png');
    });
  });
});
