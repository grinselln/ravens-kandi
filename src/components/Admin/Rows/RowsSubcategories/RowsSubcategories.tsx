import { useMemo, useRef } from 'react';
import RowsWrapper from '../RowsWrapper/RowsWrapper';
import Row, { IRow } from '../Row/Row';
import RowInput from '../RowInput/RowInput';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faClose, faDiamond, faPlus } from '@fortawesome/free-solid-svg-icons';
import ActionButton from '../ActionElements/ActionButton/ActionButton';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addSubcategory, deleteSubcategory, updateSubcategory } from '@/api/subcategories';
import InputDropDown from '@/components/Input/InputDropDown/InputDropDown';
import { faEdit, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import RowLink from '../RowLink/RowLink';
import SortableSubcategoryRow from '../SortableSubcategoryRow/SortableSubcategoryRow';
import { ICategoryQueryGroupedCategorySubcategory, ICategoryQueryGroupedCategorySubcategoryCat, ICategoryWithLink } from '@/interfaces/ICategories';
import { IEditedSubcategoryRecord, ISubcategoryUpdateFetchData } from '@/interfaces/ISubcategories';
import { IEditingStatus } from '@/interfaces/IRecords';
import { useDeleteConfirmation } from '../../Providers/DeleteModalContext';


interface IRowsSubcategories {
  categories: ICategoryWithLink[];
  subcategories: ICategoryQueryGroupedCategorySubcategory[];
  parentCategory: ICategoryWithLink;
  selectedSubcategoryRecord: IEditedSubcategoryRecord | null;
  setSelectedSubcategoryRecord: (value: IEditedSubcategoryRecord | null) => void;
  editedSubcategoryRecord: IEditedSubcategoryRecord | null; 
  setEditedSubcategoryRecord: React.Dispatch<React.SetStateAction<IEditedSubcategoryRecord | null>>;
  editingStatus: IEditingStatus;
}



const RowsSubcategories = ({ categories, subcategories, parentCategory, selectedSubcategoryRecord,
  setSelectedSubcategoryRecord, 
  editedSubcategoryRecord,
  setEditedSubcategoryRecord, editingStatus } : IRowsSubcategories) => {
    const queryClient = useQueryClient();
    const {pendingDeleteId, warningMessage, onDismissWarningMessage, assignWarningMessage, assignRecordType, assignOnConfirm, assignPendingDeleteId} = useDeleteConfirmation();

    const blankSubcategoryRecord = {
      id: "",
      isNew: false,
      title: "",
      order_index: null,
      category_id: null
    };

  const addMutation = useMutation({
    mutationFn: (newSubcategory: {title: string; category: number; order: number | null}) => addSubcategory(newSubcategory),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSelectedSubcategoryRecord(null);
      setEditedSubcategoryRecord(null);
    },
    onError: (error) => { 
      console.error('Update failed:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updates: ISubcategoryUpdateFetchData) => updateSubcategory(updates),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSelectedSubcategoryRecord(null);
      setEditedSubcategoryRecord(null);
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
    if(editedSubcategoryRecord === null || editedSubcategoryRecord.id === null || editedSubcategoryRecord.category_id === null) return;

    addMutation.mutate({
      title: editedSubcategoryRecord.title,
      category: editedSubcategoryRecord.category_id,
      order: editedSubcategoryRecord.order_index
    });
  };

  const handleOnEdit = (subcategoryRecord: IEditedSubcategoryRecord) => {    
    setSelectedSubcategoryRecord(subcategoryRecord);
    setEditedSubcategoryRecord(subcategoryRecord);
  };

  const handleOnSave = () => {
    if(editedSubcategoryRecord === null || !!editedSubcategoryRecord?.isNew || editedSubcategoryRecord.category_id === null) return;

    updateMutation.mutate({
      id: editedSubcategoryRecord.id,
      updatedSubcategory: {
        title: editedSubcategoryRecord.title,
        category_id: editedSubcategoryRecord.category_id,
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
    return editingStatus.isEditingNewSubcategory && editedSubcategoryRecord !== null && editedSubcategoryRecord.id === `${parentCategory.id}_-1`;
  }, [editingStatus.isEditingNewSubcategory, editedSubcategoryRecord, parentCategory]);

  const subcategoriesWithCategory  = useMemo(() => {
    return subcategories.map<ICategoryQueryGroupedCategorySubcategoryCat>((subcategory) => {
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
    return categories.map((category) => ({
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
      {subcategoriesWithCategory.map((subcategory, index: number) => {
        const isEditingCurrent = editingStatus.isEditing && subcategory.id === selectedSubcategoryRecord?.id;
        const isEditingNotSelected = editingStatus.isEditing && subcategory.id !== selectedSubcategoryRecord?.id;
        const linkedCategory = categories.find((category) => category.trigger_subcategory_id === subcategory.id);

        const rowProps: IRow = {
          isOrderingDisabled: editingStatus.isEditing,
          isOrderingHidden: parentCategory.order_index === -1,
          title: <>
            {isEditingCurrent
              ? <RowInput
                  value={editedSubcategoryRecord?.title ?? ""}
                  setValue={(newValue) => {
            
                    setEditedSubcategoryRecord(prev => {
                      if (prev === null) return ({
                        id: subcategory.id, 
                        isNew: false, 
                        title: newValue,
                        order_index: subcategory.order_index,
                        category_id: subcategory.category_id
                      });
                      
                      if (prev.isNew) return prev;

                      return ({...prev, title: newValue});
                    })
                  }}
                  isNew={false}
                  inputItemLabel='Type'
                  isDisabled={false}
                />
              : <h3>{subcategory.title}</h3>}
            {linkedCategory && !isEditingCurrent && (
              <RowLink title={linkedCategory.title} />
            )}
          </>,
          order: parentCategory.order_index === -1 ? null : subcategory.order_index,
          actionElements: isEditingCurrent ? (
            <>
            <InputDropDown
              isSmall={true}
              placeholder='Assign to Category'
              value={linkedCategory?.id}
              setValue={(newValue) => setEditedSubcategoryRecord((prev) => {
                if (prev === null || newValue === null) return prev;

                return ({...prev, category_id: newValue.value })
              })}
              options={dropdownOptions}
              isDisabled={false}
            />
            {updateMutation.isPending ? (
              <FontAwesomeIcon icon={faDiamond} spin />
            ) : (
              <ActionButton variant='confirm' icon={faCheck} isDisabled={false} onAction={() => {handleOnSave()}} />
            )}
            <ActionButton variant='alert' icon={faClose} isDisabled={updateMutation.isPending} onAction={() => {
              setSelectedSubcategoryRecord(null);
              setEditedSubcategoryRecord(null);
            }} />
            </>
          ) : (
            <>
              <ActionButton variant='default' icon={faEdit} isDisabled={isEditingNotSelected} onAction={() => {handleOnEdit({...subcategory, isNew: false})}} />
              {(deleteMutation.isPending || warningMessage !== null) && subcategory.id == pendingDeleteId ? (
                <FontAwesomeIcon icon={faDiamond} spin />
              ) : (
                <ActionButton variant='alert' icon={faTrashCan} isDisabled={isEditingNotSelected} onAction={() => { assignPendingDeleteId(subcategory.id); handleOnDelete(subcategory.id, true); }} />
              )}
            </>
          ),
          isInverse: parentCategory.order_index !== -1
        }

        return parentCategory.order_index === -1 ?(
          <Row
            key={`subcategory-row_${subcategory.id}`}
            {...rowProps}
          />
        ) : (
          <SortableSubcategoryRow
            key={`subcategory-row_${subcategory.id}`}
            subcategoryId={subcategory.id}
            categoryId={parentCategory.id}
            index={index}
            container={subcategoryContainerRef}
            {...rowProps}
          />
        )
      })}
      
      <Row
        isInverse={parentCategory.order_index !== -1}
        isOrderingDisabled={true}
        isOrderingHidden={parentCategory.order_index === -1}
        title={
          <RowInput
            value={isEditingCurrentSubcategoryNew ? editedSubcategoryRecord?.title ?? "" : ""}
            setValue={(newValue) => {
              if(!isEditingCurrentSubcategoryNew) {
                setEditedSubcategoryRecord((
                  {...blankSubcategoryRecord, 
                    id: `${parentCategory.id}_-1`, 
                    isNew: true, 
                    title: newValue,
                    category_id: parentCategory.id 
                  }));
              } else {
                setEditedSubcategoryRecord(prev => {
                  if(prev === null || !prev.isNew) return prev;

                  return ({...prev, title: newValue})
                })
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
            <ActionButton variant={"alert"} icon={faClose} onAction={() => setEditedSubcategoryRecord(null) } isDisabled={false} />
          )}
          </>
        }
      />
    </RowsWrapper>
  );
};

export default RowsSubcategories;
