import React, { FC, useMemo, useState } from 'react';
import { Modal } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { TFunction } from 'i18next';
import { DataGrid, GridColDef } from '@material-ui/data-grid';
import { useUpdateNavigation } from '../../../hooks';
import { PageProps } from '../../../pages';
import { ApplicationInfoFragment } from '../../../models/graphql-schema';
import Avatar from '../../core/Avatar';
import { createStyles } from '../../../hooks/useTheme';
import Typography from '../../core/Typography';
import { useEventOnApplicationMutation } from '../../../hooks/generated/graphql';
import { useApolloErrorHandler } from '../../../hooks';
import LifecycleButton from '../../core/LifecycleButton';

interface ApplicationViewmodel {
  id: string;
  username: string;
  email: string;
  state: string;
}

const toApplicationViewmodel = (applications: ApplicationInfoFragment[]): ApplicationViewmodel[] =>
  applications.map(x => ({
    id: x.id,
    username: x.user.displayName,
    email: x.user.email,
    state: x.lifecycle?.state || '',
  }));

interface ApplicationPageProps extends PageProps {
  applications: ApplicationInfoFragment[];
}

export const ApplicationPage: FC<ApplicationPageProps> = ({ paths, applications }) => {
  const { t } = useTranslation();

  const [appChosen, setAppChosen] = useState<ApplicationInfoFragment | undefined>(undefined);

  const currentPaths = useMemo(() => [...paths, { name: 'applications', real: false }], [paths]);
  useUpdateNavigation({ currentPaths });

  const applicationsVm = useMemo(() => toApplicationViewmodel(applications), [applications]);

  const handleError = useApolloErrorHandler();

  const [updateApplication] = useEventOnApplicationMutation({
    onError: handleError,
  });

  const setNewStateHandler = (appId: string, newState: string) => {
    updateApplication({
      variables: {
        input: {
          applicationID: appId,
          eventName: newState,
        },
      },
    });
  };

  return (
    <>
      <div style={{ height: 400 }}>
        <DataGrid
          disableSelectionOnClick
          rows={applicationsVm}
          columns={colDef(t)}
          density="compact"
          hideFooter={true}
          disableColumnSelector={true}
          onRowClick={param => {
            const appId = param.getValue(param.id, 'id');
            setAppChosen(applications.find(x => x.id === appId));
          }}
        />
      </div>
      <ApplicationModal
        appChosen={appChosen}
        onHide={() => setAppChosen(undefined)}
        onSetNewState={setNewStateHandler}
      />
    </>
  );
};
export default ApplicationPage;

const appStyles = createStyles(theme => ({
  title: {
    flexGrow: 1,
  },
  header: {
    display: 'flex',
    gap: theme.spacing(4),
    alignItems: 'center',
    justifyContent: 'center',

    [theme.breakpoints.down('sm')]: {
      flexWrap: 'wrap',
      gap: theme.spacing(2),
    },
  },
  profile: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),

    [theme.breakpoints.down('sm')]: {
      gap: 0,
      flexGrow: 1,
    },
  },
  userName: {
    whiteSpace: 'nowrap',
    display: 'flex',

    [theme.breakpoints.down('sm')]: {
      flexGrow: 1,
      justifyContent: 'center',
    },
  },
  body: {
    display: 'flex',
    flexDirection: 'column',
    maxHeight: 400,
    overflowY: 'auto',
  },
  questions: {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing(1),
    margin: theme.spacing(1),
  },
  question: {
    display: 'flex',
    flexDirection: 'column',
  },
}));

interface ApplicationModalProps {
  appChosen?: ApplicationInfoFragment;
  onHide: () => void;
  onSetNewState: (appId: string, newState: string) => void;
}

const ApplicationModal: FC<ApplicationModalProps> = ({ appChosen, onHide, onSetNewState }) => {
  const styles = appStyles();

  const appId = appChosen?.id || '';
  const user = appChosen?.user;
  const questions = appChosen?.questions || [];

  const nextEvents = appChosen?.lifecycle.nextEvents || [];

  const username = user?.displayName || '';
  const avatarSrc = user?.profile?.avatar || '';

  return (
    <Modal show={!!appChosen} size="lg" onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-vcenter" className={styles.title}>
          <div className={styles.header}>
            <div className={styles.profile}>
              <Avatar src={avatarSrc} size={'lg'} />
              <div className={styles.userName}>
                <Typography variant={'h3'}>{username}</Typography>
              </div>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className={styles.body}>
          <div className={styles.questions}>
            {questions.map(x => (
              <div className={styles.question}>
                <label>{x.name}</label>
                <textarea readOnly>{x.value}</textarea>
              </div>
            ))}
          </div>
        </div>
      </Modal.Body>
      {nextEvents.length > 0 && (
        <Modal.Footer>
          {nextEvents.map((x, i) => (
            <LifecycleButton
              key={i}
              stateName={x}
              onClick={() => {
                onSetNewState(appId, x);
                onHide();
              }}
            />
          ))}
        </Modal.Footer>
      )}
    </Modal>
  );
};

const colDef = (t: TFunction) =>
  [
    {
      field: 'username',
      headerName: t('common.username'),
      flex: 1,
    },
    {
      field: 'email',
      headerName: t('common.email'),
      flex: 1,
    },
    {
      field: 'state',
      headerName: t('common.state'),
      flex: 1,
      valueFormatter: x => {
        const value = x.value as string;
        return value.charAt(0).toUpperCase() + value.slice(1);
      },
    },
  ] as GridColDef[];
