import DashboardHeader from '@/components/Admin/DashboardHeader/DashboardHeader';
import styles from './AdminTypes.module.scss';
import LayoutAdmin from "@/components/Layout/LayoutAdmin";
import Button from '@/components/Input/Button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClose, faDiamond, faPlus } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { ComponentProps, useRef, useState } from 'react';
import { addPhotoType, addPhotoTypes, deletePhotoType, fetchPhotoTypes, reorderPhotoTypes, updatePhotoType } from '@/api/photoTypes';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import RowsWrapper from '@/components/Admin/Rows/RowsWrapper/RowsWrapper';
import Row from '@/components/Admin/Rows/Row/Row';
import ActionButton from '@/components/Admin/Rows/ActionElements/ActionButton/ActionButton';
import RowInput from '@/components/Admin/Rows/RowInput/RowInput';
import {DragDropProvider} from '@dnd-kit/react';
import {isSortable } from '@dnd-kit/react/sortable';
import {RestrictToVerticalAxis} from '@dnd-kit/abstract/modifiers';
import { arrayMove} from '@dnd-kit/helpers';
import SortableTypeRow from '@/components/Admin/Rows/SortableTypeRow/SortableTypeRow';
import AddBulkModal from '@/components/Admin/Modals/AddBulkModal/AddBulkModal';
import { IAddedBulkRecord, IReorderRecord, IReorderResponse } from '@/interfaces/IRecords';
import { IReorderTypeContext, IPhotoType, IPhotoTypesQueryData, IUpdatePhotoType } from '@/interfaces/IPhotoTypes';
import { useDeleteConfirmation } from '@/components/Admin/Providers/DeleteModalContext';



