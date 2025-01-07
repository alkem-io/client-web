import UserPopUp from '@/domain/community/user/userPopUp/UserPopUp';
import { Box, Tooltip } from '@mui/material';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ImageFadeIn from './ImageFadeIn';

interface AvatarProps {
  src?: string;
  name?: string;
  userId: string;
}

/**
 * @deprecated
 * TODO Replace with MUI Avatar
 */
export const AlkemioAvatar = ({ src, name, userId }: AvatarProps) => {
  const { t } = useTranslation();
  const [isPopUpShown, setIsPopUpShown] = useState(false);
  const [hasFailedToLoad, setHasFailedToLoad] = useState(false);

  useEffect(() => {
    setHasFailedToLoad(false);
  }, [src]);

  const isEmpty = !src || hasFailedToLoad;

  const optionallyWrapInTooltip = (image: ReactNode) => {
    if (!name) return image;

    return (
      <Tooltip placement={'bottom'} id={'membersTooltip'} title={name}>
        <span>{image}</span>
      </Tooltip>
    );
  };

  return (
    <Box
      sx={{
        width: 40,
        height: 40,
        alignItems: 'center',
        placeContent: 'center',
        display: 'flex',
        bgcolor: 'neutralMedium.main',
        color: 'background.paper',
        borderRadius: 1,
        '&:hover': {
          cursor: 'pointer',
        },
      }}
      onClick={() => setIsPopUpShown(true)}
    >
      {isEmpty
        ? '?'
        : optionallyWrapInTooltip(
            <ImageFadeIn
              sx={{
                width: 40,
                height: 40,
                display: 'flex',
                borderRadius: 1,
              }}
              src={src}
              alt={t('common.avatar-of', { user: name })}
              onError={() => setHasFailedToLoad(true)}
            />
          )}

      {isPopUpShown && <UserPopUp id={userId} onHide={() => setIsPopUpShown(false)} />}
    </Box>
  );
};
