import { fetchCategories, fetchPhotoCategories } from "@/api/categories";
import { fetchPhotosAdmin } from "@/api/photos";
import { fetchPhotoSubcategories } from "@/api/subcategories";
import DashboardHeader from "@/components/Admin/DashboardHeader/DashboardHeader";
import LayoutAdmin from "@/components/Layout/LayoutAdmin";
import { useAdminSearch } from "@/hooks/useSearch";
import { ICategoryFilterCollection } from "@/interfaces/ICategories";
import { IAdminFilterPhoto, IAdminQueryPhoto, IPhotoQuantities, IQuantityItemEdit } from "@/interfaces/IPhotos";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import styles from "./AdminToDo.module.scss"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faFloppyDisk, faSpinner, faStar } from "@fortawesome/free-solid-svg-icons";
import { faStar as faStarOutline} from "@fortawesome/free-regular-svg-icons";
import FilterDisplay from "@/components/Shared/FilterDisplay/FilterDisplay";
import InputSearch from "@/components/Input/InputSearch/InputSearch";
import InputDropDown from "@/components/Input/InputDropDown/InputDropDown";
import Button from "@/components/Input/Button/Button";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import { ITableSort } from "@/interfaces/IRecords";
import CellQuantity from "@/components/Table/CellQuantity/CellQuantity";

const INITIAL_SORT: ITableSort<keyof IPhotoQuantities> = { key: "current_count", direction: "asc" };

const AdminToDo = () => {
  const { windowBreakPoints } = useWindowWidth();
  
  const [showPriorityOnly, setShowPriorityOnly] = useState<boolean>(false);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<ICategoryFilterCollection>({});
  const [columnSort, setColumnSort] = useState<ITableSort<keyof IPhotoQuantities>>(INITIAL_SORT);
  const [inventoryThreshold, setInventoryThreshold] = useState<number>(3);
  const [sortedIds, setSortedIds] = useState<number[] | null>(null);
  const [editedRecords, setEditedRecords] = useState<IQuantityItemEdit[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  type SortDirection = ITableSort["direction"];
  type SortValue = `${keyof IPhotoQuantities}|${SortDirection}`;

  const sortOptions: { value: SortValue; label: string }[] = [
    {
      value: "current_count|asc",
      label: "Current Inventory ↑"
    },
    {
      value: "current_count|desc",
      label: "Current Inventory ↓"
    },
    {
      value: "needed_count|asc",
      label: "Needed Count ↑"
    },
    {
      value: "needed_count|desc",
      label: "Needed Count ↓"
    },
  ];
  
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

  const onUpdateQuantity = <K extends keyof IPhotoQuantities>(
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
        current_count: inventory
      })
    }).filter(photo => photo.current_count <= inventoryThreshold && (!showPriorityOnly || (showPriorityOnly && photo.is_needed_priority)));

    if (!sortedIds) return tmpFilteredPhotos;

    const photoMap = new Map(tmpFilteredPhotos.map(photo => [photo.id, photo]));
    return sortedIds
      .map(id => photoMap.get(id))
      .filter((photo): photo is IAdminFilterPhoto => photo !== undefined);
  }, [filteredPhotos, sortedIds, inventoryThreshold, editedRecords, showPriorityOnly]);

  useEffect(() => {
    if(photos && sortedIds === null) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- initial list sort, fires one time
      onSortColumn(INITIAL_SORT.key, INITIAL_SORT.direction);
    }
  }, [photos, sortedIds, onSortColumn])

  return (
    <LayoutAdmin>
      <DashboardHeader title='To Do'>
        <Button onClick={() => setShowPriorityOnly(!showPriorityOnly)} additionalClass={!showPriorityOnly ? ["outline-muted"] : []} isDisabled={false}>
          Show Only Priority Items
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
          <InputSearch
            additionalClasses={["lg-full"]}
            searchText={searchText}
            setSearchText={setSearchText}
          />
          {windowBreakPoints.isMaxSmallDesktop && (
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
          )}
          <div className={styles.controls}>
            <Button
              additionalClass={["alert"]}
              onClick={() => {
                setEditedRecords([]);
                setIsEditing(false);
              }}
              isDisabled={!isEditing}
            >
              Cancel
            </Button>
            {isEditing ? (
              <Button
                additionalClass={["icon", "confirm"]}
                onClick={() => {}/*onSave()*/}
                isDisabled={editedRecords.length === 0}
              >
                {editedRecords.some(record => record?.status === "updating") 
                ? <FontAwesomeIcon className={styles['status-badge-loading']} icon={faSpinner} spin /> 
                : <FontAwesomeIcon icon={faFloppyDisk} />}
                Save
              </Button>
            ) : (
              <Button
                additionalClass={["icon"]}
                onClick={() => setIsEditing(true)}
                isDisabled={false}
              >
                <FontAwesomeIcon icon={faEdit} /> Edit
              </Button>
            )}
            
          </div>
        </div>
        {displayedRecords.length > 0 && (
          <div className={`grid ${styles.photos}`}>
            {displayedRecords.map((photo) => {
              const existing = editedRecords.find(record => record.id === photo.id);
              const existingChanges = existing ? existing.changes : null;
              
              return (
                <div className={`col col-md-6 col-xxl-4 ${styles['photo-todo-wrapper']}`} key={`photo_${photo.id}`}>
                  <div className={styles['photo-display']}>
                    <img src={`${photo.url}`} />
                    <span className={`${styles.total} ${photo.needed_count !== 0 && existingChanges?.['tmp_created_count'] === photo.needed_count 
                      ? "confirm"
                      : isEditing && photo.needed_count !== 0
                        ? styles["in-progress"]
                        : ""}`}>
                      {(existingChanges?.['tmp_created_count'] ?? 0) + photo.current_count}
                    </span>
                  </div>
                  <div className={styles['photo-inventory']}>
                    <span className={`${styles.title}${photo.is_needed_priority ? ` ${styles['priority']}` : ''}`}>
                      {photo.title}
                      <FontAwesomeIcon icon={photo.is_needed_priority ? faStar : faStarOutline} />
                    </span>
                    <div className={styles['inventory-details']}>
                      <div className={styles['inventory-count']}>
                        <span>Inventory Needed</span>
                        <CellQuantity
                          isEditing={isEditing}
                          classes={['todo-quantity', existingChanges?.['needed_count'] !== undefined ? "confirm" : "", "inverse"]}
                          originalQuantity={photo.needed_count}
                          quantity={existingChanges?.['needed_count'] !== undefined ? existingChanges['needed_count'] : photo.needed_count}
                          onQuantityChange={({value}) => onUpdateQuantity(photo, value, "needed_count")}
                          keepRevertButtonFormat={true}
                        />
                      </div>
                      <div className={styles['inventory-count']}>
                        <span>Number Made</span>
                        <CellQuantity
                          isEditing={isEditing}
                          classes={['todo-quantity', photo.needed_count !== 0 && existingChanges?.['tmp_created_count'] === photo.needed_count 
                          ? "confirm"
                          : ((existingChanges?.['tmp_created_count'] ?? 999) < photo.needed_count)
                            ? "alert"
                            : "",
                          "inverse"]}
                          originalQuantity={0}
                          quantity={existingChanges?.['tmp_created_count'] ?? 0}
                          onQuantityChange={({value}) => onUpdateQuantity(photo, value, "tmp_created_count")}
                          keepRevertButtonFormat={true}
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
    </LayoutAdmin>
  )  
}

export default AdminToDo;