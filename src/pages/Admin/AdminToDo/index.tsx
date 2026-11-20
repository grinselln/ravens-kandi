import { fetchCategories, fetchPhotoCategories } from "@/api/categories";
import { fetchPhotosAdmin, updatePhotoQuantities, updatePhotoQuantitiesUser } from "@/api/photos";
import { fetchPhotoSubcategories } from "@/api/subcategories";
import DashboardHeader from "@/components/Admin/DashboardHeader/DashboardHeader";
import LayoutAdmin from "@/components/Layout/LayoutAdmin";
import { useAdminSearch } from "@/hooks/useSearch";
import { ICategoryFilterCollection } from "@/interfaces/ICategories";
import { IAdminFilterPhoto, IAdminQueryPhoto, IPhotoQuantities, IQuantityItemEdit } from "@/interfaces/IPhotos";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AdminToDo.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose, faEdit, faFloppyDisk, faSpinner, faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline} from "@fortawesome/free-regular-svg-icons";
import FilterDisplay from "@/components/Shared/FilterDisplay/FilterDisplay";
import InputSearch from "@/components/Input/InputSearch/InputSearch";
import InputDropDown from "@/components/Input/InputDropDown/InputDropDown";
import Button from "@/components/Input/Button/Button";
import { IDropDownOption, ITableSort } from "@/interfaces/IRecords";
import CellQuantity from "@/components/Table/CellQuantity/CellQuantity";
import ActionButton from "@/components/Admin/Rows/ActionElements/ActionButton/ActionButton";
import { useAuth } from "@/components/Admin/Providers/AuthContext";

const INITIAL_SORT_ADMIN: ITableSort<keyof IPhotoQuantities> = { key: "current_count", direction: "asc" };
const INITIAL_SORT_USER: ITableSort<keyof IPhotoQuantities> = { key: "needed_count", direction: "desc" }; 

