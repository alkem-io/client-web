import { ReactComponent as CupStrawIcon } from 'bootstrap-icons/icons/cup-straw.svg';
import { ReactComponent as InfoSquareIcon } from 'bootstrap-icons/icons/info-square.svg';
import { ReactComponent as MinecartLoadedIcon } from 'bootstrap-icons/icons/minecart-loaded.svg';
import { ReactComponent as PatchQuestionIcon } from 'bootstrap-icons/icons/patch-question.svg';
import { ReactComponent as Delete } from 'bootstrap-icons/icons/trash.svg';
import { ReactComponent as Edit } from 'bootstrap-icons/icons/pencil-square.svg';

import React, { FC, useState } from 'react';
import { Theme } from '../../context/ThemeProvider';
import { createStyles } from '../../hooks/useTheme';
import Card from '../core/Card';
import Icon from '../core/Icon';
import Typography from '../core/Typography';
import ActorEdit from './ActorEdit';
import { useUserContext } from '../../hooks/useUserContext';
import RemoveModal from '../core/RemoveModal';
import { useRemoveActorMutation, useRemoveAspectMutation, useRemoveRelationMutation } from '../../generated/graphql';
import {
  QUERY_OPPORTUNITY_ACTOR_GROUPS,
  QUERY_OPPORTUNITY_ASPECTS,
  QUERY_OPPORTUNITY_RELATIONS,
} from '../../graphql/opportunity';
import AspectEdit from './AspectEdit';

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
  mdSpacer: {
    marginTop: theme.shape.spacing(2),
  },
  lgSpacer: {
    marginTop: theme.shape.spacing(4),
  },
  iconWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
}));

export const Spacer: FC<{ variant?: 'lg' | 'md' }> = ({ variant = 'md' }) => {
  const styles = useCardStyles();

  return <div className={styles[`${variant}Spacer`]} />;
};

interface RelationCardProps {
  actorName: string;
  actorRole?: string;
  actorType?: string;
  description?: string;
  type: string;
  id: string;
  opportunityID: string;
}

export const RelationCard: FC<RelationCardProps> = ({ actorName, actorRole, description, type, id, opportunityID }) => {
  const styles = useCardStyles();
  const [showRemove, setShowRemove] = useState<boolean>(false);
  const { user } = useUserContext();
  const isAdmin = user?.ofGroup('ecoverse-admins', true) || user?.ofGroup('global-admins', true);

  const [removeRelation] = useRemoveRelationMutation({
    variables: { ID: Number(id) },
    onCompleted: () => setShowRemove(false),
    onError: e => console.error(e),
    refetchQueries: [{ query: QUERY_OPPORTUNITY_RELATIONS, variables: { id: Number(opportunityID) } }],
    awaitRefetchQueries: true,
  });

  return (
    <>
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
    </>
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

export const ActorCard: FC<ActorCardProps> = ({
  id,
  name,
  description,
  value,
  impact,
  type = 'stakeholder',
  opportunityId,
}) => {
  const styles = useCardStyles();
  const [isEditOpened, setEditOpened] = useState<boolean>(false);
  const [isRemoveConfirmOpened, setIsRemoveConfirmOpened] = useState<boolean>(false);
  const { user } = useUserContext();
  const isAdmin = user?.ofGroup('ecoverse-admins', true) || user?.ofGroup('global-admins', true);

  const [removeActor] = useRemoveActorMutation({
    onCompleted: () => setEditOpened(false),
    onError: e => console.error(e),
    refetchQueries: [{ query: QUERY_OPPORTUNITY_ACTOR_GROUPS, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });

  const onRemove = () => removeActor({ variables: { ID: Number(id) } });

  return (
    <>
      <Card
        className={styles.border}
        bodyProps={{
          classes: {
            background: (theme: Theme) =>
              type === 'stakeholder' ? theme.palette.background : theme.palette.neutralLight,
          },
        }}
        primaryTextProps={{ text: name, tooltip: true }}
        tagProps={{
          text: type,
          color: type === 'stakeholder' ? 'neutral' : 'positive',
        }}
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
        data={{ name, description, value, impact }}
        opportunityId={opportunityId}
        id={id}
      />
      <RemoveModal
        show={isRemoveConfirmOpened}
        text={`Are you sure you want to remove actor ${name}`}
        onConfirm={() => onRemove()}
        onCancel={() => setIsRemoveConfirmOpened(false)}
      />
    </>
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
  const [isEditOpened, setEditOpened] = useState<boolean>(false);
  const [isRemoveConfirmOpened, setIsRemoveConfirmOpened] = useState<boolean>(false);

  const [removeAspect] = useRemoveAspectMutation({
    onCompleted: () => setEditOpened(false),
    onError: e => console.error(e),
    refetchQueries: [{ query: QUERY_OPPORTUNITY_ASPECTS, variables: { id: Number(opportunityId) } }],
    awaitRefetchQueries: true,
  });
  const onRemove = () => removeAspect({ variables: { ID: Number(id) } });

  const styles = useCardStyles();
  const { user } = useUserContext();
  const isAdmin = user?.ofGroup('ecoverse-admins', true) || user?.ofGroup('global-admins', true);

  return (
    <>
      <Card
        className={styles.border}
        bodyProps={{
          classes: {
            background: (theme: Theme) => theme.palette.background,
          },
        }}
        primaryTextProps={{ text: title }}
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
        data={{ title, framing, explanation }}
        opportunityId={opportunityId}
        id={id}
      />
      <RemoveModal
        show={isRemoveConfirmOpened}
        text={`Are you sure you want to remove "${title}" aspect`}
        onConfirm={() => onRemove()}
        onCancel={() => setIsRemoveConfirmOpened(false)}
      />
    </>
  );
};
