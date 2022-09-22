import React, { ComponentPropsWithRef, FC, useMemo } from 'react';
import { CardMediaProps, styled, SvgIconProps } from '@mui/material';
import Card from '@mui/material/Card';
import CardMedia from '@mui/material/CardMedia';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TagsComponent from '../../TagsComponent/TagsComponent';
import { ClampedTypography } from '../../ClampedTypography';

const MATCH_TERMS_HEIGHT = 50;
const NAME_HEIGHT = 60;

const MatchTermsBox = styled(CardActions)(({ theme }) => ({ width: theme.cards.search.width }));
const Label = styled(Typography)(({ theme }) => ({
  backgroundColor: theme.palette.primary.main,
  color: 'white',
  padding: 0,
  paddingLeft: theme.spacing(2),
  paddingRight: theme.spacing(2),
  borderTopLeftRadius: 20,
  borderBottomLeftRadius: 20,
  marginBottom: 1,
}));
const NameBox = styled(Box)(({ theme }) => ({
  width: theme.cards.search.width,
  height: NAME_HEIGHT,
  display: 'flex',
  paddingTop: theme.spacing(1),
  paddingLeft: theme.spacing(1),
}));

const getCalculatedCardBox = (height: number) =>
  styled(Card)(({ theme }) => ({ width: theme.cards.search.width, height }));

const getCalculatedCardImage = (mediaHeight: number) =>
  styled(props => <CardMedia {...props} />)<CardMediaProps & ComponentPropsWithRef<'img'>>(({ theme }) => ({
    width: theme.cards.search.width,
    height: mediaHeight,
    display: 'flex',
    // align end on the horizontal
    justifyContent: 'end',
    // align end on the vertical
    alignItems: 'end',
  }));

const getCalculatedCardContents = (cardHeight: number, mediaHeight: number) =>
  styled(CardContent)(({ theme }) => ({
    width: theme.cards.search.width,
    height: cardHeight - mediaHeight - NAME_HEIGHT - MATCH_TERMS_HEIGHT,
    padding: 0,
    paddingLeft: theme.spacing(1),
    paddingRight: theme.spacing(1),
  }));

export type SearchBaseCardImplProps = Omit<SearchBaseCardProps, 'height' | 'imgHeight'>;
interface SearchBaseCardProps {
  height: number;
  imgHeight: number;
  image: string | undefined;
  imgAlt?: string; // todo make required when alt text is available for visuals
  matchedTerms: string[];
  icon: React.ComponentType<SvgIconProps>,
  name: string;
  label?: string; // todo working var name
  url: string;
}

const SearchBaseCard: FC<SearchBaseCardProps> = ({ image, imgAlt, height, imgHeight, label, icon: Icon, name, matchedTerms, url, children }) => {
  const [CardBox, CardImage, CardContents] = useMemo(
    () => [
      getCalculatedCardBox(height),
      getCalculatedCardImage(imgHeight),
      getCalculatedCardContents(height, imgHeight)
    ],
    [imgHeight]
  );
  // todo image on NO img url
  // todo use url for clicks
  return (
    <CardBox>
      <CardImage image={image} alt={imgAlt}>
        <Label>
          {label}
        </Label>
      </CardImage>
      <NameBox>
        <Icon fontSize="medium" color="primary" sx={{ mr: theme => theme.spacing(0.5) }} />
        <ClampedTypography variant={'h5'} sx={{ color: 'primary.main' }} clamp={2}>
          {name}
        </ClampedTypography>
      </NameBox>
      <CardContents>
        {children}
      </CardContents>
      <MatchTermsBox>
        <TagsComponent tags={matchedTerms} count={2} />
      </MatchTermsBox>
    </CardBox>
  );
};
export default SearchBaseCard;
