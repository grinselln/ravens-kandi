import RowsWrapper from '@/components/Admin/Rows/RowsWrapper/RowsWrapper';
import styles from './AdminCategories.module.scss';
import DashboardHeader from "@/components/Admin/DashboardHeader/DashboardHeader";
import Button from "@/components/Input/Button/Button";
import LayoutAdmin from "@/components/Layout/LayoutAdmin";
import { faCheck, faClose, faDiamond, faLink, faLinkSlash, faPlus, faTrashCan } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Row from '@/components/Admin/Rows/Row/Row';
import RecordCount from '@/components/Admin/Rows/ActionElements/RecordCount/RecordCount';
import RowAccordion from '@/components/Admin/Rows/RowAccordion/RowAccordion';
import RowInput from '@/components/Admin/Rows/RowInput/RowInput';
import { useMemo, useState } from 'react';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addCategory, deleteCategory, fetchCategories, reorderCategories, updateCategory } from '@/api/categories';
import ActionButton from '@/components/Admin/Rows/ActionElements/ActionButton/ActionButton';
import RowsSubcategories from '@/components/Admin/Rows/RowsSubcategories/RowsSubcategories';
import { addSubcategories, fetchSubcategories, reorderSubcategories } from '@/api/subcategories';
import RowLink from '@/components/Admin/Rows/RowLink/RowLink';
import AddBulkModal from '@/components/Admin/Modals/AddBulkModal/AddBulkModal';
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import InputDropDown from '@/components/Input/InputDropDown/InputDropDown';
import { useDeleteConfirmation } from '@/components/Admin/Providers/DeleteModalProvider';
import AddCategoryModal from '@/components/Admin/Modals/AddCategoryModal/AddCategoryModal';
import {RestrictToVerticalAxis} from '@dnd-kit/abstract/modifiers';
import SortableCategoryAccordion from '@/components/Admin/Rows/SortableCategoryAccordion/SortableCategoryAccordion';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { arrayMove } from '@dnd-kit/helpers';

const queryClient = new QueryClient()

// TypeScript only:
declare global {
  interface Window {
    __TANSTACK_QUERY_CLIENT__:
      import('@tanstack/query-core')
        .QueryClient
  }
}

window.__TANSTACK_QUERY_CLIENT__ = queryClient

