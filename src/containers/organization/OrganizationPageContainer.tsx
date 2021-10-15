import { ApolloError } from '@apollo/client';
import React, { FC, useMemo } from 'react';
import { SocialLinkItem } from '../../components/composite/common/SocialLinks/SocialLinks';
import { useOrganization, useUserContext } from '../../hooks';
import { KEYWORDS_TAGSET, SKILLS_TAGSET } from '../../models/constants/tagset.constants';
import { Container } from '../../models/container';
import { isSocialNetworkSupported, SocialNetworkEnum, toSocialNetworkEnum } from '../../models/enums/SocialNetworks';
import { AuthorizationCredential, OrganizationInfoFragment } from '../../models/graphql-schema';

export interface OrganizationContainerEntities {
  organization?: OrganizationInfoFragment;
  socialLinks: SocialLinkItem[];
  links: string[];
  skills: string[];
  keywords: string[];
  permissions: {
    canEdit: boolean;
  };
}

export interface OrganizationContainerActions {}

export interface OrganizationContainerState {
  loading: boolean;
  error?: ApolloError;
}

export interface OrganizationPageContainerProps
  extends Container<OrganizationContainerEntities, OrganizationContainerActions, OrganizationContainerState> {}

export const OrganizationPageContainer: FC<OrganizationPageContainerProps> = ({ children }) => {
  const { organizationId, loading, organization } = useOrganization();

  const socialLinks = useMemo(() => {
    const isSocialLink = (item: { type?: string; url: string }): item is SocialLinkItem => !!item?.type;

    const result = (organization?.profile.references || [])
      .map(s => ({
        type: toSocialNetworkEnum(s.name),
        url: s.uri,
      }))
      .filter(isSocialLink);
    if (organization?.contactEmail) result.push({ type: SocialNetworkEnum.email, url: organization?.contactEmail });

    return result;
  }, [organization]);

  const links = useMemo(() => {
    let result = (organization?.profile.references || [])
      .filter(x => !isSocialNetworkSupported(x.name))
      .map(s => s.uri);

    if (organization?.website) result = [organization.website, ...result];

    return result;
  }, [organization]);

  const keywords = useMemo(
    () => organization?.profile.tagsets?.find(x => x.name.toLowerCase() === KEYWORDS_TAGSET)?.tags || [],
    [organization]
  );

  const skills = useMemo(
    () => organization?.profile.tagsets?.find(x => x.name.toLowerCase() === SKILLS_TAGSET)?.tags || [],
    [organization]
  );

  const { user } = useUserContext();

  const permissions = {
    canEdit: useMemo(
      () =>
        user?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
        user?.hasCredentials(AuthorizationCredential.OrganizationOwner, organizationId) ||
        user?.hasCredentials(AuthorizationCredential.OrganizationAdmin, organizationId) ||
        false,
      [user]
    ),
  };

  return (
    <>
      {children(
        { organization, permissions, socialLinks, links, keywords, skills },
        {
          loading,
        },
        {}
      )}
    </>
  );
};
export default OrganizationPageContainer;
