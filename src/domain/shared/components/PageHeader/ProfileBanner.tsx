import { Avatar, Box, Grid, Skeleton, styled, Typography } from '@mui/material';
import { FC, useState } from 'react';
import useAutomaticTooltip from '../../utils/useAutomaticTooltip';
import { BANNER_ASPECT_RATIO } from './PageBanner';
import { Location } from '../../../../models/graphql-schema';
import SocialLinks, { SocialLinkItem } from '../SocialLinks/SocialLinks';
import LocationView from '../../../location/LocationView';
import { formatLocation } from '../../../location/LocationUtils';
import { ContactDetail } from '../ContactDetails/ContactDetails';
import { useTranslation } from 'react-i18next';

const Root = styled(Box)(({ theme }) => ({
  aspectRatio: BANNER_ASPECT_RATIO,
  backgroundColor: theme.palette.neutralLight.main,
  position: 'relative',
}));

const Title = styled(Box)(() => ({
  '& h1': {
    fontSize: '1.7rem',
    fontWeight: 'bold',
    lineHeight: '2rem',
  },
}));

const ImageWrapper = styled('div')(({ theme }) => ({
  [theme.breakpoints.only('xs')]: {
    height: theme.spacing(12),
    width: theme.spacing(12),
    margin: theme.spacing(1),
  },
  [theme.breakpoints.only('sm')]: {
    height: theme.spacing(13),
    width: theme.spacing(13),
  },
  [theme.breakpoints.only('md')]: {
    height: theme.spacing(18),
    width: theme.spacing(18),
  },
  [theme.breakpoints.only('lg')]: {
    height: theme.spacing(15),
    width: theme.spacing(15),
  },
  [theme.breakpoints.only('xl')]: {
    height: theme.spacing(20),
    width: theme.spacing(20),
  },
  position: 'relative',
  margin: theme.spacing(2, 2, 1, 2),
}));

const Ellipser = styled('div')(() => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  '& > *': {
    display: 'inline',
    whiteSpace: 'nowrap',
  },
}));

const Image = styled(Avatar)(() => ({
  width: '100%',
  height: '100%',
}));

export interface ProfileBannerProps {
  title: string | undefined;
  tagline?: string;
  location?: Location;
  phone?: string;
  socialLinks?: SocialLinkItem[];
  avatarUrl?: string;
  avatarEditable?: boolean; // TODO: This will be used in the future to put a button over the avatar to upload a new image if the user has permissions
  loading: boolean;
}

/**
 * This is the common top banner for Users/Organizations or new things with a Profile.
 * For Hubs/Challenges/Opportunities and anything else see PageBanner
 */
const ProfileBanner: FC<ProfileBannerProps> = ({
  title,
  location,
  phone,
  socialLinks,
  avatarUrl,
  loading: dataLoading = false,
}) => {
  const { t } = useTranslation();

  const { containerReference, addAutomaticTooltip } = useAutomaticTooltip();

  const [imageLoading, setImageLoading] = useState(true);

  const imageLoadError = () => {
    setImageLoading(false);
  };

  return (
    <Root ref={containerReference}>
      {!dataLoading && (
        <Grid container spacing={1} sx={{ height: '100%' }}>
          <Grid item sx={{ aspectRatio: '1/1', height: '100%' }}>
            <ImageWrapper>
              {imageLoading && (
                <Skeleton
                  variant="rectangular"
                  animation="wave"
                  sx={{ height: '100%', width: '100%', position: 'absolute' }}
                />
              )}
              <Image src={avatarUrl} onLoad={() => setImageLoading(false)} onError={imageLoadError}>
                {title ? title[0] : ''}
              </Image>
            </ImageWrapper>
          </Grid>
          <Grid item sx={{ marginY: 'auto' }}>
            <Title>
              <Ellipser>
                <Typography variant={'h1'} ref={element => addAutomaticTooltip(element)}>
                  {title}
                </Typography>
              </Ellipser>

              <LocationView location={formatLocation(location)} />
              <ContactDetail title={t('components.profile.fields.telephone.title')} value={phone} />
              <SocialLinks title="Contact" items={socialLinks} iconSize="medium" />
            </Title>
          </Grid>
        </Grid>
      )}
      {dataLoading && <Skeleton variant="rectangular" width="100%" height="100%" />}
    </Root>
  );
};

export default ProfileBanner;
