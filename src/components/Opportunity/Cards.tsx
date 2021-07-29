import { ReactComponent as CupStrawIcon } from 'bootstrap-icons/icons/cup-straw.svg';
import { ReactComponent as InfoSquareIcon } from 'bootstrap-icons/icons/info-square.svg';
import { ReactComponent as MinecartLoadedIcon } from 'bootstrap-icons/icons/minecart-loaded.svg';
import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';
import { ReactComponent as PlusIcon } from 'bootstrap-icons/icons/plus.svg';
import { ReactComponent as Delete } from 'bootstrap-icons/icons/trash.svg';
import React, { FC, useState } from 'react';
import { Theme } from '../../context/ThemeProvider';
import {
  refetchOpportunityActorGroupsQuery,
  refetchOpportunityAspectsQuery,
  refetchOpportunityRelationsQuery,
  useDeleteActorMutation,
  useDeleteAspectMutation,
  useDeleteRelationMutation,
} from '../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../hooks';
import { useEcoverse } from '../../hooks';
import { createStyles } from '../../hooks/useTheme';
import { useUserContext } from '../../hooks';
import { AuthorizationCredential } from '../../models/graphql-schema';
import { replaceAll } from '../../utils/replaceAll';
import Card from '../core/Card';
import Icon from '../core/Icon';
import RemoveModal from '../core/RemoveModal';
import Typography from '../core/Typography';
import { Spacer } from '../core/Spacer';
import ActorEdit from './ActorEdit';
import AspectEdit from './AspectEdit';
import hexToRGBA from '../../utils/hexToRGBA';

const useCardStyles = createStyles(theme => ({
  item: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: theme.shape.spacing(2),
  },
  description: {
    flexGrow: 1,
    display: 'flex',
    minWidth: 0,

    '& > span': {
      textOverflow: 'ellipsis',
      whiteSpace: 'nowrap',
      overflow: 'hidden',
    },
  },
  border: {
    border: `1px solid ${theme.palette.neutralMedium}`,
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  relative: {
    position: 'relative',
  },
}));

interface RelationCardProps {
  actorName: string;
  actorRole?: string;
  actorType?: string;
  description?: string;
  type: string;
  id: string;
  opportunityId: string;
}

export const RelationCard: FC<RelationCardProps> = ({ actorName, actorRole, description, type, id, opportunityId }) => {
  const { ecoverseId } = useEcoverse();
  const styles = useCardStyles();
  const handleError = useApolloErrorHandler();
  const [showRemove, setShowRemove] = useState<boolean>(false);
  const { user } = useUserContext();
  const isAdmin =
    user?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
    user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity);

  const [removeRelation] = useDeleteRelationMutation({
    variables: {
      input: { ID: id },
    },
    onCompleted: () => setShowRemove(false),
    onError: handleError,
    refetchQueries: [refetchOpportunityRelationsQuery({ ecoverseId, opportunityId })],
    awaitRefetchQueries: true,
  });

  return (
    <div className={styles.relative}>
      <Card
        className={styles.border}
        bodyProps={{
          classes: {
            background: (theme: Theme) => theme.palette.neutralLight,
          },
        }}
        primaryTextProps={{ text: actorName }}
        tagProps={{
          text: `${actorRole}`,
          color: type === 'incoming' ? 'positive' : 'neutralMedium',
        }}
        actions={isAdmin ? [<Delete width={20} height={20} onClick={() => setShowRemove(true)} />] : []}
      >
        {description !== '""' && ( // remove empty quotes check when it is fixed on server
          <>
            <Typography as="h3" variant="caption" color="neutralMedium" weight="bold" className={styles.iconWrapper}>
              {'REASON FOR COLLABORATION'}
            </Typography>
            <Typography as="h3" variant="body">
              {description}
            </Typography>
          </>
        )}
      </Card>
      <RemoveModal
        show={showRemove}
        text={`Are you sure you want to remove ${actorName} from relations?`}
        onConfirm={() => removeRelation()}
        onCancel={() => setShowRemove(false)}
      />
    </div>
  );
};

