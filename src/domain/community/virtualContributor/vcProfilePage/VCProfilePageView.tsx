import React, { FC, PropsWithChildren } from 'react';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ShieldIcon from '@mui/icons-material/Shield';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import BookIcon from '@mui/icons-material/Book';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import { VirtualContributorQuery } from '../../../../core/apollo/generated/graphql-schema';
import VCProfileView from '../views/VCProfileView';
import { BlockTitle } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import HostOrganization from './HostOrganization';

interface Props {
  virtualContributor: VirtualContributorQuery['virtualContributor'] | undefined;
}

export const VCProfilePageView: FC<PropsWithChildren<Props>> = ({ virtualContributor }) => {
  const vcName = virtualContributor?.profile.displayName || 'Alkemio Help';

  const getBodyOfKnowledgeMD = () => `Answers ${vcName}
    gives are based on the body of knowledge that is specified in the Space.`;

  const getPersonalityMD = () => ` For its tone of voice and interaction style, ${vcName}
    uses the following personality - Friendly & Aspirational.`;

  const getContextMD = () => `${vcName}
uses the following information from the Space it is invited to so it can provide you with meaningful answers:

Space about page:
* Name, Tagline, location, etc.
* Context information
* Statistics`;

  const getPrivacyMD = () => `${vcName} is designed to respect your privacy and the privacy of your Space. Here is how:
* When interacting with a Virtual Contributor, only the data explicitly specified on the left (Context) is used to generate meaningful answers.
* Importantly, your (Space) data is not utilized for training the Virtual Contributor.
* Additionally, please note that questions and answers exchanged with the Virtual Contributor may be visible to the Alkemio team.
    `;

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <VCProfileView virtualContributor={virtualContributor} />
        <HostOrganization />
      </PageContentColumn>
      <PageContentColumn columns={8}>
        <PageContentBlock>
          <BlockTitle display={'flex'} alignItems={'center'}>
            <BookIcon color="primary" fontSize="small" />
            &nbsp;Knowledge
          </BlockTitle>
          <WrapperMarkdown>{getBodyOfKnowledgeMD()}</WrapperMarkdown>
          <BlockTitle display={'flex'} alignItems={'center'}>
            <RecordVoiceOverIcon color="primary" fontSize="small" />
            &nbsp;Personality
          </BlockTitle>
          <WrapperMarkdown>{getPersonalityMD()}</WrapperMarkdown>
          <BlockTitle display={'flex'} alignItems={'center'}>
            <CloudDownloadIcon color="primary" fontSize="small" />
            &nbsp;Context
          </BlockTitle>
          <WrapperMarkdown>{getContextMD()}</WrapperMarkdown>
        </PageContentBlock>
        <PageContentBlock>
          <BlockTitle display={'flex'} alignItems={'center'}>
            <ShieldIcon color="primary" fontSize="small" />
            &nbsp;Privacy
          </BlockTitle>
          <WrapperMarkdown disableParagraphPadding>{getPrivacyMD()}</WrapperMarkdown>
        </PageContentBlock>
      </PageContentColumn>
    </PageContent>
  );
};

export default VCProfilePageView;
