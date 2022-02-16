import { makeStyles } from '@mui/styles';
import { ReactComponent as CupStrawIcon } from 'bootstrap-icons/icons/cup-straw.svg';
import { ReactComponent as InfoSquareIcon } from 'bootstrap-icons/icons/info-square.svg';
import { ReactComponent as MinecartLoadedIcon } from 'bootstrap-icons/icons/minecart-loaded.svg';
import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';
import { ReactComponent as PlusIcon } from 'bootstrap-icons/icons/plus.svg';
import { ReactComponent as Delete } from 'bootstrap-icons/icons/trash.svg';
import React, { FC, useState } from 'react';
import { useApolloErrorHandler, useEcoverse } from '../../../../hooks';
import {
  refetchOpportunityActorGroupsQuery,
  refetchOpportunityAspectsOldQuery,
  refetchOpportunityRelationsQuery,
  useDeleteActorMutation,
  useDeleteAspectMutation,
  useDeleteRelationMutation,
} from '../../../../hooks/generated/graphql';
import hexToRGBA from '../../../../utils/hexToRGBA';
import { replaceAll } from '../../../../utils/replaceAll';
import Card from '../../../core/Card';
import Icon from '../../../core/Icon';
import RemoveModal from '../../../core/RemoveModal';
import { Spacer } from '../../../core/Spacer';
import Typography from '../../../core/Typography';
import ActorEdit from './ActorEdit';
import AspectEdit from './AspectEdit';

const useCardStyles = makeStyles(theme => ({
  item: {
    display: 'flex',
    flexGrow: 1,
    alignItems: 'center',
    paddingTop: theme.spacing(2),
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
    border: `1px solid ${theme.palette.neutralMedium.main}`,
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
  isAdmin: boolean;
}

export const RelationCard: FC<RelationCardProps> = ({
  actorName,
  actorRole,
  description,
  type,
  id,
  opportunityId,
  isAdmin,
}) => {
  const { hubNameId } = useEcoverse();
  const styles = useCardStyles();
  const handleError = useApolloErrorHandler();
  const [showRemove, setShowRemove] = useState<boolean>(false);

  const [removeRelation] = useDeleteRelationMutation({
    variables: {
      input: { ID: id },
    },
    onCompleted: () => setShowRemove(false),
    onError: handleError,
    refetchQueries: [refetchOpportunityRelationsQuery({ hubId: hubNameId, opportunityId })],
    awaitRefetchQueries: true,
  });

  return (
    <div className={styles.relative}>
      <Card
        className={styles.border}
        bodyProps={{
          classes: {
            background: theme => theme.palette.neutralLight.main,
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
            <Typography as="h3" variant="body1">
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
  isAdmin: boolean;
}

export const ActorCard: FC<ActorCardProps> = ({ id, name, description, value, impact, opportunityId, isAdmin }) => {
  const { hubNameId } = useEcoverse();
  const styles = useCardStyles();
  const handleError = useApolloErrorHandler();
  const [isEditOpened, setEditOpened] = useState<boolean>(false);
  const [isRemoveConfirmOpened, setIsRemoveConfirmOpened] = useState<boolean>(false);

  const [removeActor] = useDeleteActorMutation({
    onCompleted: () => setIsRemoveConfirmOpened(false),
    onError: handleError,
    refetchQueries: [refetchOpportunityActorGroupsQuery({ hubId: hubNameId, opportunityId })],
    awaitRefetchQueries: true,
  });

  const onRemove = () => removeActor({ variables: { input: { ID: id } } });

  return (
    <div className={styles.relative}>
      <Card
        className={styles.border}
        bodyProps={{
          classes: {
            background: theme => theme.palette.background.paper,
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
        <Typography as="h3" variant="body1">
          {value}
        </Typography>
        <Spacer variant="lg" />
        <Typography as="h3" variant="caption" color="neutralMedium" weight="bold" className={styles.iconWrapper}>
          {'required effort for pilot'}
          <Icon component={MinecartLoadedIcon} size="sm" color="neutral" />
        </Typography>
        <Typography as="h3" variant="body1">
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

const useNewActorCardStyles = makeStyles(theme => ({
  card: {
    color: theme.palette.primary.main,
    transition: 'box-shadow 0.15s ease-in-out',
    '&:hover': {
      boxShadow: `5px 5px 10px ${hexToRGBA(theme.palette.neutral.main, 0.15)}`,
    },
    border: `1px solid ${hexToRGBA(theme.palette.primary.main, 0.3)}`,
    borderTopRightRadius: 15,
    overflow: 'hidden',
  },
  section: {
    background: theme.palette.neutralLight.main,
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
  displayName: string;
  framing?: string;
  explanation?: string;
  opportunityId: string;
  contextId: string;
  isAdmin: boolean;
}

export const AspectCard: FC<AspectCardProps> = ({
  id,
  displayName,
  framing,
  explanation,
  opportunityId,
  contextId,
  isAdmin,
}) => {
  const { hubNameId } = useEcoverse();
  const [isEditOpened, setEditOpened] = useState<boolean>(false);
  const [isRemoveConfirmOpened, setIsRemoveConfirmOpened] = useState<boolean>(false);
  const handleError = useApolloErrorHandler();

  const [removeAspect] = useDeleteAspectMutation({
    onCompleted: () => setIsRemoveConfirmOpened(false),
    onError: handleError,
    refetchQueries: [refetchOpportunityAspectsOldQuery({ hubId: hubNameId, opportunityId })],
    awaitRefetchQueries: true,
  });
  const onRemove = () => removeAspect({ variables: { input: { ID: id } } });

  const styles = useCardStyles();

  return (
    <div className={styles.relative}>
      <Card
        className={styles.border}
        bodyProps={{
          classes: {
            background: theme => theme.palette.background.paper,
          },
        }}
        primaryTextProps={{ text: replaceAll('_', ' ', displayName) }}
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
        <Typography as="h3" variant="body1">
          {explanation}
        </Typography>
        <Spacer variant="lg" />
        <Typography as="h3" variant="caption" color="neutralMedium" weight="bold" className={styles.iconWrapper}>
          {'where we need help'}
          <Icon component={PatchQuestionIcon} size="sm" color="neutral" />
        </Typography>
        <Typography as="h3" variant="body1">
          {framing}
        </Typography>
      </Card>
      <AspectEdit
        show={isEditOpened}
        onHide={() => setEditOpened(false)}
        data={{ id, displayName }}
        opportunityId={opportunityId}
        contextId={contextId}
        id={id}
      />
      <RemoveModal
        show={isRemoveConfirmOpened}
        text={`Are you sure you want to remove "${displayName}" aspect`}
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
  contextId: string;
  existingAspectNames: string[];
}

export const NewAspectCard: FC<NewAspectProps> = ({
  text,
  actorGroupId,
  opportunityId,
  contextId,
  existingAspectNames,
}) => {
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
        contextId={contextId}
        existingAspectNames={existingAspectNames}
      />
    </div>
  );
};
