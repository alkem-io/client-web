import { buildMessagesTree, IdentifiableReply } from './useMessagesTree';
import { expect, test, describe } from 'vitest';

describe('buildMessagesTree', () => {
  test('builds a simple tree', () => {
    const messages: IdentifiableReply[] = [
      {
        id: 'root0',
      },
      {
        id: 'reply0',
        threadID: 'root0',
      },
      {
        id: 'root1',
      },
    ];

    expect(buildMessagesTree(messages)).toEqual([
      {
        id: 'root0',
        replies: [
          {
            id: 'reply0',
            threadID: 'root0',
          },
        ],
      },
      {
        id: 'root1',
      },
    ]);
  });

  test('skips replies without root', () => {
    const messages: IdentifiableReply[] = [
      {
        id: 'root0',
      },
      {
        id: 'reply0',
        threadID: 'root2',
      },
      {
        id: 'root1',
      },
    ];

    expect(buildMessagesTree(messages)).toEqual([
      {
        id: 'root0',
      },
      {
        id: 'root1',
      },
    ]);
  });

  test('treats self-pointing replies as root messages', () => {
    // TODO remove after dealing with client-4587
    const messages: IdentifiableReply[] = [
      {
        id: 'root0',
        threadID: 'root0',
      },
      {
        id: 'reply0',
        threadID: 'root0',
      },
      {
        id: 'root1',
      },
    ];

    expect(buildMessagesTree(messages)).toEqual([
      {
        id: 'root0',
        threadID: 'root0',
        replies: [
          {
            id: 'reply0',
            threadID: 'root0',
          },
        ],
      },
      {
        id: 'root1',
      },
    ]);
  });
});
