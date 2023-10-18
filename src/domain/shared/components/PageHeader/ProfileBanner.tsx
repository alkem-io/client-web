import { Avatar, Box, Grid, Skeleton, styled, Typography } from '@mui/material';
import { FC, useState } from 'react';
import useAutomaticTooltip from '../../utils/useAutomaticTooltip';
import { DEFAULT_BANNER_URL } from './JourneyPageBanner';
import { Location } from '../../../../core/apollo/generated/graphql-schema';
import SocialLinks, { SocialLinkItem } from '../SocialLinks/SocialLinks';
import LocationView from '../../../common/location/LocationView';
import { formatLocation } from '../../../common/location/LocationUtils';
import { ContactDetail } from '../ContactDetails/ContactDetail';
import { useTranslation } from 'react-i18next';
import LocalPhoneIcon from '@mui/icons-material/LocalPhone';
import hexToRGBA from '../../../../core/utils/hexToRGBA';
import { DirectMessageDialog } from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import { CaptionSmall } from '../../../../core/ui/typography/components';
import PageContent from '../../../../core/ui/content/PageContent';
import { gutters } from '../../../../core/ui/grid/utils';

// This is a helper function to build a CSS rule with a background gradient + the background image
// The returned result will be something like: linear-gradient(90deg, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 100%), url('...'), #FFF
function gradientBuilder(
  angle: number,
  steps: { color: string; opacity: number; position: number }[],
  backgroundImageUrl: string,
  failsafeBackgroundColor: string
) {
  return (
    `linear-gradient(${angle}deg, ` +
    steps.map(step => hexToRGBA(step.color, step.opacity) + ` ${step.position}%`).join(', ') +
    `), url('${backgroundImageUrl}'), ` +
    `${failsafeBackgroundColor}`
  );
}

// Styled Blocks:
const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.neutralLight.main,
  position: 'relative',
  background: gradientBuilder(
    90,
    [
      { color: theme.palette.neutralLight.main, opacity: 1, position: 0 },
      { color: theme.palette.neutralLight.main, opacity: 0.9, position: 50 },
      { color: theme.palette.neutralLight.main, opacity: 0, position: 100 },
    ],
    DEFAULT_BANNER_URL,
    theme.palette.neutralLight.main
  ),
  backgroundSize: 'cover',
  backgroundPosition: 'center',
}));

const ProfileInfo = styled(Box)(({ theme }) => ({
  '& svg': {
    marginRight: theme.spacing(0.5),
  },
}));

const ProfileInfoWrapper = styled(Box)(({ theme }) => ({
  marginTop: gutters(2)(theme),
  flexGrow: 1,
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
  position: 'relative',
  margin: theme.spacing(2, 2, 1, 2),
  height: theme.spacing(20),
  width: theme.spacing(20),
}));

const Title = styled('div')(({ theme }) => ({
  '& > h1': {
    fontSize: '1.7rem',
    fontWeight: 'bold',
    lineHeight: '2.5rem',
    [theme.breakpoints.down('md')]: {
      fontSize: '1.2rem',
    },
    display: 'inline',
    whiteSpace: 'nowrap',
  },
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  maxWidth: theme.spacing(110),
  [theme.breakpoints.only('xs')]: {
    maxWidth: theme.spacing(32),
  },
  [theme.breakpoints.only('sm')]: {
    maxWidth: theme.spacing(45),
  },
  [theme.breakpoints.only('md')]: {
    maxWidth: theme.spacing(60),
  },
  [theme.breakpoints.only('lg')]: {
    maxWidth: theme.spacing(80),
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
  avatarAltText?: string;
  avatarEditable?: boolean; // TODO: This will be used in the future to put a button over the avatar to upload a new image if the user has permissions
  loading: boolean;
  onSendMessage: (text: string) => Promise<void>;
  isContactable?: boolean;
}

/**
 * @deprecated - use ProfilePageBanner
 * TODO remove this one
 * This is the common top banner for Users/Organizations or new things with a Profile.
 * For Spaces/Challenges/Opportunities and anything else see PageBanner
 */
const ProfileBanner: FC<ProfileBannerProps> = ({
  title,
  tagline,
  location,
  phone,
  socialLinks,
  avatarUrl,
  avatarAltText,
  loading: dataLoading = false,
  onSendMessage,
  isContactable = true,
}) => {
  const { t } = useTranslation();

  const { containerReference, addAutomaticTooltip } = useAutomaticTooltip();

  const [imageLoading, setImageLoading] = useState(true);
  const [isMessageUserDialogOpen, setIsMessageUserDialogOpen] = useState(false);

  const closeMessageUserDialog = () => setIsMessageUserDialogOpen(false);
  const openMessageUserDialog = () => setIsMessageUserDialogOpen(true);

  const imageLoadError = () => {
    setImageLoading(false);
  };

  // Since there's only 1 receiver, and it's used just for the Dialog, it's ok to have id=''
  const messageReceivers = [
    { id: '', displayName: title, avatarUri: avatarUrl, city: location?.city, country: location?.country },
  ];

  return (
    <Root ref={containerReference}>
      {!dataLoading && (
        <Grid container spacing={1} sx={{ height: '100%', alignItems: 'center' }}>
          <PageContent background="transparent">
            <Grid item sx={{ aspectRatio: '1/1', height: '100%' }}>
              <ImageWrapper>
                {imageLoading && (
                  <Skeleton
                    variant="rectangular"
                    animation="wave"
                    sx={{ height: '100%', width: '100%', position: 'absolute' }}
                  />
                )}
                <Image
                  src={avatarUrl}
                  alt={avatarAltText}
                  onLoad={() => setImageLoading(false)}
                  onError={imageLoadError}
                >
                  {title ? title[0] : ''}
                </Image>
              </ImageWrapper>
            </Grid>
            <ProfileInfoWrapper>
              <ProfileInfo>
                <Title>
                  <Typography variant={'h1'} ref={element => addAutomaticTooltip(element)}>
                    {title}
                  </Typography>
                </Title>
                {tagline && <CaptionSmall sx={{ maxWidth: '50%' }}>{tagline}</CaptionSmall>}
                <LocationView location={formatLocation(location)} mode="icon" iconSize={'small'} />
                <ContactDetail
                  icon={<LocalPhoneIcon color="primary" fontSize="small" />}
                  title={t('components.profile.fields.telephone.title')}
                  value={phone}
                />
                <Box>
                  <SocialLinks
                    items={socialLinks}
                    iconSize="medium"
                    isContactable={isContactable}
                    onContact={openMessageUserDialog}
                  />
                </Box>
              </ProfileInfo>
            </ProfileInfoWrapper>
          </PageContent>

          <DirectMessageDialog
            title={t('send-message-dialog.direct-message-title')}
            open={isMessageUserDialogOpen}
            onClose={closeMessageUserDialog}
            onSendMessage={onSendMessage}
            messageReceivers={messageReceivers}
          />
        </Grid>
      )}
      {dataLoading && <Skeleton variant="rectangular" width="100%" height="100%" />}
    </Root>
  );
};

export default ProfileBanner;
