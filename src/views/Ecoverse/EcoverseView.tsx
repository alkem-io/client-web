import React, { FC } from 'react';
import { EcoverseContainerEntities } from '../../containers/ecoverse/EcoversePageContainer';

// const useStyles = createStyles(theme => ({
//   buttonsWrapper: {
//     display: 'flex',
//     gap: theme.spacing(1),
//   },
//   ecoverseBannerImg: {
//     maxWidth: 320,
//     height: 'initial',
//     margin: '0 auto',
//   },
// }));

interface EcoverseViewProps {
  entities: EcoverseContainerEntities;
}

export const EcoverseView: FC<EcoverseViewProps> = () => {
  return (
    <>
      {/* <Section
        avatar={
          ecoverseBanner ? (
            <Image src={ecoverseBanner} alt={`${name} logo`} className={styles.ecoverseBannerImg} />
          ) : (
            <div />
          )
        }
        details={
          <ActivityCard
            title={t('pages.activity.title', { blockName: t('pages.ecoverse.title') })}
            items={activitySummary}
          />
        }
      >
        <SectionHeader
          text={name}
          editComponent={
            permissions.edit && (
              <SettingsButton
                color={'primary'}
                to={buildAdminEcoverseUrl(ecoverseNameId)}
                tooltip={t('pages.ecoverse.sections.header.buttons.settings.tooltip')}
              />
            )
          }
        />

        <SubHeader text={tagline} />
        <Body>
          <Markdown children={vision} />
          <div className={styles.buttonsWrapper}>
            {more && <Button text={t('buttons.learn-more')} as={'a'} href={`${more.uri}`} target="_blank" />}
            <ApplicationButton
              isAuthenticated={isAuthenticated}
              isMember={user?.ofEcoverse(ecoverseId)}
              applyUrl={`${url}/apply`}
              applicationState={userApplication?.state}
            />
          </div>
        </Body>
      </Section>
      <Divider />
      <MembershipBackdrop
        show={!user?.ofEcoverse(ecoverseId) || false}
        blockName={t('pages.ecoverse.sections.challenges.header')}
      >
        <Section avatar={<Icon component={CompassIcon} color="primary" size="xl" />}>
          <SectionHeader text={t('pages.ecoverse.sections.challenges.header')} />
          <SubHeader>
            <Markdown children={background} />
          </SubHeader>
          <Body>
            <Markdown children={impact} />
          </Body>
        </Section>
        {isChallengeLoading && (
          <Loading
            text={t('components.loading.message', { blockName: t('pages.ecoverse.sections.challenges.header') })}
          />
        )}
        {challengesError ? (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <ErrorBlock blockName={t('pages.ecoverse.sections.challenges.header')} />
            </Grid>
          </Grid>
        ) : (
          <CardFilter data={challenges} tagsValueGetter={entityTagsValueGetter} valueGetter={entityValueGetter}>
            {filteredData => (
              <CardContainer>
                {filteredData.map((challenge, i) => (
                  <ChallengeCard
                    key={i}
                    id={challenge.id}
                    displayName={challenge.displayName}
                    activity={challenge?.activity || []}
                    context={{
                      tagline: challenge?.context?.tagline || '',
                      visual: { background: challenge?.context?.visual?.background || '' },
                    }}
                    isMember={user?.ofChallenge(challenge.id) || false}
                    tags={challenge?.tagset?.tags || []}
                    url={`${url}/challenges/${challenge.nameID}`}
                  />
                ))}
              </CardContainer>
            )}
          </CardFilter>
        )}
      </MembershipBackdrop>

      <Divider />
      <AuthenticationBackdrop blockName={t('pages.ecoverse.sections.community.header')} show={!isAuthenticated}>
        <EcoverseCommunitySection
          title={t('pages.ecoverse.sections.community.header')}
          subTitle={t('pages.ecoverse.sections.community.subheader')}
          body={context?.who}
          shuffle={true}
        />
      </AuthenticationBackdrop>
      <Divider />
      <AuthenticationBackdrop blockName={t('pages.ecoverse.sections.projects.header')} show={!isAuthenticated}>
        {ecoverseProjects.length > 0 && (
          <>
            <Section avatar={<Icon component={FileEarmarkIcon} color="primary" size="xl" />}>
              <SectionHeader text={t('pages.ecoverse.sections.projects.header')} tagText={'Work in progress'} />
              <SubHeader text={t('pages.ecoverse.sections.projects.subheader', { ecoverse: name })} />
            </Section>
            {isAuthenticated && (
              <CardContainer cardHeight={380} xs={12} md={6} lg={4} xl={3}>
                {ecoverseProjects.map(({ type, ...rest }, i) => {
                  const Component = SwitchCardComponent({ type });
                  return <Component {...rest} key={i} />;
                })}
              </CardContainer>
            )}
            <Divider />
          </>
        )}
      </AuthenticationBackdrop> */}
    </>
  );
};
export default EcoverseView;
