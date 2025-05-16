import React from 'react';
import { ArrowForward } from '@mui/icons-material';
import { useTranslation } from 'react-i18next';
import ButtonNarrow from '@/core/ui/actions/ButtonNarrow';
import RouterLink from '@/core/ui/link/RouterLink';

interface SpaceCardGoToButtonProps {
  spaceUri: string;
  subspace?: boolean;
}

const SpaceCardGoToButton = ({ spaceUri, subspace }: SpaceCardGoToButtonProps) => {
  const { t } = useTranslation();

  return (
    <ButtonNarrow component={RouterLink} to={spaceUri} startIcon={<ArrowForward />}>
      {t('buttons.go-to-entity', { entity: t(`common.${subspace ? 'subspace' : 'space'}` as const) })}
    </ButtonNarrow>
  );
};

export default SpaceCardGoToButton;
