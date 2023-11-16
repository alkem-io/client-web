import AddIcon from '@mui/icons-material/Add';
import { TextField } from '@mui/material';
import { GridColDef, GridInitialState, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DataGridSkeleton from '../../../../core/ui/table/DataGridSkeleton';
import DataGridTable from '../../../../core/ui/table/DataGridTable';
import { Identifiable } from '../../../../core/utils/Identifiable';
import Gutters from '../../../../core/ui/grid/Gutters';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import LoadingIconButton from '../../../../core/ui/button/LoadingIconButton';

interface Entity extends Identifiable {
  profile: {
    displayName: string;
  };
}

type RenderParams = GridRenderCellParams<string, Entity>;
type GetterParams = GridValueGetterParams<string, Entity>;

export interface CommunityAddMembersDialogProps {
  onClose?: () => void;
  fetchAvailableEntities: (filter?: string) => Promise<Entity[] | undefined>;
  onAdd: (memberId: string) => Promise<unknown> | undefined;
}

const initialState: GridInitialState = {
  pagination: {
    page: 0,
    pageSize: 10,
  },
  sorting: {
    sortModel: [
      {
        field: 'isLead',
        sort: 'desc',
      },
    ],
  },
};

const CommunityAddMembersDialog: FC<CommunityAddMembersDialogProps> = ({ onClose, onAdd, fetchAvailableEntities }) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>();
  const [availableEntities, setData] = useState<Entity[]>();
  const [loadingItemId, setLoadingItemId] = useState<string>();
  const [addedMemberIds, setAddedMemberIds] = useState<string[]>([]);

  const fetchData = async () => {
    let fetched = await fetchAvailableEntities(filter);
    setData(fetched);
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const columns: GridColDef[] = [
    {
      field: 'profile.displayName',
      headerName: t('common.name'),
      renderHeader: () => <>{t('common.name')}</>,
      renderCell: ({ row }: RenderParams) => <>{row.profile.displayName}</>,
      valueGetter: ({ row }: GetterParams) => row.profile.displayName,
      filterable: false,
      resizable: true,
    },
  ];

  const handleAdd = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await onAdd(itemId);
      await fetchData();
      setAddedMemberIds([...addedMemberIds, itemId]);
    } finally {
      setLoadingItemId(undefined);
    }
  };

  return (
    <DialogWithGrid open columns={12} onClose={onClose}>
      <DialogHeader onClose={onClose}>{t('community.addMember')}</DialogHeader>
      <Gutters>
        {!availableEntities ? (
          <DataGridSkeleton />
        ) : (
          <>
            <TextField
              value={filter}
              onChange={event => setFilter(event.target.value)}
              label={t('common.search')}
              placeholder={t('common.search')}
              size="small"
              fullWidth
            />
            <DataGridTable
              rows={availableEntities}
              columns={columns}
              actions={[
                {
                  name: 'add',
                  render: ({ row }: { row: Entity }) => {
                    if (addedMemberIds.includes(row.id)) {
                      return <>{t('common.added')}</>;
                    } else {
                      return (
                        <LoadingIconButton
                          loading={loadingItemId === row.id}
                          onClick={() => handleAdd(row.id)}
                          aria-label={t('common.add')}
                        >
                          <AddIcon color="primary" />
                        </LoadingIconButton>
                      );
                    }
                  },
                },
              ]}
              initialState={initialState}
              pageSize={10}
              disableDelete={() => true}
              dependencies={[availableEntities, loadingItemId]}
            />
          </>
        )}
      </Gutters>
    </DialogWithGrid>
  );
};

export default CommunityAddMembersDialog;
