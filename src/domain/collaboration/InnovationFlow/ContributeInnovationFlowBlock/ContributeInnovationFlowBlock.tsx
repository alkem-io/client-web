import React, { FC, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { gutters } from '../../../../core/ui/grid/utils';
import { useInnovationFlowBlockQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { getJourneyTypeName } from '../../../challenge/JourneyTypeName';
import Image from '../../../shared/components/Image';
import { Link, Skeleton } from '@mui/material';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Text } from '../../../../core/ui/typography';
import { times } from 'lodash';
import InnovationFlowPreviewDialog from '../InnovationFlowDialogs/InnovationFlowPreviewDialog';

interface ContributeInnovationFlowBlockProps {}

export const ContributeInnovationFlowBlock: FC<ContributeInnovationFlowBlockProps> = () => {
  const { t } = useTranslation();

  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();
  const journeyTypeName = getJourneyTypeName({ challengeNameId, opportunityNameId });

  const { data, loading } = useInnovationFlowBlockQuery({
    variables: {
      spaceNameId: spaceNameId!,
      challengeNameId,
      opportunityNameId,
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: !spaceNameId || (!challengeNameId && !opportunityNameId),
  });

  const innovationFlow = data?.space.challenge?.innovationFlow ?? data?.space.opportunity?.innovationFlow;

  const [innovationFlowDialogOpen, setInnovationFlowDialogOpen] = useState(false);

  return (
    <>
      <PageContentBlock accent>
        {(loading || !innovationFlow) && times(3, index => <Skeleton key={index} />)}
        {!loading && innovationFlow && (
          <>
            <WrapperMarkdown>
              {t('pages.contribute.innovationFlow.title', {
                entity: t(`common.journeyTypes.${journeyTypeName}` as const),
                innovationFlowDisplayName: innovationFlow?.profile.displayName,
              })}
            </WrapperMarkdown>
            {innovationFlow?.profile.cardBanner?.uri && (
              <Image
                src={innovationFlow.profile.cardBanner.uri}
                alt={innovationFlow.profile.cardBanner.alternativeText}
              />
            )}
            <Text component={Link} onClick={() => setInnovationFlowDialogOpen(true)} sx={{ cursor: 'pointer' }}>
              <OpenInNewOutlinedIcon fontSize="small" sx={{ verticalAlign: 'bottom', marginRight: gutters(0.5) }} />
              <Trans
                i18nKey="pages.contribute.innovationFlow.readMore"
                values={{
                  innovationFlowDisplayName: innovationFlow?.profile.displayName,
                }}
                components={{
                  b: <strong />,
                }}
              />
            </Text>
          </>
        )}
      </PageContentBlock>
      <InnovationFlowPreviewDialog
        open={innovationFlowDialogOpen}
        onClose={() => setInnovationFlowDialogOpen(false)}
        spaceNameId={spaceNameId!}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
      />
    </>
  );
};
