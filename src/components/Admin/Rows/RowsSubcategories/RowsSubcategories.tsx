import { useMemo, useRef } from 'react';
import RowsWrapper from '../RowsWrapper/RowsWrapper';
import Row from '../Row/Row';
import RowInput from '../RowInput/RowInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClose, faDiamond, faPlus } from '@fortawesome/free-solid-svg-icons';
import ActionButton from '../ActionElements/ActionButton/ActionButton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addSubcategory, deleteSubcategory, updateSubcategory } from '@/api/subcategories';
import InputDropDown from '@/components/Input/InputDropDown/InputDropDown';
import { faEdit, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import { useDeleteConfirmation } from '../../Providers/DeleteModalProvider';
import RowLink from '../RowLink/RowLink';
import SortableSubcategoryRow from '../SortableSubcategoryRow/SortableSubcategoryRow';


interface IRowsSubcategories {
  categories: any;
  subcategories: any;
  parentCategory: any;
  selectedSubcategoryRecord: any;
  setSelectedSubcategoryRecord: Function;
  editedSubcategoryRecord: any; 
  setEditedSubcategoryRecord: Function;
  editingStatus: any;
}



const RowsSubcategories = ({ categories, subcategories, parentCategory, selectedSubcategoryRecord,
  setSelectedSubcategoryRecord, 
  editedSubcategoryRecord,
  setEditedSubcategoryRecord, editingStatus } : IRowsSubcategories) => {
    const queryClient = useQueryClient();
    const {pendingDeleteId, warningMessage, onDismissWarningMessage, assignWarningMessage, assignRecordType, assignOnConfirm, assignPendingDeleteId} = useDeleteConfirmation();
    
    const RowTag = parentCategory.order_index === -1 ? Row : SortableSubcategoryRow;

    const blankSubcategoryRecord = {
    id: null,
    isNew: false,
    title: "",
    order_index: null,
    category_id: null
  };

  const addMutation = useMutation({
    mutationFn: (newSubcategory: {title: string; category: number; order: number | null}) => addSubcategory(newSubcategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSelectedSubcategoryRecord(blankSubcategoryRecord);
      setEditedSubcategoryRecord(blankSubcategoryRecord);
    },
    onError: (error) => { 
      console.error('Update failed:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updates: {id: number, updatedSubcategory: any}) => updateSubcategory(updates.id, updates.updatedSubcategory),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSelectedSubcategoryRecord(blankSubcategoryRecord);
      setEditedSubcategoryRecord(blankSubcategoryRecord);
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (remove: {id: number, showConfirm?: boolean}) => deleteSubcategory(remove.id, remove.showConfirm),
    onSuccess: (response, variables) => {
      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        onDismissWarningMessage();
      } else if (response.status === 409) {
        assignWarningMessage(response.message);
        assignRecordType("Subcategory");
        assignOnConfirm(() => handleOnDelete(variables.id));
      }
    }
  })

  const newRecordCount = () => {
    const maxOrderIndex = subcategories[subcategories.length - 1]?.order_index ?? 998; 

    return maxOrderIndex + 1;
  }

  const handleOnAdd = () => {
    if(editedSubcategoryRecord.id === null) return;

    addMutation.mutate({
      title: editedSubcategoryRecord.title,
      category: editedSubcategoryRecord.category_id,
      order: editedSubcategoryRecord.order_index
    });
  };

  const handleOnEdit = (subcategoryRecord: any) => { 
    setSelectedSubcategoryRecord(subcategoryRecord);
    setEditedSubcategoryRecord(subcategoryRecord);
  };

  const handleOnSave = () => {
    if(editedSubcategoryRecord === null) return;

    updateMutation.mutate({
      id: editedSubcategoryRecord.id,
      updatedSubcategory: {
        title: editedSubcategoryRecord.title,
        category: editedSubcategoryRecord.category_id,
        order: editedSubcategoryRecord.order_index
      }
    })
  }

  const handleOnDelete = (id: number, showConfirm?: boolean) => {
    deleteMutation.mutate({
      id,
      showConfirm
    })
  }

  const isEditingCurrentSubcategoryNew = useMemo(() => {
    return editingStatus.isEditingNewSubcategory && editedSubcategoryRecord.id === `${parentCategory.id}_-1`;
  }, [editingStatus.isEditingNewSubcategory, editedSubcategoryRecord, parentCategory]);

  const subcategoriesWithCategory = useMemo(() => {
    return subcategories.map((subcategory: any) => {
      return(
      {
        ...subcategory,
        category_id: parentCategory.id,
        value: subcategory.id,
        label: subcategory.title
      }
    )})
  }, [subcategories, parentCategory]);

  const dropdownOptions = useMemo(() => {
    return categories.map((category: any) => ({
      label: category.title,
      value: category.id
    }))
  }, [categories]);
  const subcategoryContainerRef = useRef<HTMLDivElement>(null);

  return (
    <RowsWrapper
      additionalClass={"subcategories"}
      ref={subcategoryContainerRef}
    >
      {subcategoriesWithCategory.map((subcategory: any, index: number) => {
        const isEditingCurrent = editingStatus.isEditing && subcategory.id === selectedSubcategoryRecord?.id;
        const isEditingNotSelected = editingStatus.isEditing && subcategory.id !== selectedSubcategoryRecord?.id;
        const linkedCategory = categories.find((category: any) => category.trigger_subcategory_id === subcategory.id);

        return (
          <RowTag
            {...(parentCategory.order_index !== -1 && {subcategory: subcategory, categoryId: parentCategory.id, index, container: subcategoryContainerRef})}
            isOrderingDisabled={(selectedSubcategoryRecord.id !== null && !selectedSubcategoryRecord.isNew) || selectedSubcategoryRecord.isNew}
            isOrderingHidden={parentCategory.order_index === -1}
            key={`subcategory-row_${subcategory.id}`}
            title={<>
              {isEditingCurrent
                ? <RowInput
                    value={editedSubcategoryRecord.title}
                    setValue={(newValue) => setEditedSubcategoryRecord((prev: any) => ({...prev, title: newValue}))}
                    isNew={false}
                    inputItemLabel='Type'
                    isDisabled={false}
                  />
                : <h3>{subcategory.title}</h3>}
              {linkedCategory && (
                <RowLink title={linkedCategory.title} />
              )}
              </>
            }
            order={parentCategory.order_index === -1 ? null : subcategory.order_index}
            actionElements={isEditingCurrent ? (
              <>
              <InputDropDown
                isSmall={true}
                placeholder='Assign to Category'
                value={editedSubcategoryRecord.category_id}
                setValue={(newValue) => setEditedSubcategoryRecord((prev : any) => ({...prev, category_id: newValue.value }))}
                options={dropdownOptions}
                isDisabled={false}
              />
              {updateMutation.isPending ? (
                <FontAwesomeIcon icon={faDiamond} spin />
              ) : (
                <ActionButton variant='confirm' icon={faCheck} isDisabled={false} onAction={() => {handleOnSave()}} />
              )}
              <ActionButton variant='alert' icon={faClose} isDisabled={updateMutation.isPending} onAction={() => {
                setSelectedSubcategoryRecord(blankSubcategoryRecord); setEditedSubcategoryRecord(blankSubcategoryRecord)
              }} />
              </>
            ) : (
              <>
                <ActionButton variant='default' icon={faEdit} isDisabled={isEditingNotSelected} onAction={() => {handleOnEdit(subcategory)}} />
                {(deleteMutation.isPending || warningMessage !== null) && subcategory.id == pendingDeleteId ? (
                  <FontAwesomeIcon icon={faDiamond} spin />
                ) : (
                  <ActionButton variant='alert' icon={faTrashCan} isDisabled={isEditingNotSelected} onAction={() => { assignPendingDeleteId(subcategory.id); handleOnDelete(subcategory.id, true); }} />
                )}
              </>
            )}
            isInverse={parentCategory.order_index !== -1}
          />
        )
      })}
      
      <Row
        isInverse={parentCategory.order_index !== -1}
        isOrderingDisabled={true}
        isOrderingHidden={parentCategory.order_index === -1}
        title={
          <RowInput
            value={isEditingCurrentSubcategoryNew ? editedSubcategoryRecord.title : ""}
            setValue={(newValue) => {
              if(!isEditingCurrentSubcategoryNew) {
                setEditedSubcategoryRecord((prev: any) => (
                  {...prev, 
                    id: `${parentCategory.id}_-1`, 
                    isNew: true, 
                    title: newValue,
                    category_id: parentCategory.id 
                  }));
              } else {
                setEditedSubcategoryRecord((prev: any) => ({...prev, title: newValue}))
              }
            }}
            isNew={true}
            inputItemLabel='Subcategory'
            isDisabled={editingStatus.isEditing && !isEditingCurrentSubcategoryNew}
          />
        }
        order={parentCategory.order_index === -1 
          ? null
          : subcategories.length === 0
            ? 0 
            : newRecordCount()}
        actionElements={
          <>
          {addMutation.isPending ? (
            <FontAwesomeIcon icon={faDiamond} spin />
          ) : (
            <ActionButton variant={!isEditingCurrentSubcategoryNew ? "default" : 'confirm'} 
            icon={faPlus} 
            isDisabled={(editingStatus.isEditing && !isEditingCurrentSubcategoryNew) || !editingStatus.isEditing} 
            onAction={() => handleOnAdd()} />
          )}
          {isEditingCurrentSubcategoryNew && (
            <ActionButton variant={"alert"} icon={faClose} onAction={() => setEditedSubcategoryRecord(blankSubcategoryRecord) } isDisabled={false} />
          )}
          </>
        }
      />
    </RowsWrapper>
  );
};

export default RowsSubcategories;
