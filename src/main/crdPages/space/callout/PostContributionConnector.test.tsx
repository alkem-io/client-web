import { render } from '@testing-library/react';
import type { ReactNode } from 'react';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import { PostContributionConnector } from './PostContributionConnector';

const state = vi.hoisted(() => ({ dialogProps: undefined as Record<string, unknown> | undefined }));

vi.mock('@/domain/storage/StorageBucket/StorageConfigContext', () => ({
  StorageConfigContextProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock('@/main/crdPages/post/CrdPostContributionDialog', () => ({
  CrdPostContributionDialog: (props: Record<string, unknown>) => {
    state.dialogProps = props;
    return null;
  },
}));

beforeEach(() => {
  state.dialogProps = undefined;
});

describe('PostContributionConnector', () => {
  test('hands the save notification to its owner so a board can return the user to the columns', () => {
    const onUpdated = vi.fn();

    render(
      <PostContributionConnector
        open={true}
        calloutId="callout-1"
        contributionId="contribution-1"
        postId="post-1"
        onClose={vi.fn()}
        onUpdated={onUpdated}
      />
    );

    expect(state.dialogProps?.onUpdated).toBe(onUpdated);
  });
});
