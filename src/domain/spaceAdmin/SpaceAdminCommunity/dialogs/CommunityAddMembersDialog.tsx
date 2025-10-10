import AddIcon from '@mui/icons-material/Add';
import { TextField } from '@mui/material';
import { GridColDef, GridInitialState, GridRenderCellParams } from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DataGridSkeleton from '@/core/ui/table/DataGridSkeleton';
import DataGridTable from '@/core/ui/table/DataGridTable';
import { Identifiable } from '@/core/utils/Identifiable';
import Gutters from '@/core/ui/grid/Gutters';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import LoadingIconButton from '@/core/ui/button/LoadingIconButton';

interface Entity extends Identifiable {
  email?: string;
  profile: {
    displayName: string;
  };
}

type RenderParams = GridRenderCellParams<Entity>;
type GetterParams = Entity | undefined;

export interface CommunityAddMembersDialogProps {
  onClose?: () => void;
  fetchAvailableEntities: (filter?: string) => Promise<Entity[] | undefined>;
  onAdd: (memberId: string) => Promise<unknown> | undefined | void;
  allowSearchByURL?: boolean;
}
const PAGE_SIZE = 10;
const initialState: GridInitialState = {
  pagination: {
    paginationModel: {
      page: 0,
      pageSize: PAGE_SIZE,
    },
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

const CommunityAddMembersDialog = ({ onClose, onAdd, fetchAvailableEntities }: CommunityAddMembersDialogProps) => {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<string>();
  const [availableEntities, setData] = useState<Entity[]>();
  const [loadingItemId, setLoadingItemId] = useState<string>();
  const [addedMemberIds, setAddedMemberIds] = useState<string[]>([]);

  const fetchData = async () => {
    let fetched = await fetchAvailableEntities(filter);
    setData(fetched);
  };

  const createCellText = (row: Entity) => `${row.profile.displayName} ${row.email ? '(' + row.email + ')' : ''}`;

  const parseAndSetFilter = async (event: React.ChangeEvent<HTMLInputElement>) => {
    let filterValue = event.target.value;
    setFilter(filterValue);
  };

  useEffect(() => {
    fetchData();
  }, [filter]);

  const columns: GridColDef[] = [
    {
      field: 'profile.displayName',
      headerName: t('common.name'),
      renderCell: ({ row }: RenderParams) => <>{createCellText(row)}</>,
      valueGetter: (_, row: GetterParams) => row?.profile.displayName,
      filterable: false,
      flex: 1,
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
    <DialogWithGrid open columns={12} onClose={onClose} aria-labelledby="community-add-members-dialog">
      <DialogHeader id="community-add-members-dialog" onClose={onClose}>
        {t('community.addMember')}
      </DialogHeader>
      <Gutters>
        {!availableEntities ? (
          <DataGridSkeleton />
        ) : (
          <>
            <TextField
              value={filter}
              onChange={parseAndSetFilter}
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
                  render: ({ row }: RenderParams) => {
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
              pageSizeOptions={[PAGE_SIZE]}
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
