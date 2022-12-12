import React, { FC } from 'react';
import { Tooltip } from '@mui/material';
import { Link } from 'react-router-dom';
import { Reference } from '../../../../../domain/common/profile/Profile';
import { Language } from '@mui/icons-material';
import { BlockSectionTitle, CardText } from '../../../../../core/ui/typography';
import RoundedIcon from '../../../../../core/ui/icon/RoundedIcon';
import ItemView from '../../../../../core/ui/list/ItemView';

interface ReferenceProps {
  reference: Reference;
}

const REFERENCE_DESCRIPTION_MAX_LENGTH = 80; // characters

interface ReferenceDescriptionProps {
  children: string | undefined;
}

const ReferenceDescription: FC<ReferenceDescriptionProps> = ({ children }) => {
  if (typeof children === 'undefined') {
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

const ReferenceView: FC<ReferenceProps> = ({ reference }) => {
  return (
    <ItemView visual={<RoundedIcon size="medium" component={Language} />}>
      <Tooltip title={reference.uri} placement="top-start" disableInteractive>
        <BlockSectionTitle component={Link} to={reference.uri} target="_blank">
          {reference.name}
        </BlockSectionTitle>
      </Tooltip>
      <ReferenceDescription>{reference.description}</ReferenceDescription>
    </ItemView>
  );
};

export default ReferenceView;
