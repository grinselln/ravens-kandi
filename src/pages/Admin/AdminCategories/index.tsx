import RowsWrapper from '@/components/Admin/Rows/RowsWrapper/RowsWrapper';
import styles from './AdminCategories.module.scss';
import DashboardHeader from "@/components/Admin/DashboardHeader/DashboardHeader";
import Button from "@/components/Input/Button/Button";
import LayoutAdmin from "@/components/Layout/LayoutAdmin";
import { faCheck, faClose, faDiamond, faLink, faLinkSlash, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Row from '@/components/Admin/Rows/Row/Row';
import RecordCount from '@/components/Admin/Rows/ActionElements/RecordCount/RecordCount';
import RowAccordion from '@/components/Admin/Rows/RowAccordion/RowAccordion';
import RowInput from '@/components/Admin/Rows/RowInput/RowInput';
import { ComponentProps, useMemo, useState } from 'react';
import { QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { addCategory, deleteCategory, fetchCategories, reorderCategories, updateCategory } from '@/api/categories';
import ActionButton from '@/components/Admin/Rows/ActionElements/ActionButton/ActionButton';
import RowsSubcategories from '@/components/Admin/Rows/RowsSubcategories/RowsSubcategories';
import { addSubcategories, fetchSubcategories, reorderSubcategories } from '@/api/subcategories';
import RowLink from '@/components/Admin/Rows/RowLink/RowLink';
import AddBulkModal from '@/components/Admin/Modals/AddBulkModal/AddBulkModal';
import { faEdit, faTrashAlt } from '@fortawesome/free-regular-svg-icons';
import InputDropDown from '@/components/Input/InputDropDown/InputDropDown';
import AddCategoryModal from '@/components/Admin/Modals/AddCategoryModal/AddCategoryModal';
import {RestrictToVerticalAxis} from '@dnd-kit/abstract/modifiers';
import SortableCategoryAccordion from '@/components/Admin/Rows/SortableCategoryAccordion/SortableCategoryAccordion';
import { DragDropProvider } from '@dnd-kit/react';
import { isSortable } from '@dnd-kit/react/sortable';
import { arrayMove } from '@dnd-kit/helpers';
import { useWindowWidth } from '@/hooks/useWindowWidth';
import { IAddCategory, ICategoriesQueryData, ICategoryQueryGroupedCategory, ICategoryQueryGroupedCategorySubcategory, ICategoryQueryOption, ICategoryWithLink, IEditedCategoryRecord, IExistingCategoryDraft, INewCategoryDraft, IReorderCategoryContext, IUpdateCategory } from '@/interfaces/ICategories';
import { IEditedSubcategoryRecord, ISubcategory } from '@/interfaces/ISubcategories';
import { IAddedBulkRecord, IDropDownOption, IReorderRecord, IReorderResponse } from '@/interfaces/IRecords';
import { useDeleteConfirmation } from '@/components/Admin/Providers/DeleteModalContext';

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
  
  const { windowBreakPoints } = useWindowWidth();
  const {pendingDeleteId, warningMessage, onDismissWarningMessage, assignWarningMessage, assignRecordType, assignOnConfirm, assignPendingDeleteId} = useDeleteConfirmation();

  const blankCategoryRecord: INewCategoryDraft = {
    isNew: false,
    id: null,
    title: "",
    subcategories: [],
    newSubcategoryTitles: [],
    order_index: null,
    trigger_subcategory_id: null
  };

  /*const blankSubcategoryRecord = {
    isNew: false as const,
    id: "",
    title: "",
    order_index: null,
    category_id: null
  };*/

  const [selectedCategoryRecord, setSelectedCategoryRecord] = useState<IEditedCategoryRecord>(blankCategoryRecord);
  const [editedCategoryRecord, setEditedCategoryRecord] = useState<IEditedCategoryRecord>(blankCategoryRecord);
  const [selectedSubcategoryRecord, setSelectedSubcategoryRecord] = useState<IEditedSubcategoryRecord | null>(null);
  const [editedSubcategoryRecord, setEditedSubcategoryRecord] = useState<IEditedSubcategoryRecord | null>(null);
  const [triggerEditId, setTriggerEditId] = useState<number | null>(null);
  
  const [showSubcategoryAddNew, setShowSubcategoryAddNew] = useState<boolean>(false);

  const [showCategoryAddNew, setShowCategoryAddNew] = useState<boolean>(false);

  const { data } = useQuery({
    queryKey: ['categories'], 
    queryFn: fetchCategories,
  });

  const { data: dataSubcategories } = useQuery({
    queryKey: ['subcategories'], 
    queryFn: fetchSubcategories,
  });

  const addMutation = useMutation({
    mutationFn: (newCategory: IAddCategory | IEditedCategoryRecord) => addCategory(newCategory),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['categories'] }),
        queryClient.invalidateQueries({ queryKey: ['subcategories'] })
      ])
      setSelectedCategoryRecord(blankCategoryRecord);
      setEditedCategoryRecord(blankCategoryRecord);
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const addBulkMutation = useMutation({
    mutationFn: (newRecords: Array<IAddedBulkRecord>) => addSubcategories(newRecords),
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
    mutationFn: (updates: {id: number, updatedCategory: IUpdateCategory}) => updateCategory(updates.id, updates.updatedCategory),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['categories'] });
      setSelectedCategoryRecord(blankCategoryRecord);
      setEditedCategoryRecord(blankCategoryRecord);
      setTriggerEditId(null);
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const reorderMutation = useMutation<
    IReorderResponse,
    Error,
    { isCategory: boolean; categoryId?: number; items: Array<IReorderRecord> },
    IReorderCategoryContext
  >({
    mutationFn: (payload: { isCategory: boolean; categoryId?: number; items: Array<IReorderRecord> }) => {
      if (payload.isCategory) {
        return reorderCategories(payload.items);
      }
        return reorderSubcategories(payload.categoryId!, payload.items);
      },
      onError: (error, _variables, context) => {
        console.error('Reorder failed:', error);

        queryClient.setQueryData<ICategoriesQueryData>(['categories'], context?.previousData);
      },
      onMutate: async (payload) => {
        await queryClient.cancelQueries({ queryKey: ['categories'] });
        const previousData = queryClient.getQueryData<ICategoriesQueryData>(['categories'])

        queryClient.setQueryData<ICategoriesQueryData>(['categories'], (old) => {
          if (!old) return old;

          const reorderedMap = new Map(payload.items.map((item: IReorderRecord) => [item.id, item.order_index]));

          if (payload.isCategory) {
            const newGroupedCategories = [...old.groupedCategories]
              .map((category: ICategoryQueryGroupedCategory) => {
                const newOrder = reorderedMap.get(category.id);

                return ({
                  ...category,
                  order_index: newOrder ?? category.order_index
                })
              })
              .sort((a: ICategoryQueryGroupedCategory, b: ICategoryQueryGroupedCategory) => a.order_index - b.order_index);

            return { ...old, groupedCategories: newGroupedCategories };
          }

          return {
            ...old,
            groupedCategories: old.groupedCategories.map((category: ICategoryQueryGroupedCategory) => {
              if (category.id !== payload.categoryId) return category;

              const newSubcategories = [...category.subcategories]
                .map((sub: ICategoryQueryGroupedCategorySubcategory) => {
                  const newOrder = reorderedMap.get(category.id);

                  return ({ ...sub, order_index: newOrder ?? sub.order_index })
                })
                .sort((a: ICategoryQueryGroupedCategorySubcategory, b: ICategoryQueryGroupedCategorySubcategory) => a.order_index - b.order_index);

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

  const handleOnAdd = (newRecordData?: IAddCategory) => {
    const source = newRecordData ?? editedCategoryRecord;

    if (source.title === "") return;

    addMutation.mutate(source);
  };

  const handleOnAddSubcategoryBulk = (addedRecords: Array<IAddedBulkRecord>) => {
    if(addedRecords.length === 0) return;

    const convertedRecords = addedRecords.map((record: IAddedBulkRecord) => ({...record, category: record.value}));

    addBulkMutation.mutate(convertedRecords);
  };

  const handleOnEdit = (categoryRecord: ICategoryWithLink, isTriggerEdit?: boolean) => { 
    const editableRecord: IExistingCategoryDraft = { ...categoryRecord, isNew: false };
    
    setSelectedCategoryRecord(editableRecord);
    setEditedCategoryRecord(editableRecord);

    if(isTriggerEdit) {
      setTriggerEditId(categoryRecord.id);
    }
  };

  const handleOnSave = (recordOverride: ICategoryWithLink | null = null) => {
    if(editedCategoryRecord === null) return;

    const editedRecord = recordOverride ? recordOverride : editedCategoryRecord;

    if (editedRecord.id === null) return;

    updateMutation.mutate({
      id: editedRecord.id,
      updatedCategory: {
        title: editedRecord.title,
        trigger_subcategory_id: editedRecord.trigger_subcategory_id,
      }
    })
  }

  const handleOnDelete = (id: number, showConfirm?: boolean) => {
    deleteMutation.mutate({
      id,
      showConfirm
    })
  }

  type DragEndEvent = NonNullable<ComponentProps<typeof DragDropProvider>['onDragEnd']>;

  const handleDragEnd: DragEndEvent = (event) => {
    if (event.canceled) return;

    const { source } = event.operation;
    if (!isSortable(source)) return;

    const { initialIndex, index, type, group } = source;
    if (initialIndex === index) return;

    const isCategory = type === 'category';
    const listItems = isCategory
      ? categoriesWithLinks
      : (categoriesWithLinks.find((c: ICategoryWithLink) => c.id === group)?.subcategories ?? []);

    const reordered = arrayMove(listItems, initialIndex, index).map((item: ICategoryWithLink | ICategoryQueryGroupedCategorySubcategory, idx: number) => ({
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
      isEditing: editedCategoryRecord === null || editedCategoryRecord.id !== null || editedCategoryRecord.isNew || triggerEditId !== null,
      isEditingNewCategory: editedCategoryRecord.isNew,
      isEditingNewSubcategory: typeof editedSubcategoryRecord?.id === "string"
    }
  }, [editedCategoryRecord, editedSubcategoryRecord, triggerEditId]);

  const {categoriesWithLinks, categoriesWithLinksAll, unassignedCategory, dropdownCategoryData} = useMemo(() => {
    const categoriesWithLinksAll: ICategoryWithLink[] = (data?.groupedCategories ?? []).map((category: ICategoryQueryGroupedCategory) => {
      if(category.trigger_subcategory_id && dataSubcategories) {
        const triggerSubcategory = dataSubcategories.find((subcategory: ISubcategory) => subcategory.id === category.trigger_subcategory_id);
        const triggerSubcategoryCategory = (data?.groupedCategories ?? []).find((category: ICategoryQueryGroupedCategory) => category.id === triggerSubcategory?.category_id);

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

    const unassignedCategory = categoriesWithLinksAll.find((category: ICategoryWithLink) => category.order_index === -1);

    const categoriesWithLinks = categoriesWithLinksAll.filter((category: ICategoryWithLink) => category.order_index !== -1);

    const categoryIds = categoriesWithLinks.map((category: ICategoryWithLink) => category.id);

    const dropdownCategoryData = categoriesWithLinksAll.map((category: ICategoryWithLink) => ({
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
  }, [data, dataSubcategories]);


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
            {categoriesWithLinks.map((category: ICategoryWithLink, index: number) => {
              const linkedSubcategory = category?.linkedSubcategory;
              const editingCurrent = editingStatus.isEditing && selectedCategoryRecord.id === category.id;
              const editingTrigger = editingStatus.isEditing && triggerEditId === category.id;
              const currentSubcategories = category.subcategories.map((subcategory: ICategoryQueryGroupedCategorySubcategory) => subcategory.id);
              const dropdownOptions: Array<IDropDownOption<number>> = (data?.options ?? []).filter((option: ICategoryQueryOption) => !currentSubcategories.includes(option.id) && !(option.label).includes("Unassigned"))
              .map((subcategory: ICategoryQueryOption) => ({label: subcategory.label, value: subcategory.id}));

              return (
                <SortableCategoryAccordion 
                  key={`category_wrapper_${category.id}`}
                  categoryId={category.id}
                  index={index}
                  headerRenderFn={(handleRef: (element: Element | null) => void) => (
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
                                value={editedCategoryRecord?.title ?? ""}
                                setValue={(newValue) => setEditedCategoryRecord((prev: IEditedCategoryRecord) => ({...prev, isNew: false, title: newValue}))}
                                isNew={false}
                                inputItemLabel='Category'
                                isDisabled={false}
                              />
                            : <h3>{category.title}</h3>}
                            {linkedSubcategory && !editingTrigger && !windowBreakPoints.isXS && (
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
                                    setEditedCategoryRecord((prev : IEditedCategoryRecord) => {
                                      if(newValue === null) return prev;

                                      const newValueInt = typeof newValue.value === "number" ? newValue.value : parseInt(newValue.value);
                                      return ({...prev, trigger_subcategory_id: newValueInt })
                                  })}}
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
                                  {!windowBreakPoints.isXS && (
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
                                  )}
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
                  setEditedCategoryRecord(({...blankCategoryRecord, isNew: true, title: newValue}))
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
        recordTypePlural='Subcategories'
        onSave={(newRecords: Array<IAddedBulkRecord>) => handleOnAddSubcategoryBulk(newRecords)}
      />

      <AddCategoryModal
        isOpen={showCategoryAddNew}
        setIsOpen={setShowCategoryAddNew}
        triggerSubcategories={data?.options ?? []}
        subcategories={dataSubcategories ?? []}
        onSave={(newCategory: IAddCategory) => {
          handleOnAdd(newCategory)
        }}
      />
    </LayoutAdmin>
  );
};

export default AdminCategories;
