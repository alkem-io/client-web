import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, Button, Box, DialogProps } from '@mui/material';
import { Trans, useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { Caption, Text } from '@/core/ui/typography';
import { Actions } from '@/core/ui/actions/Actions';
import { gutters } from '@/core/ui/grid/utils';
import { UrlType } from '../apollo/generated/graphql-schema';
import { useSpaceCardQuery } from '../apollo/generated/apollo-hooks';
import SpaceCardHorizontal, { SpaceCardHorizontalSkeleton } from '@/domain/space/components/cards/SpaceCardHorizontal';
import LockOutlineIcon from '@mui/icons-material/LockOutline';
import useNavigate from '../routing/useNavigate';

const REDIRECT_COUNTDOWN_SECONDS = 10;

interface ClosestAncestor {
  url: string;
  type: UrlType;
  space?: {
    id: string;
  };
}

interface RedirectToAncestorDialogProps {
  closestAncestor: ClosestAncestor;
}

const RedirectToAncestorDialogContent = ({
  open,
  onClose,
  closestAncestor,
}: RedirectToAncestorDialogProps & DialogProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [secondsLeft, setSecondsLeft] = useState(REDIRECT_COUNTDOWN_SECONDS);

  const { data: spaceData, loading: loadingSpace } = useSpaceCardQuery({
    variables: { spaceId: closestAncestor.space?.id! },
    skip: closestAncestor.type !== UrlType.Space || !closestAncestor.space?.id,
  });

  useEffect(() => {
    if (!open) return;

    const timer = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate(closestAncestor.url);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [open, closestAncestor]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogHeader icon={<LockOutlineIcon />}>{t('components.urlResolver.redirectDialog.title')}</DialogHeader>
      <DialogContent>
        <Box display="flex" flexDirection="column" gap={2}>
          <Text>
            <Trans
              i18nKey="components.urlResolver.redirectDialog.message"
              components={{
                br: <br />,
              }}
            />
          </Text>
          {closestAncestor.type === UrlType.Space && closestAncestor.space?.id && (
            <>
              {spaceData?.lookup.space && !loadingSpace && (
                <SpaceCardHorizontal space={spaceData?.lookup.space} deepness={0} seamless sx={{ paddingLeft: 0 }} />
              )}
              {(!spaceData?.lookup.space || loadingSpace) && <SpaceCardHorizontalSkeleton />}
            </>
          )}
        </Box>
      </DialogContent>
      <Actions padding={gutters()} sx={{ justifyContent: 'flex-end' }}>
        <Caption>{t('components.urlResolver.redirectDialog.countdown', { seconds: secondsLeft })}</Caption>
        {onClose && (
          <Button variant="text" onClick={event => onClose(event, 'escapeKeyDown')}>
            {t('buttons.cancel')}
          </Button>
        )}
        <Button variant="contained" onClick={() => navigate(closestAncestor.url)}>
          {t('components.urlResolver.redirectDialog.goNow')}
        </Button>
      </Actions>
    </Dialog>
  );
};

/**
 * Wraps the real dialog to be able to close it from here
 */
export const RedirectToAncestorDialog = ({ closestAncestor }: RedirectToAncestorDialogProps) => {
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    setCancelled(false);
  }, [closestAncestor.url]);

  return (
    <RedirectToAncestorDialogContent
      open={!cancelled}
      onClose={() => setCancelled(true)}
      closestAncestor={closestAncestor}
    />
  );
};
