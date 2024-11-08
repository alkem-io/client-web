import { useMemo, useState } from 'react';

import { useTheme } from '@mui/material';
import { Theme, useMediaQuery } from '@mui/material';

import { useColumns } from '../../../../../core/ui/grid/GridContext';
import { useDashboardWithMembershipsQuery } from '../../../../../core/apollo/generated/apollo-hooks';
import { RECENT_JOURNEY_CARD_ASPECT_RATIO } from '../../../../../domain/journey/common/JourneyTile/JourneyTile';

export const useDashboardSpaces = () => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedSpaceName, setSelectedSpaceName] = useState('');
  const [selectedSpaceIdx, setSelectedSpaceIdx] = useState<number | null>(null);

  const { data, loading } = useDashboardWithMembershipsQuery({ fetchPolicy: 'network-only' });

  const theme = useTheme();

  const columns = useColumns();

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const cardColumns = useMemo(() => (isMobile ? columns / 2 : columns / 4), [isMobile, columns]);

  const handleDialogOpen = (idx: number, displayName: string) => () => {
    setSelectedSpaceIdx(idx);
    setSelectedSpaceName(displayName);
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => setIsDialogOpen(false);

  return {
    data,
    loading,
    cardColumns,
    isDialogOpen,
    selectedSpaceIdx,
    selectedSpaceName,
    styles: {
      loader: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

        width: '100%',
        height: '100%',
      },

      spacesContainer: {
        padding: 16,
      },

      spaceCard: {
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
      },

      spaceCardMedia: {
        width: '100vw', // Keep this in order to span the image across the card.
        height: '180px',
        maxWidth: '100%', //  Keep this in order to prevent the image from stretching.
      },

      titleAndDescContainer: {
        borderBottomLeftRadius: 16,
        borderBottomRightRadius: 16,
        backgroundColor: theme.palette.primary.main,
      },

      spaceTitle: {
        paddingBlock: 8,
        color: theme.palette.background.paper,
      },

      spaceTagline: {
        paddingBottom: 0.5,
        color: theme.palette.background.paper,
      },

      subSpacesContainer: {
        marginTop: 1.5,
      },

      exploreAllButton: {
        textTransform: 'none',
        border: `1px solid ${theme.palette.divider}`,
        aspectRatio: RECENT_JOURNEY_CARD_ASPECT_RATIO,
      },
    },
    visibleSpaces: Math.max(1, Math.floor(columns / 2) - 1),

    handleDialogOpen,
    handleDialogClose,
  };
};
