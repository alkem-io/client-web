import { ComponentType, FC } from 'react';
import { SvgIconProps } from '@mui/material';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { CalloutIcon } from '../../../collaboration/callout/icon/CalloutIcon';
import { LockOutlined } from '@mui/icons-material';

interface SearchContributionParentSegmentProps {
  displayName: string;
  iconComponent: ComponentType<SvgIconProps>;
  locked?: boolean;
  url: string;
  calloutDisplayName: string;
  calloutUrl: string;
}
export const SearchContributionParentSegment: FC<SearchContributionParentSegmentProps> = ({
  displayName,
  iconComponent: Icon,
  locked = false,
  url,
  calloutDisplayName,
  calloutUrl,
}) => {
  const stopPropagation = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event.stopPropagation();

  return (
    <>
      <CardSegmentCaption
        component={RouterLink}
        to={calloutUrl}
        icon={<CalloutIcon />}
        onClick={stopPropagation}
        noWrap
      >
        {calloutDisplayName}
      </CardSegmentCaption>
      <CardSegmentCaption
        component={RouterLink}
        to={url}
        icon={Icon ? <Icon /> : undefined}
        secondaryIcon={locked ? <LockOutlined fontSize="small" color="primary" /> : undefined}
        onClick={stopPropagation}
        noWrap
      >
        {displayName}
      </CardSegmentCaption>
    </>
  );
};
