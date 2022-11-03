import React, { FC } from 'react';
import { Box, Typography, IconButton } from '@mui/material';
import ForumOutlinedIcon from '@mui/icons-material/ForumOutlined';
import BallotOutlinedIcon from '@mui/icons-material/BallotOutlined';
import ModeOutlinedIcon from '@mui/icons-material/ModeOutlined';
import { useTranslation } from 'react-i18next';
import { useField } from 'formik';
import { CalloutType } from '../../../../../models/graphql-schema';
import { makeStyles } from '@mui/styles';
import clsx from 'clsx';

const iconButtonSides = 105;

// const MarqueeItems = styled(
//   // eslint-disable-next-line @typescript-eslint/no-unused-vars
//   ({ animate, ...rest }: { animate: boolean } & BoxProps) => <Box {...rest} />
// )(
//   ({ theme, animate }) =>
//     css`
//       animation: ${animate ? 'marquee 10s linear infinite' : 'none'};
//       margin-bottom: ${theme.spacing(2)};
//     `
// );
// <MarqueeItems animate={isMobile} />;

// interface StyledButtonProps {
//   selected?: boolean;
// }
// const StyledButton = styled(IconButton)(() => ({
//   width: iconButtonSides,
//   height: iconButtonSides,
//   border: '1px solid #B3B3B3',
//   borderRadius: 5,
// }));

const useStyles = makeStyles(theme => ({
  buttonStyles: {
    width: iconButtonSides,
    height: iconButtonSides,
    border: '1px solid #B3B3B3',
    borderRadius: 5,
  },
  selectedButton: {
    background: theme.palette.primary.main,
    '&:hover': {
      background: theme.palette.primary.main,
    },
  },
  iconStyles: {
    color: theme.palette.primary.main,
    fontSize: 60,
  },
  selectedIcon: {
    color: theme.palette.background.default,
  },
  textStyles: {
    color: theme.palette.primary.main,
    align: 'center',
  },
  selectedText: {
    color: theme.palette.background.default,
  },
  boxStyles: {
    display: 'flex',
    flexDirection: 'column',
    alignContent: 'center',
  },
  selected: {
    backgroundColor: theme.palette.background.default,
  },
  buttonEditMode: {
    pointerEvents: 'none',
  },
}));

interface CalloutTypeSelectProps {
  name: string;
  disabled?: boolean;
}

export const CalloutTypeSelect: FC<CalloutTypeSelectProps> = ({ name, disabled = false }) => {
  const [field, , helpers] = useField(name);
  const { t } = useTranslation();
  const styles = useStyles();

  const handleButtonClick = (value: CalloutType) => !disabled && helpers.setValue(value);

  return (
    <>
      {/* TODO: Add this color to pallete to match Formik labels */}
      <Typography sx={{ color: '#00000099' }}>{t('components.callout-creation.callout-type-label')}</Typography>
      <Box p={1} />
      <Box display="flex" gap={2}>
        <IconButton
          className={clsx(
            styles.buttonStyles,
            field.value === CalloutType.Comments && styles.selectedButton,
            disabled && styles.buttonEditMode
          )}
          aria-label="comments"
          onClick={() => handleButtonClick(CalloutType.Comments)}
        >
          <Box className={clsx(styles.boxStyles)}>
            <ForumOutlinedIcon
              className={clsx(styles.iconStyles, field.value === CalloutType.Comments && styles.selectedIcon)}
            />
            <Typography
              className={clsx(styles.textStyles, field.value === CalloutType.Comments && styles.selectedText)}
            >
              {t('common.discussion')}
            </Typography>
          </Box>
        </IconButton>
        <IconButton
          className={clsx(
            styles.buttonStyles,
            field.value === CalloutType.Card && styles.selectedButton,
            disabled && styles.buttonEditMode
          )}
          aria-label="card"
          onClick={() => handleButtonClick(CalloutType.Card)}
        >
          <Box className={clsx(styles.boxStyles)}>
            <BallotOutlinedIcon
              className={clsx(styles.iconStyles, field.value === CalloutType.Card && styles.selectedIcon)}
            />
            <Typography className={clsx(styles.textStyles, field.value === CalloutType.Card && styles.selectedText)}>
              {t('common.cards')}
            </Typography>
          </Box>
        </IconButton>
        <IconButton
          className={clsx(
            styles.buttonStyles,
            field.value === CalloutType.Canvas && styles.selectedButton,
            disabled && styles.buttonEditMode
          )}
          aria-label="canvas"
          onClick={() => handleButtonClick(CalloutType.Canvas)}
        >
          <Box className={clsx(styles.boxStyles)}>
            <ModeOutlinedIcon
              className={clsx(styles.iconStyles, field.value === CalloutType.Canvas && styles.selectedIcon)}
            />
            <Typography className={clsx(styles.textStyles, field.value === CalloutType.Canvas && styles.selectedText)}>
              {t('common.canvases')}
            </Typography>
          </Box>
        </IconButton>
      </Box>
    </>
  );
};

export default CalloutTypeSelect;
