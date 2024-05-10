import React, { FC, PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import AssociatedOrganizationsLazilyFetched from '../../contributor/organization/AssociatedOrganizations/AssociatedOrganizationsLazilyFetched';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { VirtualContributorQuery } from '../../../../core/apollo/generated/graphql-schema';
import VCProfileView from '../views/VCProfileView';
import { BlockTitle } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';

interface Props {
  virtualContributor: VirtualContributorQuery['virtualContributor'] | undefined;
}

export const VCProfilePageView: FC<PropsWithChildren<Props>> = ({ virtualContributor }) => {
  const { t } = useTranslation();

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <VCProfileView virtualContributor={virtualContributor} />
        <AssociatedOrganizationsLazilyFetched
          organizationIds={[]}
          title={t('pages.user-profile.associated-organizations.title')}
          helpText={t('pages.user-profile.associated-organizations.help')}
        />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <PageContentColumn columns={4}>
          <PageContentBlock>
            <BlockTitle>Knowledge</BlockTitle>
            <WrapperMarkdown>
              Answers Alkemio Help gives are based on the body of knowledge that is specified in the following Space:
            </WrapperMarkdown>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={4}>
          <PageContentBlock>
            <BlockTitle>Personality</BlockTitle>
            <WrapperMarkdown>
              For its tone of voice and interaction style, Alkemio Help uses the following personality:
            </WrapperMarkdown>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={4}>
          <PageContentBlock>
            <BlockTitle>Context</BlockTitle>
            <WrapperMarkdown>
              Alkemio Help uses the following information from the Space it is invited to so it can provide you with
              meaningful answers: Space about page: Name, Tagline, location, etc. Context information Statistics
            </WrapperMarkdown>
          </PageContentBlock>
        </PageContentColumn>
        <PageContentColumn columns={4}>
          <PageContentBlock>
            <BlockTitle>Privacy</BlockTitle>
            <WrapperMarkdown>
              For Alkemio, safeguarding your data is of utmost importance. We are committed to maintaining the security
              and privacy of your information. When interacting with a Virtual Contributor, only the data explicitly
              specified on the left (Context) is used to generate meaningful answers. Importantly, your (Space) data is
              not utilized for training the Virtual Contributor.  Additionally, please note that questions and answers
              exchanged with the Virtual Contributor may be visible to the Alkemio team.
            </WrapperMarkdown>
          </PageContentBlock>
        </PageContentColumn>
      </PageContentColumn>
    </PageContent>
  );
};

export default VCProfilePageView;
