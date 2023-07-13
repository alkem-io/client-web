import React, { FC, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useUrlParams } from '../../../../core/routing/useUrlParams';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { gutters } from '../../../../core/ui/grid/utils';
import { useInnovationFlowBlockQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { JourneyTypeName } from '../../../challenge/JourneyTypeName';
import Image from '../../../shared/components/Image';
import { Link, Skeleton } from '@mui/material';
import OpenInNewOutlinedIcon from '@mui/icons-material/OpenInNewOutlined';
import { Text } from '../../../../core/ui/typography';
import { times } from 'lodash';
//import InnovationFlowPreviewDialog from '../InnovationFlowDialogs/InnovationFlowPreviewDialog';
import InnovationFlowSettingsDialog from '../InnovationFlowDialogs/InnovationFlowSettingsDialog';

interface ContributeInnovationFlowBlockProps {
  journeyTypeName: JourneyTypeName;
}

export const ContributeInnovationFlowBlock: FC<ContributeInnovationFlowBlockProps> = ({ journeyTypeName }) => {
  const { t } = useTranslation();

  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();
  const { data, loading } = useInnovationFlowBlockQuery({
    variables: {
      spaceNameId: spaceNameId!,
      challengeNameId,
      opportunityNameId,
      includeChallenge: !opportunityNameId,
      includeOpportunity: !!opportunityNameId,
    },
    skip: !spaceNameId || (!challengeNameId && !opportunityNameId),
  });

  const innovationFlow = data?.space.challenge?.innovationFlow ?? data?.space.opportunity?.innovationFlow;

  const [innovationFlowDialogOpen, setInnovationFlowDialogOpen] = useState(false);

  return (
    <>
      <PageContentBlock accent>
        {(loading || !innovationFlow) && times(3, () => <Skeleton />)}
        {!loading && innovationFlow && (
          <>
            <WrapperMarkdown>
              {t('pages.contribute.innovationFlow.title', {
                entity: t(`common.journeyTypes.${journeyTypeName}` as const),
                innovationFlowDisplayName: innovationFlow?.profile.displayName,
              })}
            </WrapperMarkdown>
            {innovationFlow?.profile.bannerNarrow?.uri && (
              <Image
                src={innovationFlow.profile.bannerNarrow.uri}
                alt={innovationFlow.profile.bannerNarrow.alternativeText}
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
      <InnovationFlowSettingsDialog
        open={innovationFlowDialogOpen}
        onClose={() => setInnovationFlowDialogOpen(false)}
        spaceNameId={spaceNameId!}
        challengeNameId={challengeNameId}
        opportunityNameId={opportunityNameId}
      />
    </>
  );
};