const AdminTypes = () => {
  const queryClient = useQueryClient();

  const {pendingDeleteId, assignPendingDeleteId, assignWarningMessage, warningMessage, assignOnConfirm, onDismissWarningMessage, assignRecordType} = useDeleteConfirmation();

  const [selectedTypeEdit, setSelectedTypeEdit] = useState<IPhotoType | null>(null);
  const [editRecordValue, setEditRecordValue] = useState<string>("");
  const [newRecordValue, setNewRecordValue] = useState<string>("");

  const [showAddNew, setShowAddNew] = useState<boolean>(false);
  
  const { data } = useQuery({
    queryKey: ['photoTypes'], 
    queryFn: fetchPhotoTypes,
    placeholderData: keepPreviousData,
  });

  const addMutation = useMutation({
    mutationFn: (title: string) => addPhotoType(title),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photoTypes'] });
      setNewRecordValue("");
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const addBulkMutation = useMutation({
    mutationFn: (newRecords: Array<string>) => addPhotoTypes(newRecords),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['photoTypes'] });
      setShowAddNew(false);
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updates: {id: number, updatedType: IUpdatePhotoType}) => updatePhotoType(updates.id, updates.updatedType),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['photoTypes'] });
      setSelectedTypeEdit(null);
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (remove: {id: number, showConfirm?: boolean}) => deletePhotoType(remove.id, remove.showConfirm),
    onSuccess: (response, variables) => {
      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ['photoTypes'] });
        onDismissWarningMessage();
      } else if (response.status === 409) {
        assignWarningMessage(response.message);
        assignRecordType("Type");
        assignOnConfirm(() => handleOnDelete(variables.id));
      }
    }
  })

  const reorderMutation = useMutation<
    IReorderResponse,
    Error,
    { items: Array<IReorderRecord> },
    IReorderTypeContext
  >({
    mutationFn: (payload: { items: Array<IReorderRecord> }) => {
        return reorderPhotoTypes(payload.items);
      },
      onError: (error, _variables, context) => {
        console.error('Reorder failed:', error);

        queryClient.setQueryData<IPhotoTypesQueryData>(['photoTypes'], context?.previousData);
      },
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey: ['photoTypes'] });
        const previousData = queryClient.getQueryData<IPhotoTypesQueryData>(['photoTypes']);

        queryClient.setQueryData<IPhotoTypesQueryData>(['photoTypes'], (old) => {
          if (!old) return old;

          const reorderedMap = new Map(payload.items.map((item: IReorderRecord) => [item.id, item.order_index]));
          const newPhotoTypes = [...old]
            .map((type: IPhotoType) => {
              const newOrder = reorderedMap.get(type.id);

              return ({
              ...type,
              order_index: newOrder ?? type.order_index
            })
          })
          .sort((a: IPhotoType, b: IPhotoType) => a.order_index - b.order_index);

          return newPhotoTypes;
        });

        return { previousData };
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: ['photoTypes'] });
      }
  });

  const handleOnAdd = () => {
    if(newRecordValue === "") return;

    addMutation.mutate(newRecordValue);
  };

  const handleOnAddBulk = (addedRecords: Array<IAddedBulkRecord>) => {
    if(addedRecords.length === 0) return;

    const convertedRecords = addedRecords.map((record: IAddedBulkRecord) => record.title);

    addBulkMutation.mutate(convertedRecords);
  };

  const handleOnEdit = (photoTypeRecord : IPhotoType) => {
    setSelectedTypeEdit(photoTypeRecord);
    setEditRecordValue(photoTypeRecord.title);
  };

  const handleOnSave = () => {
    if(selectedTypeEdit === null) return;

    updateMutation.mutate({
      id: selectedTypeEdit.id,
      updatedType: {
        title: editRecordValue
      }
    })
  }

  const handleOnDelete = (id: number, showConfirm?: boolean) => {
    deleteMutation.mutate({
      id,
      showConfirm
    })
  }

  const newRecordCount = () => {
    const hasData = !!data;

    if (!hasData) return 998;

    const maxOrderIndex = data[data.length - 1]?.order_index ?? 998;

    return maxOrderIndex + 1;
  }

  /*useEffect(() => {
    if(selectedTypeEdit) {
      setEditRecordValue(selectedTypeEdit.title);
    }
  }, [selectedTypeEdit]);*/

  type DragEndEvent = NonNullable<ComponentProps<typeof DragDropProvider>['onDragEnd']>;

  const handleDragEnd: DragEndEvent = (event) => {
    if (event.canceled) return;

    const { source } = event.operation;
    if (!isSortable(source)) return;

    const { initialIndex, index } = source;
    if (initialIndex === index) return;

    const reorderData = data ?? [];

    const reordered = arrayMove(reorderData, initialIndex, index).map((item: IPhotoType, idx: number) => ({
      id: item.id,
      order_index: idx,
    }));

    reorderMutation.mutate({
      items: reordered,
    });
  };

  const typeContainerRef = useRef<HTMLDivElement>(null);

  return (
    <LayoutAdmin>
      <DashboardHeader title='Photo Types'>
        <Button onClick={() => setShowAddNew(true)} isDisabled={false}>
          <FontAwesomeIcon icon={faPlus} /> Add Type
        </Button>
      </DashboardHeader>

      <div className={styles['photo-types-wrapper']}>
        <RowsWrapper
          ref={typeContainerRef}
        >
          <DragDropProvider
            modifiers={[
              RestrictToVerticalAxis,
            ]}
            onDragEnd={handleDragEnd}
          >
          {(data ?? []).map((photoType : IPhotoType, index: number) => {
            const orderIndexValid = photoType.order_index !== null && photoType?.order_index >= 0;
            const isEditing = photoType.id === selectedTypeEdit?.id;
            const isEditingNotSelected = selectedTypeEdit !== null && photoType.id !== selectedTypeEdit?.id;

            return (
              <SortableTypeRow
                key={`${photoType.id}_productType`}
                photoType={photoType}
                index={index}
                container={typeContainerRef}
                isOrderingDisabled={selectedTypeEdit !== null}
                title={isEditing
                  ? <RowInput
                      value={editRecordValue}
                      setValue={(newValue) => setEditRecordValue(newValue)}
                      isNew={false}
                      inputItemLabel='Type'
                      isDisabled={false}
                    />
                  : <h3>{photoType.title}</h3>
                }
                order={orderIndexValid ? photoType.order_index: 998}
                actionElements={
                  <>
                  {isEditing ? (
                    <>
                    {updateMutation.isPending ? (
                      <FontAwesomeIcon icon={faDiamond} spin />
                    ) : (
                      <ActionButton variant='confirm' icon={faCheck} isDisabled={false} onAction={() => handleOnSave()} />
                    )}
                    <ActionButton variant='alert' icon={faClose} isDisabled={updateMutation.isPending} onAction={() => setSelectedTypeEdit(null)} />
                    </>
                  ) : (
                    <>
                      <ActionButton variant='default' icon={faEdit} isDisabled={isEditingNotSelected} onAction={() => handleOnEdit(photoType)} />
                      
                      {(deleteMutation.isPending || warningMessage !== null) && photoType.id == pendingDeleteId ? (
                        <FontAwesomeIcon icon={faDiamond} spin />
                      ) : (
                        <ActionButton variant='alert' icon={faTrashCan} isDisabled={isEditingNotSelected} onAction={() => { assignPendingDeleteId(photoType.id); handleOnDelete(photoType.id, true); }} />
                      )}
                    </>
                  )}
                  </>
                }
              />
            )
          })}
          {!!data && (
            <Row
              isOrderingDisabled={selectedTypeEdit !== null}
              isNew={true}
              title={
                <RowInput
                  value={newRecordValue}
                  setValue={(newValue) => setNewRecordValue(newValue)}
                  isNew={true}
                  inputItemLabel='Type'
                  isDisabled={selectedTypeEdit !== null}
                />
              }
              order={newRecordCount()}
              actionElements={
                <>
                {addMutation.isPending ? (
                  <FontAwesomeIcon icon={faDiamond} spin />
                ) : (
                  <ActionButton variant={newRecordValue === "" ? "default" : 'confirm'} icon={faPlus} isDisabled={newRecordValue === ""} onAction={() => handleOnAdd()} />
                )}
                {newRecordValue !== "" && (
                  <ActionButton variant={"alert"} icon={faClose} onAction={() => setNewRecordValue("") } isDisabled={false} />
                )}
                </>
              }
            />
          )}
          </DragDropProvider>
        </RowsWrapper>
      </div>

      <AddBulkModal
        showModal={showAddNew}
        setShowModal={(showValue: boolean) => setShowAddNew(showValue)}
        recordTypePlural='Types'
        onSave={(newRecords: Array<IAddedBulkRecord>) => handleOnAddBulk(newRecords)}
      />
    </LayoutAdmin>
  );
};

export default AdminTypes;
