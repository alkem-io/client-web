import {
  useCreateSpaceOrganizationAccountQuery,
  useCreateSpaceViewerAccountQuery,
} from '@/core/apollo/generated-v2/apollo-hooks';
import type { CreateSpaceAccountFragment } from '@/core/apollo/generated-v2/graphql-schema';

type Props = {
  /** The organisation hosting the new space; the viewer's own account when absent (surface.graphql:92). */
  organizationId?: string;
  skip?: boolean;
};

type Provided = {
  account: CreateSpaceAccountFragment | undefined;
  loading: boolean;
};

/** The hosting account of an L0 create: `viewer.account`, or the organisation's `Actor.account`. */
export const useCreateSpaceAccount = ({ organizationId, skip = false }: Props): Provided => {
  const viewer = useCreateSpaceViewerAccountQuery({ skip: skip || Boolean(organizationId) });
  const organization = useCreateSpaceOrganizationAccountQuery({
    variables: { organization: organizationId ?? '' },
    skip: skip || !organizationId,
  });

  if (organizationId) {
    const node = organization.data?.node;
    const account = node && 'account' in node ? (node.account ?? undefined) : undefined;
    return { account, loading: organization.loading };
  }
  return { account: viewer.data?.viewer.account ?? undefined, loading: viewer.loading };
};
