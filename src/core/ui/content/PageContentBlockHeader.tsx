import { Box, useMediaQuery } from '@mui/material';
import { BlockTitle, CaptionSmall } from '../typography';
import { ReactNode } from 'react';
import { GUTTER_PX } from '../grid/constants';
import { Actions } from '../actions/Actions';
import { Theme } from '@mui/material/styles';

export interface PageContentBlockHeaderProps {
  title: ReactNode;
  actions?: ReactNode;
  topActions?: ReactNode;
  disclaimer?: ReactNode;
}

const PageContentBlockHeader = ({ title, actions, topActions, disclaimer }: PageContentBlockHeaderProps) => {
  const isSmallScreen = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

  return (
    <Box display="flex" flexDirection="row" justifyContent="space-between" alignItems="center" height={GUTTER_PX}>
      {isSmallScreen ? (
        <>
          <Box display="flex" flexDirection="column">
            <BlockTitle>{title}</BlockTitle>
            {disclaimer && <CaptionSmall>{disclaimer}</CaptionSmall>}
            {actions && <Actions>{actions}</Actions>}
          </Box>
          {topActions && <Actions>{topActions}</Actions>}
        </>
      ) : (
        <>
          <BlockTitle>{title}</BlockTitle>
          {disclaimer && <CaptionSmall>{disclaimer}</CaptionSmall>}
          {(actions || topActions) && (
            <Actions>
              {actions}
              {topActions}
            </Actions>
          )}
        </>
      )}
    </Box>
  );
};

export default PageContentBlockHeader;
