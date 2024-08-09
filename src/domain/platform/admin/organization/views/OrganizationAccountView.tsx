import React from 'react';
import PageContentColumn from '../../../../../core/ui/content/PageContentColumn';
import PageContentBlock from '../../../../../core/ui/content/PageContentBlock';
import { BlockTitle } from '../../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';
import JourneyCardHorizontal, {
  JourneyCardHorizontalProps,
  JourneyCardHorizontalSkeleton,
} from '../../../../journey/common/JourneyCardHorizontal/JourneyCardHorizontal';
import Gutters from '../../../../../core/ui/grid/Gutters';
import ContributorCardHorizontal, {
  ContributorCardHorizontalProps,
} from '../../../../../core/ui/card/ContributorCardHorizontal';
import InnovationPackCardHorizontal, {
  InnovationPackCardHorizontalProps,
  InnovationPackCardHorizontalSkeleton,
} from '../../../../collaboration/InnovationPack/InnovationPackCardHorizontal/InnovationPackCardHorizontal';
import InnovationHubCardHorizontal, {
  InnovationHubCardHorizontalProps,
  InnovationHubCardHorizontalSkeleton,
} from '../../../../innovationHub/InnovationHubCardHorizontal/InnovationHubCardHorizontal';

export interface OrganizationAccountViewProps {
  spaces: JourneyCardHorizontalProps['journey'][];
  virtualContributors: ContributorCardHorizontalProps[];
  innovationPacks: InnovationPackCardHorizontalProps[];
  innovationHubs: InnovationHubCardHorizontalProps[];
  loading?: boolean;
  spacesLoading?: boolean;
}

export const OrganizationAccountView = ({
  spaces,
  virtualContributors,
  innovationPacks,
  innovationHubs,
  loading,
  spacesLoading,
}: OrganizationAccountViewProps) => {
  const { t } = useTranslation();

  return (
    <PageContentColumn columns={12}>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.hostedSpaces')}</BlockTitle>
        <Gutters disablePadding>
          {spacesLoading && <JourneyCardHorizontalSkeleton />}
          {!spacesLoading &&
            spaces.map(space => (
              <JourneyCardHorizontal
                journeyTypeName="space"
                journey={space}
                deepness={0}
                seamless
                sx={{ display: 'inline-block', maxWidth: '100%' }}
              />
            ))}
        </Gutters>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.virtualContributors')}</BlockTitle>
        <Gutters disablePadding>
          {loading && <JourneyCardHorizontalSkeleton />}
          {!loading && virtualContributors?.map(vc => <ContributorCardHorizontal {...vc} seamless />)}
        </Gutters>
      </PageContentBlock>
      <PageContentBlock halfWidth>
        <BlockTitle>{t('pages.admin.generic.sections.account.innovationPacks')}</BlockTitle>
        {loading && <InnovationPackCardHorizontalSkeleton />}
        {!loading && innovationPacks?.map(pack => <InnovationPackCardHorizontal {...pack} />)}
      </PageContentBlock>
      {innovationHubs.length > 0 && (
        <PageContentBlock halfWidth>
          <BlockTitle>{t('pages.admin.generic.sections.account.customHomepages')}</BlockTitle>
          {loading && <InnovationHubCardHorizontalSkeleton />}
          {!loading &&
            innovationHubs?.map(hub => (
              <InnovationHubCardHorizontal
                profile={hub.profile}
                spaceListFilter={hub.spaceListFilter}
                spaceVisibilityFilter={hub.spaceVisibilityFilter}
              />
            ))}
        </PageContentBlock>
      )}
    </PageContentColumn>
  );
};

export default OrganizationAccountView;