interface ActorCardProps {
  id: string;
  name: string;
  description?: string;
  value?: string;
  impact?: string;
  type?: 'stakeholder' | 'key user' | string;
  opportunityId: string;
}

export const ActorCard: FC<ActorCardProps> = ({ id, name, description, value, impact, opportunityId }) => {
  const { ecoverseId } = useEcoverse();
  const styles = useCardStyles();
  const handleError = useApolloErrorHandler();
  const [isEditOpened, setEditOpened] = useState<boolean>(false);
  const [isRemoveConfirmOpened, setIsRemoveConfirmOpened] = useState<boolean>(false);
  const { user } = useUserContext();
  const isAdmin =
    user?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
    user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity);

  const [removeActor] = useDeleteActorMutation({
    onCompleted: () => setIsRemoveConfirmOpened(false),
    onError: handleError,
    refetchQueries: [refetchOpportunityActorGroupsQuery({ ecoverseId, opportunityId })],
    awaitRefetchQueries: true,
  });

  const onRemove = () => removeActor({ variables: { input: { ID: id } } });

  return (
    <div className={styles.relative}>
      <Card
        className={styles.border}
        bodyProps={{
          classes: {
            background: (theme: Theme) => theme.palette.background,
          },
        }}
        primaryTextProps={{ text: name, tooltip: true }}
        actions={
          isAdmin
            ? [
                <Edit width={20} height={20} onClick={() => setEditOpened(true)} />,
                <Delete width={20} height={20} onClick={() => setIsRemoveConfirmOpened(true)} />,
              ]
            : []
        }
      >
        {description}
        <Spacer />
        <Typography as="h3" variant="caption" color="neutralMedium" weight="bold" className={styles.iconWrapper}>
          {'wins how? (juice)'}
          <Icon component={CupStrawIcon} size="sm" color="neutral" />
        </Typography>
        <Typography as="h3" variant="body">
          {value}
        </Typography>
        <Spacer variant="lg" />
        <Typography as="h3" variant="caption" color="neutralMedium" weight="bold" className={styles.iconWrapper}>
          {'required effort for pilot'}
          <Icon component={MinecartLoadedIcon} size="sm" color="neutral" />
        </Typography>
        <Typography as="h3" variant="body">
          {impact}
        </Typography>
      </Card>
      <ActorEdit
        show={isEditOpened}
        onHide={() => setEditOpened(false)}
        data={{ id, name, description, value, impact }}
        opportunityId={opportunityId}
        id={id}
      />
      <RemoveModal
        show={isRemoveConfirmOpened}
        text={`Are you sure you want to remove actor ${name}`}
        onConfirm={() => onRemove()}
        onCancel={() => setIsRemoveConfirmOpened(false)}
      />
    </div>
  );
};

interface NewActorProps {
  text: string;
  actorGroupId;
  opportunityId: string;
}

