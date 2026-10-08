import DashboardHeader from "@/components/Admin/DashboardHeader/DashboardHeader";
import LayoutAdmin from "@/components/Layout/LayoutAdmin";
import styles from "./AdminInventory.module.scss"
import { useMemo, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp, faCheck, faEdit, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchPhotosAdmin, updatePhotoQuantities } from "@/api/photos";
import CellQuantity from "@/components/Table/CellQuantity/CellQuantity";
import Button from "@/components/Input/Button/Button";
import { faFloppyDisk } from "@fortawesome/free-regular-svg-icons";
import { IAdminFilterPhoto, IAdminQueryPhoto, IPhotoQuantities, IQuantityItemEdit } from "@/interfaces/IPhotos";
import { ITableSort } from "@/interfaces/IRecords";
import FilterDisplay from "@/components/Shared/FilterDisplay/FilterDisplay";
import { fetchCategories, fetchPhotoCategories } from "@/api/categories";
import { ICategoryFilterCollection } from "@/interfaces/ICategories";
import InputSearch from "@/components/Input/InputSearch/InputSearch";
import { useSearch } from "@/hooks/useSearch";
import { fetchPhotoSubcategories } from "@/api/subcategories";
import InputDropDown from "@/components/Input/InputDropDown/InputDropDown";
import { useWindowWidth } from "@/hooks/useWindowWidth";

const API_URL = import.meta.env.VITE_API_URL;
const API_UPLOAD_DIRECTORY = import.meta.env.VITE_API_UPLOAD_DIRECTORY;

