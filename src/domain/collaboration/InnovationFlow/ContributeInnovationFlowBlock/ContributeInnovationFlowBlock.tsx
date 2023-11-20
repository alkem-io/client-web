import React, { FC, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { gutters } from '../../../../core/ui/grid/utils';
import { useInnovationFlowBlockQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { getJourneyTypeName } from '../../../journey/JourneyTypeName';
import ImageFadeIn from '../../../../core/ui/image/ImageFadeIn';
import { Button, Skeleton } from '@mui/material';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Text } from '../../../../core/ui/typography';
import { times } from 'lodash';
import InnovationFlowPreviewDialog from '../InnovationFlowDialogs/InnovationFlowPreviewDialog';

interface ContributeInnovationFlowBlockProps {}

export const ContributeInnovationFlowBlock: FC<ContributeInnovationFlowBlockProps> = () => {
  const { t } = useTranslation();

  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  if (!spaceNameId) {
    throw new Error('Must be under a Space.');
  }

  const journeyTypeName = getJourneyTypeName({ spaceNameId, challengeNameId, opportunityNameId })!;

  const { data, loading } = useInnovationFlowBlockQuery({
    variables: {
      spaceNameId,
      challengeNameId,
      opportunityNameId,
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: !challengeNameId && !opportunityNameId,
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
              <ImageFadeIn
                src={innovationFlow.profile.cardBanner.uri}
                alt={innovationFlow.profile.cardBanner.alternativeText}
              />
            )}
            <Button
              size="small"
              variant="text"
              startIcon={<OpenInNewOutlinedIcon fontSize="small" />}
              onClick={() => setInnovationFlowDialogOpen(true)}
              sx={{ alignSelf: 'start', padding: 0, paddingX: gutters(0.5), marginLeft: gutters(-0.5) }}
            >
              <Text textTransform="none">
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
            </Button>
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
