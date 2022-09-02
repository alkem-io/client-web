import { Box, BoxProps } from '@mui/material';
import React, { FC } from 'react';
import Typography from '@mui/material/Typography';
import { fontWeight } from '../../../../common/components/core/Typography';
import TagLabel from '../../../../common/components/composite/common/TagLabel/TagLabel';

export interface LabelAndTitleComponentProps {
  headerText: string;
  labelText?: string;
  labelAboveTitle?: boolean;
  classes?: {
    label?: string;
  };
}

const LabelAndTitleContainer = (props: BoxProps) => (
  <Box display="flex" marginRight={theme => theme.spacing(-1.5)} {...props} />
);

const LabelAndTitle: FC<LabelAndTitleComponentProps> = ({ headerText, labelText, labelAboveTitle, classes }) => {
  const title = (
    <Typography
      color="primary"
      noWrap
      sx={{
        fontWeight: fontWeight.boldLight,
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {headerText}
    </Typography>
  );

  return labelAboveTitle ? (
    <LabelAndTitleContainer flexDirection="column">
      {labelText && (
        <TagLabel className={classes?.label} sx={{ alignSelf: 'end' }}>
          {labelText}
        </TagLabel>
      )}
      {title}
    </LabelAndTitleContainer>
  ) : (
    <LabelAndTitleContainer alignItems="center" justifyContent="space-between">
      {title}
      {labelText && <TagLabel className={classes?.label}>{labelText}</TagLabel>}
    </LabelAndTitleContainer>
  );
};

export default LabelAndTitle;
