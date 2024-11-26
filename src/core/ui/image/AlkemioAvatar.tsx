import clsx from 'clsx';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
import { makeStyles } from '@mui/styles';
import ImageFadeIn from './ImageFadeIn';
import WrapperTypography from '../typography/deprecated/WrapperTypography';
import { Theme, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';

type AvatarSizeName = 'md' | 'sm' | 'lg' | 'xl' | 'md2';

const AvatarSizes: Record<AvatarSizeName, number> = {
  md: 40,
  sm: 15,
  md2: 64,
  lg: 80,
  xl: 160,
};

const avatarSizeCSSRules = ['md', 'sm', 'lg', 'xl', 'md2'].reduce(
  (rules, size) => ({
    ...rules,
    [`&.${size}`]: {
      width: AvatarSizes[size],
      height: AvatarSizes[size],
    },
  }),
  {} as Record<string, { width: number; height: number }>
);

export const useAvatarStyles = makeStyles<Theme, ClassProps>(theme => ({
  avatarWrapper: {
    display: 'flex',
    alignItems: 'center',
    placeContent: 'center',
    ...avatarSizeCSSRules,
  },
  clickable: {
    '&:hover': {
      cursor: 'pointer',
    },
  },
  avatar: {
    display: 'flex',
    borderRadius: theme.shape.borderRadius,
    ...avatarSizeCSSRules,
  },
  noAvatar: {
    display: 'flex',
    borderRadius: theme.shape.borderRadius,
    ...avatarSizeCSSRules,
  },
  dark: {
    background: props => props.background ?? theme.palette.neutralMedium.main,
    color: theme.palette.background.paper,
    alignItems: 'center',
    placeContent: 'center',
  },
  light: {
    background: props => props.background ?? theme.palette.background.paper,
    color: theme.palette.neutralMedium.main,
    alignItems: 'center',
    placeContent: 'center',
  },
}));

type ClassProps = {
  background?: string;
};

type AvatarPopupProps = {
  open: boolean;
  onHide: () => void;
};

export interface AvatarProps {
  src?: string;
  className?: string;
  classes?: ClassProps;
  size?: AvatarSizeName;
  theme?: 'light' | 'dark';
  name?: string;
  renderPopup?: (props: AvatarPopupProps) => ReactNode;
}

/**
 * @deprecated
 * TODO Replace with MUI Avatar
 */
const AlkemioAvatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ size = 'md', classes = {}, className, src, theme = 'dark', name, renderPopup }, ref) => {
    const { t } = useTranslation();
    const [isPopUpShown, setIsPopUpShown] = useState<boolean>(false);

    const styles = useAvatarStyles(classes);
    const [hasFailedToLoad, setHasFailedToLoad] = useState(false);

    useEffect(() => {
      setHasFailedToLoad(false);
    }, [src]);

    const isEmpty = !src || hasFailedToLoad;

    const optionallyWrapInTooltip = (image: ReactNode) => {
      if (!name) {
        return image;
      }

      return (
        <Tooltip placement={'bottom'} id={'membersTooltip'} title={name}>
          <span>{image}</span>
        </Tooltip>
      );
    };

    return (
      <div
        ref={ref}
        className={clsx(styles.avatarWrapper, renderPopup && styles.clickable, size, className)}
        onClick={() => renderPopup && setIsPopUpShown(true)}
      >
        {isEmpty && (
          <div className={clsx(styles.noAvatar, styles[theme], size, className)}>
            <WrapperTypography variant="button" color="inherit">
              ?
            </WrapperTypography>
          </div>
        )}
        {!isEmpty &&
          optionallyWrapInTooltip(
            <ImageFadeIn
              className={clsx(styles.avatar, size, className)}
              src={src}
              alt={t('common.avatar-of', { user: name })}
              onError={() => setHasFailedToLoad(true)}
            />
          )}
        {renderPopup?.({ open: isPopUpShown, onHide: () => setIsPopUpShown(false) })}
      </div>
    );
  }
);

export default AlkemioAvatar;