const AdminCategories = () => {
  const queryClient = useQueryClient();
  
  const {pendingDeleteId, warningMessage, onDismissWarningMessage, assignWarningMessage, assignRecordType, assignOnConfirm, assignPendingDeleteId} = useDeleteConfirmation();

  const blankCategoryRecord = {
    isNew: false,
    id: null,
    title: "",
    subcategories: [],
    newSubcategoryTitles: [],
    triggerSubcategoryId: null
  };

  const blankSubcategoryRecord = {
    isNew: false,
    id: null,
    title: "",
    order_index: null,
    category_id: null
  };

  const [selectedCategoryRecord, setSelectedCategoryRecord] = useState<any>(blankCategoryRecord);
  const [editedCategoryRecord, setEditedCategoryRecord] = useState<any>(blankCategoryRecord);
  const [selectedSubcategoryRecord, setSelectedSubcategoryRecord] = useState<any>(blankSubcategoryRecord);
  const [editedSubcategoryRecord, setEditedSubcategoryRecord] = useState<any>(blankSubcategoryRecord);
  const [triggerEditId, setTriggerEditId] = useState<number | null>(null);
  
  const [showSubcategoryAddNew, setShowSubcategoryAddNew] = useState<boolean>(false);

  const [showCategoryAddNew, setShowCategoryAddNew] = useState<boolean>(false);
  const [sortableCategoryIds, setSortableCategoryIds] = useState<Array<string>>([]);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['categories'], 
    queryFn: fetchCategories,
  });

  const { data: dataSubcategories } = useQuery({
    queryKey: ['subcategories'], 
    queryFn: fetchSubcategories,
  });

  const addMutation = useMutation({
    mutationFn: (newCategory: {title: string; subcategories: any; newSubcategoryTitles: any; triggerSubcategoryId: any}) => addCategory(newCategory),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['subcategories'] })
      ])
      setEditedCategoryRecord(blankCategoryRecord);
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const addBulkMutation = useMutation({
    mutationFn: (newRecords: any) => addSubcategories(newRecords),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['subcategories'] })
      ])
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const updateMutation = useMutation({
    mutationFn: (updates: {id: number, updatedCategory: any}) => updateCategory(updates.id, updates.updatedCategory),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSelectedCategoryRecord(blankSubcategoryRecord);
      setEditedCategoryRecord(blankSubcategoryRecord);
      setTriggerEditId(null);
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const reorderMutation = useMutation({
    mutationFn: (payload: { isCategory: boolean; categoryId?: number; items: any[] }) => {
      if (payload.isCategory) {
        return reorderCategories(payload.items);
      }
        return reorderSubcategories(payload.categoryId!, payload.items);
      },
      onError: (error, variables, context: any) => {
        console.error('Reorder failed:', error);

        queryClient.setQueryData(['categories'], context.previousData);
      },
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey: ['categories'] });
        const previousData = queryClient.getQueryData(['categories']);

        queryClient.setQueryData(['categories'], (old: any) => {
          if (!old) return old;

          const reorderedMap = new Map(payload.items.map((item: any) => [item.id, item.order_index]));

          if (payload.isCategory) {
            const newGroupedCategories = [...old.groupedCategories]
              .map((category: any) => ({
                ...category,
                order_index: reorderedMap.has(category.id) ? reorderedMap.get(category.id) : category.order_index
              }))
              .sort((a: any, b: any) => a.order_index - b.order_index);

            return { ...old, groupedCategories: newGroupedCategories };
          }

          return {
            ...old,
            groupedCategories: old.groupedCategories.map((category: any) => {
              if (category.id !== payload.categoryId) return category;

              const newSubcategories = [...category.subcategories]
                .map((sub: any) => ({ ...sub, order_index: reorderedMap.get(sub.id) }))
                .sort((a: any, b: any) => a.order_index - b.order_index);

              return { ...category, subcategories: newSubcategories };
            })
          };
        });

        return { previousData };
      },
      onSettled: async () => {
        await queryClient.invalidateQueries({ queryKey: ['categories'] });
      }
  });

  const deleteMutation = useMutation({
    mutationFn: (remove: {id: number, showConfirm?: boolean}) => deleteCategory(remove.id, remove.showConfirm),
    onSuccess: (response, variables) => {
      if (response.status === 200) {
        queryClient.invalidateQueries({ queryKey: ['categories'] });
        onDismissWarningMessage();
      } else if (response.status === 409) {
        assignWarningMessage(response.message);
        assignRecordType("Category");
        assignOnConfirm(() => handleOnDelete(variables.id));
      }
    }
  })

  const handleOnAdd = (newRecordData?: any) => {
    if((!!!newRecordData && editedCategoryRecord.title === "") || (!!newRecordData && newRecordData.title === "")) return;

    let newRecord = newRecordData ? newRecordData : editedCategoryRecord;

    addMutation.mutate(newRecord);
  };

  const handleOnAddSubcategoryBulk = (addedRecords: any) => {
    if(addedRecords.length === 0) return;

    const convertedRecords = addedRecords.map((record: any) => ({...record, category: record.value}));

    addBulkMutation.mutate(convertedRecords);
  };

  const handleOnEdit = (categoryRecord: any, isTriggerEdit?: boolean) => { 
    setSelectedCategoryRecord(categoryRecord);
    setEditedCategoryRecord(categoryRecord);

    if(isTriggerEdit) {
      setTriggerEditId(categoryRecord.id);
    }
  };

  const handleOnSave = (recordOverride = null) => {
    if(editedCategoryRecord === null) return;

    const editedRecord = recordOverride ? recordOverride : editedCategoryRecord;

    updateMutation.mutate({
      id: editedRecord.id,
      updatedCategory: {
        title: editedRecord.title,
        triggerSubcategoryId: editedRecord.trigger_subcategory_id,
        order: editedRecord.order_index,
        views: editedRecord.views
      }
    })
  }

  const handleOnDelete = (id: number, showConfirm?: boolean) => {
    deleteMutation.mutate({
      id,
      showConfirm
    })
  }

  const handleDragEnd = (event: any) => {
    if (event.canceled) return;

    const { source } = event.operation;
    if (!isSortable(source)) return;

    const { initialIndex, index, type, group } = source;
    if (initialIndex === index) return;

    const isCategory = type === 'category';
    const listItems = isCategory
      ? categoriesWithLinks
      : (categoriesWithLinks.find((c: any) => c.id === group)?.subcategories ?? []);

    const reordered = arrayMove(listItems, initialIndex, index).map((item: any, idx: number) => ({
      id: item.id,
      order_index: idx,
    }));


    const categoryId = isCategory ? undefined : Number(group);

    if (!isCategory && (categoryId === undefined || Number.isNaN(categoryId))) {
      return; 
    }

    reorderMutation.mutate({
      isCategory,
      categoryId,
      items: reordered,
    });
  };
  
  const editingStatus = useMemo(() => {
    return {
      isEditing: editedCategoryRecord.id !== null || editedCategoryRecord.isNew || editedSubcategoryRecord.id !== null || triggerEditId !== null,
      isEditingNewCategory: editedCategoryRecord.isNew,
      isEditingNewSubcategory: typeof editedSubcategoryRecord.id === "string"
    }
  }, [editedCategoryRecord, editedSubcategoryRecord, triggerEditId]);

  const {categoriesWithLinks, categoriesWithLinksAll, unassignedCategory, categoryIds, dropdownCategoryData} = useMemo(() => {
    const categoriesWithLinksAll = (data?.groupedCategories ?? []).map((category: any) => {
      if(category.trigger_subcategory_id && dataSubcategories) {
        const triggerSubcategory = dataSubcategories.find((subcategory: any) => subcategory.id === category.trigger_subcategory_id);
        const triggerSubcategoryCategory = data.groupedCategories.find((category: any) => category.id === triggerSubcategory?.category_id);

        if(triggerSubcategory && triggerSubcategoryCategory) {
         return {
            ...category,
            linkedSubcategory: {
              triggerSubcategoryCategory,
              triggerSubcategory
            }
          }
        }
      }

      return category
    });

    const unassignedCategory = categoriesWithLinksAll.find((category: any) => category.order_index === -1);

    const categoriesWithLinks = categoriesWithLinksAll.filter((category: any) => category.order_index !== -1);

    const categoryIds = categoriesWithLinks.map((category: any) => category.id);

    const dropdownCategoryData = categoriesWithLinksAll.map((category: any) => ({
      label: category.title,
      value: category.id
    }))

    return {
      categoriesWithLinksAll,
      categoriesWithLinks,
      unassignedCategory,
      categoryIds,
      dropdownCategoryData
    }
  }, [data?.groupedCategories, dataSubcategories]);


  return (
    <LayoutAdmin>
      <DashboardHeader title='Categories'>
        <Button onClick={() => setShowCategoryAddNew(true)} isDisabled={false}>
          <FontAwesomeIcon icon={faPlus} /> Add Category
        </Button>
        <Button onClick={() => setShowSubcategoryAddNew(true)} isDisabled={false}>
          <FontAwesomeIcon icon={faPlus} /> Add Subcategories
        </Button>
      </DashboardHeader>

      <div className={styles['categories-wrapper']}>
        <RowsWrapper>
          {unassignedCategory && (
            <RowAccordion
              isInverse={true}
              isOpenDefault={true}
              header={(isOpen, onToggle, isInverse) => 
                <Row
                  isOrderingDisabled={true}
                  isOrderingHidden={true}
                  title={<h3>{unassignedCategory.title}</h3>} 
                  order={null} 
                  isInverse={isInverse}
                  isAccordion={true} 
                  isOpen={isOpen} 
                  accordionToggle={onToggle} 
                  actionElements={<RecordCount count={unassignedCategory.subcategories.length} label='subcategory' pluralLabel='subcategories' />} 
                />
              }
            >
              <RowsSubcategories
                categories={categoriesWithLinksAll}
                subcategories={unassignedCategory.subcategories}
                parentCategory={unassignedCategory}
                selectedSubcategoryRecord={selectedSubcategoryRecord}
                setSelectedSubcategoryRecord={setSelectedSubcategoryRecord}
                editedSubcategoryRecord={editedSubcategoryRecord}
                setEditedSubcategoryRecord={setEditedSubcategoryRecord}
                editingStatus={editingStatus}
              />
            </RowAccordion>
          )}
          <DragDropProvider
            modifiers={[
              RestrictToVerticalAxis,
            ]}
            onDragEnd={handleDragEnd}
          >
            {categoriesWithLinks.map((category: any, index: number) => {
              const linkedSubcategory = category?.linkedSubcategory;
              const editingCurrent = editingStatus.isEditing && selectedCategoryRecord.id === category.id;
              const editingTrigger = editingStatus.isEditing && triggerEditId === category.id;
              const currentSubcategories = category.subcategories.map((subcategory:any) => subcategory.id);
              const dropdownOptions = (data?.options ?? []).filter((option: any) => !currentSubcategories.includes(option.id) && !(option.label)
              .includes("Unassigned"))
              .map((subcategory: any) => ({label: subcategory.label, value: subcategory.id}));

              return (
                <SortableCategoryAccordion 
                  key={`category_wrapper_${category.id}`}
                  category={category}
                  index={index}
                  headerRenderFn={(handleRef: any) => (
                    <RowAccordion
                      key={`category_${category.id}`}
                      isInverse={category.order_index === -1}
                      isOpenDefault={category.order_index === -1}
                      header={(isOpen, onToggle, isInverse) => 
                        <Row
                          dragHandleRef={handleRef}
                          isEditing={editingCurrent}
                          isOrderingDisabled={editingStatus.isEditing && (!editingCurrent || !editingTrigger)}
                          isOrderingHidden={category.order_index === -1}
                          title={<>
                            {editingCurrent && !editingTrigger
                            ? <RowInput
                                value={editedCategoryRecord.title}
                                setValue={(newValue) => setEditedCategoryRecord((prev: any) => ({...prev, title: newValue}))}
                                isNew={false}
                                inputItemLabel='Category'
                                isDisabled={false}
                              />
                            : <h3>{category.title}</h3>}
                            {linkedSubcategory && !editingTrigger && (
                              <RowLink
                                title={`${linkedSubcategory.triggerSubcategoryCategory.title} > ${linkedSubcategory.triggerSubcategory.title}`}
                              />
                            )}
                            {editingTrigger && (
                                <InputDropDown
                                  isSmall={true}
                                  placeholder='Link subcategory'
                                  value={editedCategoryRecord.trigger_subcategory_id ? editedCategoryRecord.trigger_subcategory_id : category.trigger_subcategory_id}
                                  setValue={(newValue) => {
                                    setEditedCategoryRecord((prev : any) => ({...prev, trigger_subcategory_id: newValue.value }))}}
                                  options={dropdownOptions}
                                  isDisabled={false}
                                />
                              )}
                          </>} 
                          order={category.order_index} 
                          isInverse={isInverse}
                          isAccordion={true} 
                          isOpen={isOpen} 
                          accordionToggle={onToggle} 
                          actionElements={
                            <>
                              <RecordCount count={category.subcategories.length} label='subcategory' pluralLabel='subcategories' />
                              {category.order_index !== -1 && (
                                <>
                                  <ActionButton variant={'default'} icon={linkedSubcategory ? faLinkSlash : faLink} isDisabled={editingStatus.isEditing} onAction={() => {
                                    if(!linkedSubcategory) {
                                      handleOnEdit(category, true)
                                    }
                                    else {
                                      handleOnSave({
                                        ...category,
                                        trigger_subcategory_id: null
                                      });
                                    }
                                  }} />
                                  {(!editingCurrent && !editingTrigger) ? (
                                    <ActionButton variant={'default'} icon={faEdit} isDisabled={editingStatus.isEditing} onAction={() => handleOnEdit(category)} />
                                  ) : (
                                    updateMutation.isPending ? (
                                      <FontAwesomeIcon icon={faDiamond} spin />
                                    ) : (
                                      <ActionButton variant='confirm' icon={faCheck} isDisabled={updateMutation.isPending} onAction={() => handleOnSave()} />
                                    )
                                  )}
                                  
                                  {(!editingCurrent && !editingTrigger) ? (
                                    (deleteMutation.isPending || warningMessage !== null) && category.id == pendingDeleteId ? (
                                      <FontAwesomeIcon icon={faDiamond} spin />
                                    ) : (
                                      <ActionButton variant='alert' icon={faTrashAlt} isDisabled={editingStatus.isEditing && !editingCurrent} onAction={() => { assignPendingDeleteId(category.id); handleOnDelete(category.id, true); }} />
                                    )
                                  ) : (
                                    <ActionButton variant='alert' icon={faClose} isDisabled={updateMutation.isPending} onAction={() => {
                                      setSelectedCategoryRecord(blankCategoryRecord); setEditedCategoryRecord(blankCategoryRecord); setTriggerEditId(null)
                                    }} />
                                  )}
                                  
                                </>
                              )}
                              
                            </>
                          } 
                        />
                      }
                    >
                      <RowsSubcategories
                        categories={categoriesWithLinksAll}
                        subcategories={category.subcategories}
                        parentCategory={category}
                        selectedSubcategoryRecord={selectedSubcategoryRecord}
                        setSelectedSubcategoryRecord={setSelectedSubcategoryRecord}
                        editedSubcategoryRecord={editedSubcategoryRecord}
                        setEditedSubcategoryRecord={setEditedSubcategoryRecord}
                        editingStatus={editingStatus}
                      />
                    </RowAccordion>
                  )}
                />
              )
            })}
          </DragDropProvider>

          <Row
            additionalClass='accordion-match'
            isOrderingDisabled={true}
            title={
              <RowInput
                value={editedCategoryRecord.isNew ? editedCategoryRecord.title : ""}
                setValue={(newValue) => {
                  if(!editingStatus.isEditingNewCategory) {
                    setEditedCategoryRecord((prev: any) => (
                      {...prev, 
                        isNew: true, 
                        title: newValue,
                      }));
                  } else {
                    setEditedCategoryRecord((prev: any) => ({...prev, title: newValue}))
                  }
                }}
                isNew={true}
                inputItemLabel='Category'
                isDisabled={(editingStatus.isEditing && !editingStatus.isEditingNewCategory)}
              />
            }
            order={categoriesWithLinks.length}
            actionElements={
              <>
              {addMutation.isPending ? (
                <FontAwesomeIcon icon={faDiamond} spin />
              ) : (
                <ActionButton variant={!editingStatus.isEditingNewCategory ? "default" : 'confirm'} 
                icon={faPlus} 
                isDisabled={(editingStatus.isEditing && !editingStatus.isEditingNewCategory) || (editingStatus.isEditingNewCategory && editedCategoryRecord.title === "") || !editingStatus.isEditing} onAction={() => handleOnAdd()} />
              )}
              {editingStatus.isEditingNewCategory && (
                <ActionButton variant={"alert"} icon={faClose} onAction={() => setEditedCategoryRecord(blankCategoryRecord) } isDisabled={false} />
              )}
              </>
            }
          />
        </RowsWrapper>
      </div>

      <AddBulkModal
        showModal={showSubcategoryAddNew}
        setShowModal={setShowSubcategoryAddNew}
        dropdownData={dropdownCategoryData}
        recordType='Subcategory'
        recordTypePlural='Subcategories'
        onSave={(newRecords: any) => handleOnAddSubcategoryBulk(newRecords)}
      />

      <AddCategoryModal
        isOpen={showCategoryAddNew}
        setIsOpen={setShowCategoryAddNew}
        triggerSubcategories={data?.options ?? []}
        subcategories={dataSubcategories}
        onSave={(newCategory: any) => {
          handleOnAdd(newCategory)
        }}
      />
    </LayoutAdmin>
  );
};

export default AdminCategories;