const useNewActorCardStyles = createStyles(theme => ({
  card: {
    color: theme.palette.primary,
    transition: 'box-shadow 0.15s ease-in-out',
    '&:hover': {
      boxShadow: `5px 5px 10px ${hexToRGBA(theme.palette.neutral, 0.15)}`,
    },
    border: `1px solid ${hexToRGBA(theme.palette.primary, 0.3)}`,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  section: {
    background: theme.palette.neutralLight,
  },
  inner: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  relative: {
    position: 'relative',
  },
}));

export const NewActorCard: FC<NewActorProps> = ({ text, actorGroupId, opportunityId }) => {
  const styles = useNewActorCardStyles();
  const [isEditOpened, setEditOpened] = useState<boolean>(false);

  return (
    <div className={styles.relative}>
      <Card
        className={styles.card}
        primaryTextProps={{ text }}
        onClick={() => setEditOpened(true)}
        sectionProps={{
          children: (
            <div className={styles.inner}>
              <Icon component={PlusIcon} color="inherit" size="xxl" />
            </div>
          ),
          className: styles.section,
        }}
      />

      <ActorEdit
        isCreate={true}
        show={isEditOpened}
        onHide={() => setEditOpened(false)}
        opportunityId={opportunityId}
        actorGroupId={actorGroupId}
      />
    </div>
  );
};

interface AspectCardProps {
  id: string;
  title: string;
  framing?: string;
  explanation?: string;
  opportunityId: string;
}

export const AspectCard: FC<AspectCardProps> = ({ id, title, framing, explanation, opportunityId }) => {
  const { ecoverseId } = useEcoverse();
  const [isEditOpened, setEditOpened] = useState<boolean>(false);
  const [isRemoveConfirmOpened, setIsRemoveConfirmOpened] = useState<boolean>(false);
  const handleError = useApolloErrorHandler();

  const [removeAspect] = useDeleteAspectMutation({
    onCompleted: () => setIsRemoveConfirmOpened(false),
    onError: handleError,
    refetchQueries: [refetchOpportunityAspectsQuery({ ecoverseId, opportunityId })],
    awaitRefetchQueries: true,
  });
  const onRemove = () => removeAspect({ variables: { input: { ID: id } } });

  const styles = useCardStyles();
  const { user } = useUserContext();
  const isAdmin =
    user?.hasCredentials(AuthorizationCredential.GlobalAdmin) ||
    user?.hasCredentials(AuthorizationCredential.GlobalAdminCommunity);

  return (
    <div className={styles.relative}>
      <Card
        className={styles.border}
        bodyProps={{
          classes: {
            background: (theme: Theme) => theme.palette.background,
          },
        }}
        primaryTextProps={{ text: replaceAll('_', ' ', title) }}
        actions={
          isAdmin
            ? [
                <Edit width={20} height={20} onClick={() => setEditOpened(true)} />,
                <Delete width={20} height={20} onClick={() => setIsRemoveConfirmOpened(true)} />,
              ]
            : []
        }
      >
        <Spacer />
        <Typography as="h3" variant="caption" color="neutralMedium" weight="bold" className={styles.iconWrapper}>
          {'explanation'}
          <Icon component={InfoSquareIcon} size="sm" color="neutral" />
        </Typography>
        <Typography as="h3" variant="body">
          {explanation}
        </Typography>
        <Spacer variant="lg" />
        <Typography as="h3" variant="caption" color="neutralMedium" weight="bold" className={styles.iconWrapper}>
          {'where we need help'}
          <Icon component={PatchQuestionIcon} size="sm" color="neutral" />
        </Typography>
        <Typography as="h3" variant="body">
          {framing}
        </Typography>
      </Card>
      <AspectEdit
        show={isEditOpened}
        onHide={() => setEditOpened(false)}
        data={{ id, title, framing: framing || '', explanation: explanation || '' }}
        opportunityId={opportunityId}
        id={id}
      />
      <RemoveModal
        show={isRemoveConfirmOpened}
        text={`Are you sure you want to remove "${title}" aspect`}
        onConfirm={() => onRemove()}
        onCancel={() => setIsRemoveConfirmOpened(false)}
      />
    </div>
  );
};

interface NewAspectProps {
  text: string;
  actorGroupId;
  opportunityId: string;
  existingAspectNames: string[];
}

export const NewAspectCard: FC<NewAspectProps> = ({ text, actorGroupId, opportunityId, existingAspectNames }) => {
  const styles = useNewActorCardStyles();
  const [isEditOpened, setEditOpened] = useState<boolean>(false);

  return (
    <div className={styles.relative}>
      <Card className={styles.card} primaryTextProps={{ text }} onClick={() => setEditOpened(true)}>
        <div className={styles.inner}>
          <Icon component={PlusIcon} color="inherit" size="xxl" />
        </div>
      </Card>

      <AspectEdit
        isCreate={true}
        show={isEditOpened}
        onHide={() => setEditOpened(false)}
        actorGroupId={actorGroupId}
        opportunityId={opportunityId}
        existingAspectNames={existingAspectNames}
      />
    </div>
  );
};
