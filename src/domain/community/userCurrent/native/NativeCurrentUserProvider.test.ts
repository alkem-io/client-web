import { describe, expect, it } from 'vitest';
import type { V2FoundationQuery } from '@/core/apollo/generated-v2/graphql-schema';
import { memberFoundationTestData } from '@/core/foundation/foundationTestData';
import { toCurrentUserModel } from './NativeCurrentUserProvider';

type Viewer = V2FoundationQuery['viewer'];
const viewerWith = (entitlements: NonNullable<Viewer['account']>['entitlements']): Viewer => {
  const viewer = memberFoundationTestData().viewer;
  return { ...viewer, account: viewer.account ? { ...viewer.account, entitlements } : viewer.account };
};

describe('toCurrentUserModel — account entitlements', () => {
  it('lists the entitlements with remaining capacity', () => {
    const model = toCurrentUserModel(
      viewerWith([
        { __typename: 'Entitlement', name: 'account-space-free', limit: 1, usage: 0 },
        { __typename: 'Entitlement', name: 'account-space-plus', limit: 1, usage: 1 },
        { __typename: 'Entitlement', name: 'account-virtual-contributor', limit: null, usage: 3 },
      ]),
      false
    );
    expect(model.accountEntitlements).toEqual(['account-space-free', 'account-virtual-contributor']);
  });

  it('treats hidden entitlements (null without READ_LICENSE) as none, without failing the boot', () => {
    const model = toCurrentUserModel(viewerWith(null), false);
    expect(model.accountEntitlements).toEqual([]);
    expect(model.accountId).toBe('00000000-0000-0000-0000-000000000053');
  });
});
