import { describe, expect, it, vi } from 'vitest';
import { mapMatrixMessageAttachments, mapMessageAttachments } from './models';

describe('message attachment reference identity', () => {
  it('builds the same direct resource from GraphQL and native Matrix metadata without a resolver', () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('No attachment resolver allowed'));
    const graph = mapMessageAttachments(
      [
        {
          externalReference: 'media_1',
          displayName: 'résumé.mp4',
          mimeType: 'video/mp4',
          size: 123,
          width: 640,
          height: 360,
        },
      ],
      'bucket-1'
    );
    const native = mapMatrixMessageAttachments(
      {
        msgtype: 'm.video',
        url: 'mxc://matrix.example/media_1',
        body: 'caption',
        filename: 'résumé.mp4',
        info: { mimetype: 'video/mp4', size: 123, w: 640, h: 360 },
      },
      'matrix.example',
      'bucket-1'
    );
    expect(native).toEqual(graph);
    expect(graph[0].url).toBe(
      `${window.location.origin}/api/private/rest/storage/file/by-reference?bucketId=bucket-1&ref=media_1`
    );
    expect(graph[0].id).toBe('media_1');
    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });

  it('scopes the same media to each room bucket and encodes query values', () => {
    const attachment = [{ externalReference: 'media_1', displayName: 'file.pdf' }];
    expect(mapMessageAttachments(attachment, 'bucket-A')[0].url).not.toBe(
      mapMessageAttachments(attachment, 'bucket-B')[0].url
    );
    expect(mapMessageAttachments(attachment, 'a&b')[0].url).toContain('bucketId=a%26b&ref=media_1');
  });

  it('keeps unmapped and foreign media unavailable rather than using a file ID or Matrix URL', () => {
    expect(
      mapMessageAttachments([{ displayName: 'legacy', externalReference: null }], 'bucket')[0].url
    ).toBeUndefined();
    expect(mapMessageAttachments([{ displayName: 'file', externalReference: 'media' }], null)[0].url).toBeUndefined();
    expect(
      mapMatrixMessageAttachments(
        { msgtype: 'm.file', body: 'remote', url: 'mxc://foreign.example/media' },
        'matrix.example',
        'bucket'
      )[0].url
    ).toBeUndefined();
  });
  it('uses current event metadata for each media kind, keeping unknown types as a file chip', () => {
    for (const msgtype of ['m.image', 'm.video', 'm.audio', 'm.file', 'm.sticker']) {
      const [attachment] = mapMatrixMessageAttachments(
        { msgtype, url: 'mxc://matrix.example/media', body: 'name' },
        'matrix.example',
        'bucket'
      );
      expect(attachment.displayName).toBe('name');
      expect(attachment.mimeType).toBeUndefined();
      expect(attachment.url).toContain('bucketId=bucket&ref=media');
    }
    expect(mapMatrixMessageAttachments({ msgtype: 'm.text', body: 'text' }, 'matrix.example', 'bucket')).toEqual([]);
  });
  it('accepts Matrix sticker event type without inventing a msgtype field', () => {
    const [attachment] = mapMatrixMessageAttachments(
      { url: 'mxc://matrix.example/sticker', body: 'Sticker', info: { mimetype: 'image/png' } },
      'matrix.example',
      'bucket',
      'm.sticker'
    );
    expect(attachment.mimeType).toBe('image/png');
    expect(attachment.url).toContain('ref=sticker');
  });
});
