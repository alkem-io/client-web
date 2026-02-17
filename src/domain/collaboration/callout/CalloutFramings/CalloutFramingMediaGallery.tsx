import { useState } from 'react';
import { Box, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import AddIcon from '@mui/icons-material/Add';
import MediaGallery from '@/core/ui/gallery/MediaGallery';
import { MediaGalleryItem } from '@/core/ui/gallery/types';
import { CalloutDetailsModel } from '../models/CalloutDetailsModel';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import ImagePlaceholder from '@/core/ui/image/ImagePlaceholder';
import EditCalloutDialog from '../CalloutDialogs/EditCalloutDialog';
import { CalloutRestrictions } from '@/domain/collaboration/callout/CalloutRestrictionsTypes';

interface CalloutFramingMediaGalleryProps {
  callout: CalloutDetailsModel;
  canEdit?: boolean;
  calloutRestrictions?: CalloutRestrictions;
}

/**
 * Converts callout media gallery visuals to MediaGalleryItem format
 */
const convertVisualsToMediaItems = (callout: CalloutDetailsModel): MediaGalleryItem[] => {
  const visuals = callout.framing.mediaGallery?.visuals;

  if (!visuals) {
    return [];
  }

  return [...visuals]
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
    .map(visual => ({
      id: visual.id,
      type: 'image', // TODO: Handle video type if available in Visual
      url: visual.uri,
      title: visual.name,
      alt: visual.alternativeText || visual.name,
    }));
};

const CalloutFramingMediaGallery = ({
  callout,
  canEdit = false,
  calloutRestrictions,
}: CalloutFramingMediaGalleryProps) => {
  const { t } = useTranslation();
  const mediaItems = convertVisualsToMediaItems(callout);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  if (mediaItems.length === 0 && !canEdit) {
    return null;
  }

  const addButton = canEdit ? (
    <Tooltip title={t('buttons.uploadMedia')} arrow>
      <IconButton aria-label={t('buttons.uploadMedia')} size="small" onClick={() => setEditDialogOpen(true)}>
        <RoundedIcon component={AddIcon} size="medium" iconSize="small" />
      </IconButton>
    </Tooltip>
  ) : undefined;

  return (
    <>
      {mediaItems.length === 0 && canEdit ? (
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            aspectRatio: '16 / 5',
            backgroundColor: theme => theme.palette.grey[100],
            borderRadius: 0.5,
            cursor: 'pointer',
          }}
          onClick={() => setEditDialogOpen(true)}
        >
          <ImagePlaceholder text={t('callout.create.framingSettings.mediaGallery.emptyGallery')} />
        </Box>
      ) : (
        <MediaGallery title={callout.framing.profile.displayName} items={mediaItems} actions={addButton} />
      )}
      <EditCalloutDialog
        open={editDialogOpen}
        calloutRestrictions={calloutRestrictions}
        onClose={() => setEditDialogOpen(false)}
        calloutId={callout.id}
      />
    </>
  );
};

export default CalloutFramingMediaGallery;
