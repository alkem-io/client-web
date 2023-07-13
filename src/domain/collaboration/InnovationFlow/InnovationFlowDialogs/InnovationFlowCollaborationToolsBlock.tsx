import { ComponentType, FC } from 'react';
import { BlockTitle, Caption } from '../../../../core/ui/typography';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { useTranslation } from 'react-i18next';
import { Box, SvgIconProps } from '@mui/material';
import { GrouppedCallout } from './useInnovationFlowSettings';
import { groupBy } from 'lodash';
import calloutIcons from '../../callout/utils/calloutIcons';

interface InnovationFlowCollaborationToolsBlockProps {
  callouts: GrouppedCallout[];
  flowStateAllowedValues: string[];
}

interface ListItemProps {
  displayName: string;
  icon?: ComponentType<SvgIconProps>;
  activity?: number;
}
const ListItem = ({ displayName, icon: Icon, activity = 0 }: ListItemProps) => {
  return (
    <Box>
      <Caption>
        {Icon ? <Icon /> : undefined}
        {displayName} ({activity})
      </Caption>
    </Box>
  );
};

const InnovationFlowCollaborationToolsBlock: FC<InnovationFlowCollaborationToolsBlockProps> = ({
  callouts,
  flowStateAllowedValues,
}) => {
  const { t } = useTranslation();
  const groupedCallouts = groupBy(callouts, callout => callout.flowState);

  return (
    <PageContentBlock disablePadding disableGap>
      <BlockTitle>{t('common.collaborationTools')}</BlockTitle>
      <Box>
        {flowStateAllowedValues.map(state => (
          <PageContentBlock disablePadding disableGap>
            <Caption>{state}</Caption>
            {groupedCallouts[state] &&
              groupedCallouts[state].length &&
              groupedCallouts[state].map(callout => (
                <ListItem
                  key={callout.id}
                  displayName={callout.profile.displayName}
                  icon={calloutIcons[callout.type]}
                />
              ))}
          </PageContentBlock>
        ))}
      </Box>
    </PageContentBlock>
  );
};

export default InnovationFlowCollaborationToolsBlock;
