import { Context } from '@apollo/client';
import { Grid } from '@mui/material';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { makeStyles } from '@mui/styles';
import { ReactComponent as CompassIcon } from 'bootstrap-icons/icons/compass.svg';
import { ReactComponent as FileEarmarkIcon } from 'bootstrap-icons/icons/file-earmark.svg';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { SettingsButton } from '../../components/composite';
import ActivityCard from '../../components/composite/common/ActivityPanel/ActivityCard';
import ApplicationButton from '../../components/composite/common/ApplicationButton/ApplicationButton';
import AuthenticationBackdrop from '../../components/composite/common/Backdrops/AuthenticationBackdrop';
import MembershipBackdrop from '../../components/composite/common/Backdrops/MembershipBackdrop';
import { SwitchCardComponent } from '../../components/composite/entities/Ecoverse/Cards';
import ChallengeCard from '../../components/composite/entities/Ecoverse/ChallengeCard';
import EcoverseCommunitySection from '../../components/composite/entities/Ecoverse/EcoverseCommunitySection';
import { Loading } from '../../components/core';
import Button from '../../components/core/Button';
import CardFilter from '../../components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../components/core/card-filter/value-getters/entity-value-getter';
import { CardContainer } from '../../components/core/CardContainer';
import Divider from '../../components/core/Divider';
import ErrorBlock from '../../components/core/ErrorBlock';
import Icon from '../../components/core/Icon';
import { Image } from '../../components/core/Image';
import Markdown from '../../components/core/Markdown';
import Section, { Body, Header as SectionHeader, SubHeader } from '../../components/core/Section';
import ApplicationButtonContainer from '../../containers/application/ApplicationButtonContainer';
import EcoverseChallengesContainer from '../../containers/ecoverse/EcoverseChallengesContainer';
import { EcoverseContainerEntities, EcoverseContainerState } from '../../containers/ecoverse/EcoversePageContainer';
import { DiscussionsProvider } from '../../context/Discussions/DiscussionsProvider';
import { useUserContext } from '../../hooks';
import { buildAdminEcoverseUrl, buildChallengeUrl } from '../../utils/urlBuilders';

const useStyles = makeStyles(theme => ({
  buttonsWrapper: {
    display: 'flex',
    gap: theme.spacing(1),
  },
  ecoverseBannerImg: {
    maxWidth: 320,
    height: 'initial',
    margin: '0 auto',
  },
}));

interface EcoverseDashboardViewProps {
  entities: EcoverseContainerEntities;
  state: EcoverseContainerState;
}

export const EcoverseDashboardView: FC<EcoverseDashboardViewProps> = ({ entities }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const styles = useStyles();
  const { ecoverse, permissions, activity, projects, isAuthenticated, hideChallenges } = entities;
  const { displayName: name = '', nameID: ecoverseNameId = '', id: ecoverseId = '', context } = ecoverse || {};
  const ecoverseBanner = ecoverse?.context?.visual?.banner;
  const { tagline = '', impact = '', vision = '', background = '', references = [] } = context || ({} as Context);
  const learnMore = references?.find(x => x.name === 'website');

  return (
    <>
      <Grid container spacing={3}></Grid>
    </>
  );
};
export default EcoverseDashboardView;
