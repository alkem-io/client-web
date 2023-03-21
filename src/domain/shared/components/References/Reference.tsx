import React, { FC } from 'react';
import { Tooltip } from '@mui/material';
import { Reference } from '../../../common/profile/Profile';
import { BlockSectionTitle, CardText } from '../../../../core/ui/typography';
import { RoundedIconProps } from '../../../../core/ui/icon/RoundedIcon';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { ReferenceIcon } from './icons/ReferenceIcon';
import RouterLink from '../../../../core/ui/link/RouterLink';
import RoundedBadge from '../../../../core/ui/icon/RoundedBadge';

export interface ReferenceViewProps {
  reference: Reference;
  icon?: RoundedIconProps['component'];
}

const REFERENCE_DESCRIPTION_MAX_LENGTH = 80; // characters

interface ReferenceDescriptionProps {
  children: string | undefined;
}

const ReferenceDescription: FC<ReferenceDescriptionProps> = ({ children }) => {
  if (!children) {
    return null;
  }

  const isCut = children.length > REFERENCE_DESCRIPTION_MAX_LENGTH;

  const descriptionText = isCut ? `${children.slice(0, REFERENCE_DESCRIPTION_MAX_LENGTH)}…` : children;

  const formattedDescription = <CardText>{descriptionText}</CardText>;

  if (isCut) {
    return (
      <Tooltip title={children} placement="top-start" disableInteractive>
        {formattedDescription}
      </Tooltip>
    );
  }

  return formattedDescription;
};

const ReferenceView: FC<ReferenceViewProps> = ({ reference }) => {
  return (
    <BadgeCardView
      component={RouterLink}
      to={reference.uri}
      loose
      visual={
        <RoundedBadge size="medium">
          <ReferenceIcon />
        </RoundedBadge>
      }
    >
      <Tooltip title={reference.uri} placement="top-start" disableInteractive>
        <BlockSectionTitle>{reference.name}</BlockSectionTitle>
      </Tooltip>
      <ReferenceDescription>{reference.description}</ReferenceDescription>
    </BadgeCardView>
  );
};

export default ReferenceView;