const AdminToDo = () => {
  const queryClient = useQueryClient();
  const { isAdmin } = useAuth();
  
  const [showNeededOnly, setShowNeededOnly] = useState<boolean>(false);
  const [showPriorityOnly, setShowPriorityOnly] = useState<boolean>(false);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<ICategoryFilterCollection>({});
  const [columnSort, setColumnSort] = useState<ITableSort<keyof IPhotoQuantities>>(isAdmin ? INITIAL_SORT_ADMIN : INITIAL_SORT_USER);
  const [inventoryThreshold, setInventoryThreshold] = useState<IDropDownOption<number> | null>(null);
  const [sortedIds, setSortedIds] = useState<number[] | null>(null);
  const [editedRecords, setEditedRecords] = useState<IQuantityItemEdit[]>([]);
  const [isEditingNeeded, setIsEditingNeeded] = useState<boolean>(false);
  const [isEditingMade, setIsEditingMade] = useState<boolean>(false);
  const [selectedPhoto, setSelectedPhoto] = useState<number | null>(null);

  type SortDirection = ITableSort["direction"];
  type SortValue = `${keyof IPhotoQuantities}|${SortDirection}`;
  type SortOption = { value: SortValue; label: string };

  const baseOptions: SortOption[] = [
  { value: "needed_count|asc", label: "Needed Count ↑" },
  { value: "needed_count|desc", label: "Needed Count ↓" },
  ];

  const sortOptions: SortOption[] = isAdmin
    ? [
      { value: "current_count|asc", label: "Current Inventory ↑" }, 
      { value: "current_count|desc", label: "Current Inventory ↓" },
      ...baseOptions]
    : baseOptions;

  const thresholdOptions = [
    {
      value: 0,
      label: "Inventory = 0"
    },
    {
      value: 1,
      label: "Inventory <= 1"
    },
    {
      value: 2,
      label: "Inventory <= 2"
    },
    {
      value: 3,
      label: "Inventory <= 3"
    },
    {
      value: 4,
      label: "Inventory <= 4"
    },
    {
      value: 5,
      label: "Inventory <= 5"
    },
  ]
  
  const { data: photos } = useQuery({
    queryKey: ['photos', selectedCategoryFilters],
    queryFn: () => {
      const arrayFilters = Object.entries(selectedCategoryFilters)
      .map(([key, value]) => ({
        category_id: key,
        ...(value ? { ...value } : {})
      }));
      
      return fetchPhotosAdmin({
        type: null,
        filters: arrayFilters.length > 0 ? arrayFilters : null,
        missingType: null,
        missingCategory: null,
        missingSubcategory: null,
        sort: "",
        count: null
      })
    },
    placeholderData: keepPreviousData,
  });

  const { data: photoCategories } = useQuery({
      queryKey: ['photoCategories'],
      queryFn: fetchPhotoCategories
  });

  const { data: photoSubcategories } = useQuery({
    queryKey: ['photoSubcategories'],
    queryFn: fetchPhotoSubcategories
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'], 
    queryFn: fetchCategories,
  });

  const { searchText, setSearchText, filteredPhotos } = useAdminSearch({
    photos: photos ?? [], 
    photoCategories : photoCategories ?? [], 
    photoSubcategories: photoSubcategories ?? []
  });

  const updateMutation = useMutation({
    mutationFn: (updates: {
      id: number, 
      data: Partial<IPhotoQuantities>
    }) => {
      if (isAdmin) {
        return updatePhotoQuantities(updates.id, updates.data)
      }

      const userQuantityData = {
        created_count: updates.data.created_count,
        needed_count: updates.data.needed_count,
        is_needed_priority: updates.data.is_needed_priority
      }
      
      return updatePhotoQuantitiesUser(updates.id, userQuantityData)
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const onSave = async () => {
    if (editedRecords.length === 0) return;

    setEditedRecords(prev => prev.map(item => ({ ...item, status: "updating" })));

    const results = await Promise.allSettled(
      editedRecords.map(async (item) => {
        try {
          const photoRecord = photos?.find(photo => photo.id === item.id);
          const tmpCreated = item.changes?.['tmp_created_count'];

          await updateMutation.mutateAsync({
            id: item.id,
            data: {
              ...item.changes,
              ...(tmpCreated !== undefined && photoRecord !== undefined
                ? { 
                  created_count: photoRecord.created_count + tmpCreated,
                  is_needed_priority: tmpCreated === photoRecord.needed_count ? 0 : 1
                }
                : {}),
            },
          });

          setEditedRecords(prev => prev.map(i =>
            i.id === item.id ? { ...i, status: "success" } : i
          ));
        } catch (err) {
          setEditedRecords(prev => prev.map(i =>
            i.id === item.id ? { ...i, status: "error", errorMessage: String(err) } : i
          ));
          throw err;
        }
      })
    );

    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ['photos'] }),
    ])

    const allSucceeded = results.every(r => r.status === "fulfilled");

    if (allSucceeded) {
      setEditedRecords([]);
    }
  };

  const onUpdateRecord = <K extends keyof IPhotoQuantities>(
    photo: IAdminQueryPhoto,
    newValue: IPhotoQuantities[K],
    property: K
  ) => {
    setEditedRecords(prev => {
      const existing = prev.find(record => record.id === photo.id);
      const isBackToOriginal = photo[property] === newValue;

      if (existing) {
        const remainingChanges = { ...existing.changes };
        delete remainingChanges[property];

        const updatedChanges = isBackToOriginal
          ? remainingChanges
          : { ...remainingChanges, [property]: newValue };

        if (Object.keys(updatedChanges).length === 0) {
          return prev.filter(record => record.id !== photo.id);
        }

        return prev.map(record =>
          record.id === photo.id ? { ...record, changes: updatedChanges } : record
        );
      }

      if (isBackToOriginal) {
        return prev;
      }

      return [
        ...prev,
        { id: photo.id, status: "pending", changes: { [property]: newValue } }
      ];
    });
  };

  const onSortColumn = useCallback((key: keyof IPhotoQuantities, direction: "asc" | "desc") => {
    if (!photos) return;

    const getValue = (photo: IAdminQueryPhoto) => {
      const edited = editedRecords.find(record => record.id === photo.id)?.changes;

      if (key === "current_count") {
        const currentInventory = (edited?.created_count ?? photo.created_count) 
        - (edited?.given_count ?? photo.given_count) 
        - (edited?.hidden_count ?? photo.hidden_count) 
        - (edited?.taken_count ?? photo.taken_count) 
        - (edited?.discard_count ?? photo.discard_count);

        return currentInventory;
      }
      
      return edited?.[key] ?? photo[key];
    };

    const ordered = [...photos].sort((a, b) => {
      const valueOne = getValue(a);
      const valueTwo = getValue(b);
      if (valueOne === valueTwo) return 0;
      const result = valueOne > valueTwo ? 1 : -1;
      return direction === "asc" ? result : -result;
    });

    setSortedIds(ordered.map(photo => photo.id));
    setColumnSort({ key, direction });
  }, [editedRecords, photos]);

  const parseSortValue = (value: SortValue): ITableSort<keyof IPhotoQuantities> => {
    const [key, direction] = value.split("|") as [keyof IPhotoQuantities, SortDirection];
    return { key, direction };
  };

  const selectedDropdownOption = useMemo(() => {
    return `${columnSort.key}|${columnSort.direction}` as SortValue;
  }, [columnSort]);

  const displayedRecords = useMemo(() => {
    if (!filteredPhotos) return [];

    const tmpFilteredPhotos = filteredPhotos.map(photo => {
      const existing = editedRecords.find(record => record.id === photo.id);
      const existingChanges = existing ? existing.changes : null;
      const inventory = (existingChanges?.created_count ?? photo.created_count) 
      - (existingChanges?.given_count ?? photo.given_count) 
      - (existingChanges?.hidden_count ?? photo.hidden_count) 
      - (existingChanges?.taken_count ?? photo.taken_count) 
      - (existingChanges?.discard_count ?? photo.discard_count);

      return ({
        ...photo,
        current_count: inventory,
        tmp_created_count: 0
      })
    }).filter(photo => { 
      return (!photo.is_retired
        && (isAdmin && inventoryThreshold ? photo.current_count <= inventoryThreshold.value : true)
        && (!isAdmin ? photo.needed_count !== 0 : true)
        && (!showPriorityOnly || (showPriorityOnly && photo.is_needed_priority))
        && (!showNeededOnly || (showNeededOnly && photo.needed_count > 0)))} 
      );

    if (!sortedIds) return tmpFilteredPhotos;

    const photoMap = new Map(tmpFilteredPhotos.map(photo => [photo.id, photo]));
    return sortedIds
      .map(id => photoMap.get(id))
      .filter((photo): photo is IAdminFilterPhoto => photo !== undefined);
  }, [filteredPhotos, sortedIds, inventoryThreshold, editedRecords, showPriorityOnly, showNeededOnly, isAdmin]);

  const isEditing = useMemo(() => {
    return isEditingNeeded || isEditingMade;
  }, [isEditingNeeded, isEditingMade]);

  useEffect(() => {
    if(photos && sortedIds === null) {
      const sort = isAdmin ? INITIAL_SORT_ADMIN : INITIAL_SORT_USER;
      onSortColumn(sort.key, sort.direction);
    }
  }, [photos, sortedIds, onSortColumn, isAdmin])

  return (
    <LayoutAdmin>
      <DashboardHeader title='To Do'>
        {isAdmin && (
          <>
          <div className={styles['threshold-field']}>
            <InputDropDown
              placeholder="Select threshold"
              value={inventoryThreshold?.value}
              options={thresholdOptions}
              setValue={(newValue) => {
                setInventoryThreshold(newValue)
              }}
              isDisabled={false}
              allowRemoval={true}
            />
          </div>
          <Button onClick={() => setShowNeededOnly(!showNeededOnly)} additionalClass={!showNeededOnly ? ["outline-muted"] : []} isDisabled={false}>
            Needed Only
          </Button>
          </>
        )}
        <Button onClick={() => setShowPriorityOnly(!showPriorityOnly)} additionalClass={!showPriorityOnly ? ["outline-muted"] : []} isDisabled={false}>
          Priority Only
        </Button>
      </DashboardHeader>

      <div className={styles['to-do-wrapper']}>
        <FilterDisplay
          searchText={searchText}
          setSearchText={setSearchText}
          categoryData={categories}
          selectedCategoryFilters={selectedCategoryFilters}
          setSelectedCategoryFilters={setSelectedCategoryFilters}
          isAdmin={true}
          defaultClosed={true}
        />
        <div className={styles['inventory-filters']}>
          <div className={styles['sort-filters']}>
            <InputSearch
              additionalClasses={["lg-full"]}
              searchText={searchText}
              setSearchText={setSearchText}
            />
            <div className={styles['inventory-dd']}>
              <InputDropDown
                placeholder="Sort By"
                isDisabled={false}
                value={selectedDropdownOption}
                setValue={(newOption) => {
                  if(newOption === null) return;

                  const newValue = parseSortValue(newOption.value);

                  onSortColumn(newValue.key, newValue.direction)
                }}
                options={sortOptions}
              />
            </div>
          </div>
          <div className={styles.controls}>
            {isEditing ? (
              <>
                <Button
                  additionalClass={["alert"]}
                  onClick={() => {
                    setEditedRecords([]);
                    setIsEditingNeeded(false);
                    setIsEditingMade(false)
                  }}
                  isDisabled={!isEditing}
                >
                  Cancel
                </Button>
                <Button
                  additionalClass={["icon", "confirm"]}
                  onClick={() => onSave()}
                  isDisabled={editedRecords.length === 0}
                >
                  {editedRecords.some(record => record?.status === "updating") 
                  ? <FontAwesomeIcon className={styles['status-badge-loading']} icon={faSpinner} spin /> 
                  : <FontAwesomeIcon icon={faFloppyDisk} />}
                  Save
                </Button>
              </>
            ) : (
              <>
                {isAdmin && (
                  <Button
                    additionalClass={["icon"]}
                    onClick={() => setIsEditingNeeded(true)}
                    isDisabled={false}
                  >
                    <FontAwesomeIcon icon={faEdit} /> Edit Needed
                  </Button>
                )}
                <Button
                  additionalClass={["icon"]}
                  onClick={() => setIsEditingMade(true)}
                  isDisabled={false}
                >
                  <FontAwesomeIcon icon={faEdit} /> Edit Made
                </Button>
              </>
            )}
            
          </div>
        </div>
        {displayedRecords.length > 0 && (
          <div className={`grid ${styles.photos}`}>
            {displayedRecords.map((photo) => {
              const existing = editedRecords.find(record => record.id === photo.id);
              const existingChanges = existing ? existing.changes : null;
              const isPriority = existingChanges?.['is_needed_priority'] !== undefined ? existingChanges['is_needed_priority'] : photo.is_needed_priority;
              const isSelected = selectedPhoto === photo.id;
              
              return (
                <div className={`col col-md-6 col-xxl-4 col-xxxl-3 ${styles['photo-todo-wrapper']}`} key={`photo_${photo.id}`}>
                  <div className={styles['photo-display-wrapper']}>
                    <div className={`${styles['photo-display']}${isSelected ? ` ${styles.view}`  : ''}${isAdmin ? ` ${styles.stock}` : ''}`} onClick={() => setSelectedPhoto(photo.id)}>
                      <img src={`${photo.url}`} />
                      <span className={`${styles.total} ${photo.needed_count !== 0 && existingChanges?.['tmp_created_count'] === photo.needed_count 
                        ? "confirm"
                        : isEditingMade && photo.needed_count !== 0
                          ? styles["in-progress"]
                          : ""}`}>
                        {!isSelected && isAdmin && (existingChanges?.['tmp_created_count'] ?? 0) + photo.current_count}
                        {isSelected && (
                          `${existingChanges?.['needed_count'] !== undefined ? existingChanges['needed_count'] : photo.needed_count} needed`
                        )}
                      </span>
                      {isSelected && (
                        <div className={styles['close-view']}>
                          <ActionButton variant="default" icon={faClose} isDisabled={false} onAction={() => setSelectedPhoto(null)} />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={styles['photo-inventory']}>
                    <span className={`${styles.title}${photo.is_needed_priority ? ` ${styles['priority']}` : ''}`}>
                      {photo.title}
                      <ActionButton 
                        onAction={() => {
                          onUpdateRecord(
                            photo, 
                            Number(existingChanges?.['is_needed_priority'] !== undefined ? !existingChanges['is_needed_priority'] : !photo.is_needed_priority),
                            "is_needed_priority")
                        }}
                        icon={isPriority ? faStar : faStarOutline}
                        variant={existingChanges?.['is_needed_priority'] !== undefined
                          ? "confirm"
                          : isPriority ? 'default-dark' : 'default'}
                        isDisabled={!isEditing || !isAdmin || (isAdmin && isEditingMade)}
                      />
                    </span>
                    <div className={styles['inventory-details']}>
                      <div className={styles['inventory-count']}>
                        <span>Needed</span>
                        <CellQuantity
                          isEditing={isEditingNeeded}
                          classes={['todo-quantity', ((isEditingNeeded && existingChanges?.['needed_count'] !== undefined) || (existingChanges?.['tmp_created_count'] === photo.needed_count)) ? "confirm" : "", "inverse"]}
                          originalQuantity={photo.needed_count}
                          quantity={existingChanges?.['needed_count'] !== undefined ? existingChanges['needed_count'] : photo.needed_count}
                          onQuantityChange={({value}) => onUpdateRecord(photo, value, "needed_count")}
                          keepRevertButtonFormat={true}
                          hideRevert={isEditingMade}
                        />
                      </div>
                      <div className={styles['inventory-count']}>
                        <span>Made</span>
                        <CellQuantity
                          isEditing={isEditingMade}
                          classes={['todo-quantity', photo.needed_count !== 0 && existingChanges?.['tmp_created_count'] === photo.needed_count 
                          ? "confirm"
                          : ((existingChanges?.['tmp_created_count'] ?? 999) < photo.needed_count && (existingChanges?.['tmp_created_count'] ?? 0) !== 0)
                            ? "alert"
                            : "",
                          "inverse"]}
                          originalQuantity={0}
                          quantity={existingChanges?.['tmp_created_count'] ?? 0}
                          onQuantityChange={({value, changeSource}) => {
                            const currentNeededCount = existingChanges?.['needed_count'] !== undefined ? existingChanges['needed_count'] : photo.needed_count;

                            onUpdateRecord(photo, value, "tmp_created_count");
                            onUpdateRecord(photo, currentNeededCount - changeSource, "needed_count");
                          }}
                          onRevertQuantity={() => {
                            onUpdateRecord(photo, 0, "tmp_created_count");
                            onUpdateRecord(photo, photo.needed_count, "needed_count");
                          }}
                          keepRevertButtonFormat={true}
                          plusDisabled={photo.needed_count === existingChanges?.['tmp_created_count']}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {selectedPhoto && (
        <div className={styles['view-overlay']} />
      )}
    </LayoutAdmin>
  )  
}

export default AdminToDo;