const AdminInventory = () => {
  const baseUploadUrl = `${API_URL}/${API_UPLOAD_DIRECTORY}/`;
  const queryClient = useQueryClient();
  const { windowBreakPoints } = useWindowWidth();

  const [showMarkedOnly, setShowMarkedOnly] = useState<boolean>(false);
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<ICategoryFilterCollection>({});
  const [sortedIds, setSortedIds] = useState<number[] | null>(null);
  const [columnSort, setColumnSort] = useState<ITableSort<keyof IPhotoQuantities> | null>(null);
  const [editedRecords, setEditedRecords] = useState<IQuantityItemEdit[]>([]);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  type SortDirection = ITableSort["direction"];
  type SortValue = `${keyof IPhotoQuantities}|${SortDirection}`;

  const sortOptions: { value: SortValue; label: string }[] = [
    {
      value: "current_count|asc",
      label: "Current Ascending"
    },
    {
      value: "current_count|desc",
      label: "Current Descending"
    },
    {
      value: "created_count|asc",
      label: "Created Ascending"
    },
    {
      value: "created_count|desc",
      label: "Created Descending"
    },
    {
      value: "given_count|asc",
      label: "Given Ascending"
    },
    {
      value: "given_count|desc",
      label: "Given Descending"
    },
    {
      value: "hidden_count|asc",
      label: "Hidden Ascending"
    },
    {
      value: "hidden_count|desc",
      label: "Hidden Descending"
    },
    {
      value: "marked_count|asc",
      label: "Marked Ascending"
    },
    {
      value: "marked_count|desc",
      label: "Marked Descending"
    },
    {
      value: "taken_count|asc",
      label: "Taken Ascending"
    },
    {
      value: "taken_count|desc",
      label: "Taken Descending"
    },
    {
      value: "discard_count|asc",
      label: "Discard Ascending"
    },
    {
      value: "discard_count|desc",
      label: "Discard Descending"
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

  const { searchText, setSearchText, filteredPhotos } = useSearch({photos: photos ?? [], photoCategories: photoCategories ?? [], photoSubcategories: photoSubcategories ?? []});

  const updateMutation = useMutation({
    mutationFn: (updates: {
      id: number, 
      data: Partial<IPhotoQuantities>
    }) => updatePhotoQuantities(updates.id, updates.data),
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
          await updateMutation.mutateAsync(
            {
              id: item.id,
              data: {
                ...item.changes
              }
            }
          );

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

  const onSortColumn = (key: keyof IPhotoQuantities | null, tempDirection?: "asc" | "desc" | undefined) => {
    if (!photos) return;

    const sortDirection = tempDirection ? tempDirection : columnSort?.direction;

    const direction: "asc" | "desc" | null =
      columnSort?.key === key && sortDirection === "asc" 
        ? "desc" 
        : columnSort?.key === key && sortDirection === "desc"
          ? null
          : "asc";

    if (key === null || direction === null) {
      setSortedIds(null);
      setColumnSort(null);
      return;
    }

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
  };

  const parseSortValue = (value: SortValue): ITableSort<keyof IPhotoQuantities> => {
    const [key, direction] = value.split("|") as [keyof IPhotoQuantities, SortDirection];
    return { key, direction };
  };

  const selectedDropdownOption = useMemo(() => {
    if (columnSort === null) return null;

    return `${columnSort.key}|${columnSort.direction}` as SortValue;
  }, [columnSort]);

  const displayedRecords = useMemo(() => {
    if (!filteredPhotos) return [];

    const tmpFilteredPhotos = filteredPhotos.filter(photo => !showMarkedOnly || (showMarkedOnly && photo.marked_count > 0));

    if (!sortedIds) return tmpFilteredPhotos;

    const photoMap = new Map(tmpFilteredPhotos.map(photo => [photo.id, photo]));
    return sortedIds
      .map(id => photoMap.get(id))
      .filter((photo): photo is IAdminFilterPhoto => photo !== undefined);
  }, [filteredPhotos, sortedIds, showMarkedOnly]);
  
  return (
    <LayoutAdmin>
      <DashboardHeader title='Inventory'>
        <Button onClick={() => setShowMarkedOnly(!showMarkedOnly)} additionalClass={!showMarkedOnly ? ["outline-muted"] : []} isDisabled={false}>
          Show Only Marked Photos
        </Button>
      </DashboardHeader>

      <div className={styles['inventory-wrapper']}>
        <FilterDisplay
            categoryData={categories}
            selectedCategoryFilters={selectedCategoryFilters}
            setSelectedCategoryFilters={setSelectedCategoryFilters}
            isAdmin={true}
            defaultClosed={true}
          />
        <div className={styles['table-filters']}>
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
                const newValue = newOption ? parseSortValue(newOption.value) : null;

                onSortColumn(newValue?.key ?? null, newValue?.direction)
              }}
              options={sortOptions}
              allowRemoval={true}
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
                onClick={() => onSave()}
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
        <div className={styles['inventory-table']}>
          <table>
            <thead>
              <tr>
                <th>
                  <div className={styles.header} onClick={() => onSortColumn("current_count")}>
                    <span>Photo</span>
                    {columnSort?.key === "current_count" && (
                      <FontAwesomeIcon icon={columnSort.direction === "asc" ? faAngleUp : faAngleDown} />
                    )}
                  </div>
                </th>
                <th>Title</th>
                <th>
                  <div className={styles.header} onClick={() => onSortColumn("created_count")}>
                    <span>Created</span>
                    {columnSort?.key === "created_count" && (
                      <FontAwesomeIcon icon={columnSort.direction === "asc" ? faAngleUp : faAngleDown} />
                    )}
                  </div>
                </th>
                <th>
                  <div className={styles.header} onClick={() => onSortColumn("given_count")}>
                    <span>Given</span>
                    {columnSort?.key === "given_count" && (
                      <FontAwesomeIcon icon={columnSort.direction === "asc" ? faAngleUp : faAngleDown} />
                    )}
                  </div>
                </th>
                <th>
                  <div className={styles.header} onClick={() => onSortColumn("hidden_count")}>
                    <span>Hidden</span>
                    {columnSort?.key === "hidden_count" && (
                      <FontAwesomeIcon icon={columnSort.direction === "asc" ? faAngleUp : faAngleDown} />
                    )}
                  </div>
                </th>
                <th>
                  <div className={styles.header} onClick={() => onSortColumn("marked_count")}>
                    <span>Marked</span>
                    {columnSort?.key === "marked_count" && (
                      <FontAwesomeIcon icon={columnSort.direction === "asc" ? faAngleUp : faAngleDown} />
                    )}
                  </div>
                </th>
                <th>
                  <div className={styles.header} onClick={() => onSortColumn("taken_count")}>
                    <span>Taken</span>
                    {columnSort?.key === "taken_count" && (
                      <FontAwesomeIcon icon={columnSort.direction === "asc" ? faAngleUp : faAngleDown} />
                    )}
                  </div>
                </th>
                <th>
                  <div className={styles.header} onClick={() => onSortColumn("discard_count")}>
                    <span>Broken</span>
                    {columnSort?.key === "discard_count" && (
                      <FontAwesomeIcon icon={columnSort.direction === "asc" ? faAngleUp : faAngleDown} />
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className={displayedRecords.length === 0 ? styles.empty : ""}>
              {displayedRecords.length > 0 ? (
                displayedRecords.map((photo, idx) => {
                  const existing = editedRecords.find(record => record.id === photo.id);
                  const existingChanges = existing ? existing.changes : null;
                  const inventory = (existingChanges?.created_count ?? photo.created_count) 
                  - (existingChanges?.given_count ?? photo.given_count) 
                  - (existingChanges?.hidden_count ?? photo.hidden_count) 
                  - (existingChanges?.taken_count ?? photo.taken_count) 
                  - (existingChanges?.discard_count ?? photo.discard_count);

                  return (
                    <tr key={`row_${photo.id}`}>
                      <td className={`${styles.fit} ${styles.image}`}>
                        <img src={`${baseUploadUrl}${photo.photo_filename}`} />
                        <span className={`${styles.total}${inventory < 0 ? ` ${styles.alert}` : ""}`}>{inventory}</span>
                        {existing?.status === "error" && (
                          <span className={styles['error-badge']}>{existing?.errorMessage ?? "Update Failed"}</span>
                        )}
                        {existing?.status === "updating" && <FontAwesomeIcon className={styles['status-badge-loading']} icon={faSpinner} spin />}
                        {existing?.status === "success" && <FontAwesomeIcon className={styles['status-badge-success']} icon={faCheck} />}
                      </td>
                      <td className={styles.title}>{photo.title}</td>
                      <td className={styles.fit} data-label="Created">
                        <CellQuantity
                          isEditing={isEditing}
                          classes={[existingChanges?.['created_count'] !== undefined ? "confirm" : "", idx % 2 === 0 ? "inverse" : ""]}
                          originalQuantity={photo.created_count}
                          quantity={existingChanges?.['created_count'] !== undefined ? existingChanges['created_count'] : photo.created_count}
                          onQuantityChange={({value}) => onUpdateQuantity(photo, value, "created_count")}
                        />
                      </td>
                      <td className={styles.fit} data-label="Given">
                        <CellQuantity
                          isEditing={isEditing}
                          classes={[existingChanges?.['given_count'] !== undefined ? "confirm" : "", idx % 2 === 0 ? "inverse" : ""]}
                          originalQuantity={photo.given_count}
                          quantity={existingChanges?.['given_count'] !== undefined ? existingChanges['given_count'] : photo.given_count}
                          onQuantityChange={({value}) => onUpdateQuantity(photo, value, "given_count")}
                        />
                      </td>
                      <td className={styles.fit} data-label="Hidden">
                        <CellQuantity
                          isEditing={isEditing}
                          classes={[existingChanges?.['hidden_count'] !== undefined ? "confirm" : "", idx % 2 === 0 ? "inverse" : ""]}
                          originalQuantity={photo.hidden_count}
                          quantity={existingChanges?.['hidden_count'] !== undefined ? existingChanges['hidden_count'] : photo.hidden_count}
                          onQuantityChange={({value, changeSource}) => {
                            const currentMarkedCount = existingChanges?.['marked_count'] !== undefined ? existingChanges['marked_count'] : photo.marked_count;
                            onUpdateQuantity(photo, value, "hidden_count")
                            onUpdateQuantity(photo, currentMarkedCount > 0 ? currentMarkedCount - changeSource : 0, "marked_count");
                          }}
                        />
                      </td>
                      <td className={styles.fit} data-label="Marked">
                        <CellQuantity
                          isEditing={isEditing}
                          classes={[existingChanges?.['marked_count'] !== undefined ? "confirm" : "", idx % 2 === 0 ? "inverse" : ""]}
                          originalQuantity={photo.marked_count}
                          quantity={existingChanges?.['marked_count'] !== undefined ? existingChanges['marked_count'] : photo.marked_count}
                          onQuantityChange={({value}) => onUpdateQuantity(photo, value, "marked_count")}
                        />
                      </td>
                      <td className={styles.fit} data-label="Taken">
                        <CellQuantity
                          isEditing={isEditing}
                          classes={[existingChanges?.['taken_count'] !== undefined ? "confirm" : "", idx % 2 === 0 ? "inverse" : ""]}
                          originalQuantity={photo.taken_count}
                          quantity={existingChanges?.['taken_count'] !== undefined ? existingChanges['taken_count'] : photo.taken_count}
                          onQuantityChange={({value}) => onUpdateQuantity(photo, value, "taken_count")}
                        />
                      </td>
                      <td className={styles.fit} data-label="Broken">
                        <CellQuantity
                          isEditing={isEditing}
                          classes={[existingChanges?.['discard_count'] !== undefined ? "confirm" : "", idx % 2 === 0 ? "inverse" : ""]}
                          originalQuantity={photo.discard_count}
                          quantity={existingChanges?.['discard_count'] !== undefined ? existingChanges['discard_count'] : photo.discard_count}
                          onQuantityChange={({value}) => onUpdateQuantity(photo, value, "discard_count")}
                        />
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td>
                    <span>No photos</span>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </LayoutAdmin>
  )
}

export default AdminInventory;