import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import { Button, IconButton, TextField } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DataGridTable from '@/core/ui/table/DataGridTable';
import LoadingIconButton from '@/core/ui/button/LoadingIconButton';
import AddIcon from '@mui/icons-material/Add';
import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from 'react-beautiful-dnd';
import TableContainer from '@mui/material/TableContainer';
import Table from '@mui/material/Table';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import TableBody from '@mui/material/TableBody';
import React, { useState } from 'react';
import { useInnovationHubAvailableSpacesQuery } from '@/core/apollo/generated/apollo-hooks';
import { GridColDef, GridRenderCellParams, GridValueGetterParams } from '@mui/x-data-grid';
import { useTranslation } from 'react-i18next';
import { Identifiable } from '@/core/utils/Identifiable';
import { sortBy, without } from 'lodash';
import { BlockSectionTitle, BlockTitle } from '@/core/ui/typography';
import { Remove, Search } from '@mui/icons-material';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import Gutters from '@/core/ui/grid/Gutters';
import { SpaceVisibility } from '@/core/apollo/generated/graphql-schema';
import { SpaceAboutMinimalUrlModel } from '@/domain/space/about/model/spaceAboutMinimal.model';

export interface Space extends Identifiable {
  id: string;
  provider: {
    profile: {
      displayName: string;
    };
  };
  visibility: SpaceVisibility;
  about: SpaceAboutMinimalUrlModel;
}

interface InnovationHubSpacesFieldProps {
  spaces: Space[] | undefined;
  onChange?: (spaces: string[]) => Promise<void>;
}

const InnovationHubSpacesField = ({ spaces, onChange }: InnovationHubSpacesFieldProps) => {
  const { t } = useTranslation();

  const itemIds = spaces?.map(({ id }) => id) ?? [];

  const handleDragEnd: OnDragEndResponder = ({ draggableId, destination }) => {
    if (!itemIds || !destination) {
      return;
    }
    const nextItemIds = without(itemIds, draggableId);
    nextItemIds.splice(destination.index, 0, draggableId);
    onChange?.(nextItemIds);
  };

  const handleRemove = (itemId: string) => {
    const nextItemIds = without(itemIds, itemId);
    onChange?.(nextItemIds);
  };

  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  const { data: availableSpacesData } = useInnovationHubAvailableSpacesQuery({
    skip: !isAddDialogOpen,
  });

  const columns: GridColDef[] = [
    {
      field: 'profile.displayName',
      headerName: t('common.name'),
      renderHeader: () => <>{t('common.name')}</>,
      renderCell: ({ row }: GridRenderCellParams<string, Space>) => <>{row.about.profile.displayName}</>,
      valueGetter: ({ row }: GridValueGetterParams<string, Space>) => row.about.profile.displayName,
      filterable: false,
      resizable: true,
    },
    {
      field: 'visibility',
      headerName: t('pages.admin.space.settings.visibility.title'),
      renderHeader: () => <>{t('pages.admin.space.settings.visibility.title')}</>,
      renderCell: ({ row }: GridRenderCellParams<string, Space>) => <>{row.visibility}</>,
      valueGetter: ({ row }: GridValueGetterParams<string, Space>) => row.visibility,
      filterable: false,
      resizable: true,
    },
    {
      field: 'host.profile.displayName',
      headerName: t('pages.admin.innovationHubs.fields.host'),
      renderHeader: () => <>{t('pages.admin.innovationHubs.fields.host')}</>,
      renderCell: ({ row }: GridRenderCellParams<string, Space>) => <>{row.provider.profile.displayName}</>,
      valueGetter: ({ row }: GridValueGetterParams<string, Space>) => row.provider.profile.displayName,
      filterable: false,
      resizable: true,
    },
  ];

  const [loadingItemId, setLoadingItemId] = useState<string>();

  const handleAdd = async (itemId: string) => {
    try {
      setLoadingItemId(itemId);
      await onChange?.([...itemIds, itemId]);
    } finally {
      setLoadingItemId(undefined);
    }
  };

  const [filter, setFilter] = useState('');

  const filteredAvailableSpaces = availableSpacesData?.spaces?.filter(space => {
    return space.about.profile.displayName.toLowerCase().includes(filter.toLowerCase());
  });

  const sortedAvailableSpaces = sortBy(filteredAvailableSpaces, space =>
    space.about.profile.displayName.toLowerCase().indexOf(filter.toLowerCase())
  );

  return (
    <>
      <PageContentBlockHeader
        title={
          <>
            <BlockTitle>{t('pages.admin.innovationHub.spaceListFilter.header.title')}</BlockTitle>
            <BlockSectionTitle>{t('pages.admin.innovationHub.spaceListFilter.header.subtitle')}</BlockSectionTitle>
          </>
        }
        actions={
          <Button variant="contained" onClick={() => setIsAddDialogOpen(true)}>
            {t('common.add')}
          </Button>
        }
      />
      <DialogWithGrid columns={8} open={isAddDialogOpen} onClose={() => setIsAddDialogOpen(false)}>
        <DialogHeader
          title={t('common.add')}
          onClose={() => setIsAddDialogOpen(false)}
          actions={
            <TextField
              value={filter}
              onChange={({ target }) => setFilter(target.value)}
              size="small"
              InputProps={{
                endAdornment: <Search />,
              }}
            />
          }
        />
        <Gutters>
          <DataGridTable
            rows={sortedAvailableSpaces}
            columns={columns}
            actions={[
              {
                name: 'add',
                render: ({ row }: { row: Space }) => {
                  if (itemIds.includes(row.id)) {
                    return <>{t('common.added')}</>;
                  } else {
                    return (
                      <LoadingIconButton loading={loadingItemId === row.id} onClick={() => handleAdd(row.id)}>
                        <AddIcon color="primary" />
                      </LoadingIconButton>
                    );
                  }
                },
              },
            ]}
            pageSize={10}
            dependencies={[spaces, loadingItemId]}
          />
        </Gutters>
      </DialogWithGrid>
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="spaceListFilter">
          {provided => (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>{t('common.name')}</TableCell>
                    <TableCell>{t('pages.admin.space.settings.visibility.title')}</TableCell>
                    <TableCell>{t('pages.admin.innovationHubs.fields.host')}</TableCell>
                    <TableCell />
                  </TableRow>
                </TableHead>
                <TableBody ref={provided.innerRef} {...provided.droppableProps}>
                  {spaces?.map((space, index) => (
                    <Draggable key={space.id} draggableId={space.id} index={index}>
                      {(provided, snapshot) => (
                        <TableRow
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          sx={{ display: snapshot.isDragging ? 'table' : undefined }}
                        >
                          <TableCell>{space.about.profile.displayName}</TableCell>
                          <TableCell>{space.visibility}</TableCell>
                          <TableCell>{space.provider.profile.displayName}</TableCell>
                          <TableCell>
                            <IconButton
                              color="warning"
                              onClick={() => handleRemove(space.id)}
                              aria-label={t('buttons.delete')}
                            >
                              <Remove />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </Droppable>
      </DragDropContext>
    </>
  );
};

export default InnovationHubSpacesField;
