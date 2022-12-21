import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ButtonNarrow from '../../../../core/ui/actions/ButtonNarrow';
import { JourneyTypeName } from '../../JourneyTypeName';

interface JourneyCardGoToButtonProps {
  journeyUri: string;
  journeyTypeName: JourneyTypeName;
}

const JourneyCardGoToButton = ({ journeyUri, journeyTypeName }: JourneyCardGoToButtonProps) => {
  const { t } = useTranslation();

  return (
    <ButtonNarrow component={Link} to={journeyUri} startIcon={<ArrowForward />}>
      {t('buttons.go-to-entity', { entity: t(`common.${journeyTypeName}` as const) })}
    </ButtonNarrow>
  );
};

export default JourneyCardGoToButton;
