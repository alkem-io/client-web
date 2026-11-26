import { AuthorizationPrivilege } from '@/core/apollo/generated/graphql-schema';
import { useSpacePageData } from '@/domain/space/hooks/useSpacePage';

type CalloutsSetAuthorizationParams = {
  calloutsSetId: string | undefined;
  skip?: boolean;
};

type CalloutsSetAuthorizationType = {
  calloutsSetPrivileges: AuthorizationPrivilege[];
  canCreateCallout: boolean;
  canReadCalloutsSet: boolean;
  canMoveCallouts: boolean;
  loading: boolean;
};

/** Natively the set is its space (021 F029): its privileges are the D2 Space document's `can`, from the page cache. */
export const useCalloutsSetAuthorization = ({
  calloutsSetId,
  skip,
}: CalloutsSetAuthorizationParams): CalloutsSetAuthorizationType => {
  const node = useSpacePageData(skip ? undefined : calloutsSetId, 'space')?.node;
  const can = node && 'can' in node ? node.can : undefined;
  const calloutsSetPrivileges = [
    can?.read ? AuthorizationPrivilege.Read : undefined,
    can?.createPost ? AuthorizationPrivilege.CreateCallout : undefined,
    can?.update ? AuthorizationPrivilege.Update : undefined,
  ].filter(privilege => privilege !== undefined);

  return {
    calloutsSetPrivileges,
    canCreateCallout: can?.createPost ?? false,
    canReadCalloutsSet: can?.read ?? false,
    canMoveCallouts: can?.update ?? false,
    loading: Boolean(calloutsSetId) && !skip && !node,
  };
};
