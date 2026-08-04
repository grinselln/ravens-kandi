import LayoutAdmin from '@/components/Layout/LayoutAdmin';
import styles from './AdminPhotos.module.scss';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faClose, faTag, faTableCellsLarge, faTableList, faChevronDown, faCheckSquare, faSquare, faSpinner, faCheck, faSquareXmark } from '@fortawesome/free-solid-svg-icons';
import { faEdit, faEye, faImages, faTrashCan } from '@fortawesome/free-regular-svg-icons';
import InputText from '@/components/Input/InputText/InputText';
import { useEffect, useMemo, useState } from 'react';
import InputTextArea from '@/components/Input/InputTextArea/InputTextArea';
import InputDropDown from '@/components/Input/InputDropDown/InputDropDown';
import DashboardHeader from '@/components/Admin/DashboardHeader/DashboardHeader';
import Button from '@/components/Input/Button/Button';
import { fetchPhotoTypes } from '@/api/photoTypes';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import PhotoDetailsModal from '@/components/Admin/Modals/PhotoDetailsModal/PhotoDetailsModal';
import { fetchCategories, fetchPhotoCategories } from '@/api/categories';
import { fetchPhotoSubcategories, fetchSubcategories } from '@/api/subcategories';
import { deletePhoto, fetchPhotos, fetchPhotosAdmin } from '@/api/photos';
import ActionButton from '@/components/Admin/Rows/ActionElements/ActionButton/ActionButton';
import RowAccordion from '@/components/Admin/Rows/RowAccordion/RowAccordion';
import Row from '@/components/Admin/Rows/Row/Row';
import FilterDisplay from '@/components/Shared/FilterDisplay/FilterDisplay';
import { useSearchParams } from 'react-router-dom';

interface IOption {
  label: string;
  value: string;
}

interface IUploadItem {
  id: number; 
  status: "pending" | "deleting" | "success" | "error";
  errorMessage?: string;
  isDelete?: boolean;
}

type SortOption = "" | "alpha" | "viewsA" | "viewsD";

const API_URL = import.meta.env.VITE_API_URL;

const AdminPhotos = () => {
  const queryClient = useQueryClient();
  const [searchParams, setSearchParams] = useSearchParams();
  const filter = searchParams.get('filter');

  const baseUploadUrl = `${API_URL}/uploads/`;
  const [searchText, setSearchText] = useState<string>("");
  const [selectedPhotoTypes, setSelectedPhotoTypes] = useState<Array<number>>([]);
  const [selectedSortOption, setSelectedSortOption] = useState<IOption>({label: "", value: ""});
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<any>({});
  const [selectedSubcategories, setSelectedSubcategories] = useState<Array<number>>([]);
  const [selectedBulkEdit, setSelectedBulkEdit] = useState<Array<IUploadItem>>([]);
  const [selectedAlerts, setSelectedAlerts] = useState<any>({missingType: false, missingCategory: false, missingSubcategory: false})
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedEditPhotos, setSelectedEditPhotos] = useState<Array<any>>([]);
  const [isBulkEdit, setIsBulkEdit] = useState<boolean>(false);

  const sortOptions: Array<IOption> = [
    {
      label: "Alphabetical",
      value: "alpha"
    },
    {
      label: "Most Viewed",
      value: "viewsD"
    },
    {
      label: "Least Viewed",
      value: "viewsA"
    }
  ]

  const isSortOption = (value: string): value is SortOption => {
    return ["", "alpha", "viewsA", "viewsD"].includes(value);
  };

  const { data: photos } = useQuery({
    queryKey: ['photos', selectedPhotoTypes, selectedCategoryFilters, 
      selectedAlerts.missingType, selectedAlerts.missingCategory, selectedAlerts.missingSubcategory, 
      selectedSortOption?.value ?? ""],
    queryFn: () => {
      const arrayFilters = Object.entries(selectedCategoryFilters)
      .map(([key, value]) => ({
        category_id: key,
        ...(value ? { ...value } : {})
      }));

      return fetchPhotosAdmin({
        type: selectedPhotoTypes.length > 0 ? selectedPhotoTypes : null,
        filters: arrayFilters.length > 0 ? arrayFilters : null,
        missingType: selectedAlerts.missingType,
        missingCategory: selectedAlerts.missingCategory,
        missingSubcategory: selectedAlerts.missingSubcategory,
        sort: isSortOption(selectedSortOption.value) ? selectedSortOption.value : ""
      })
    },
  });

  const { data: photoCategories } = useQuery({
    queryKey: ['photoCategories'],
    queryFn: fetchPhotoCategories
  });

  const { data: photoSubcategories } = useQuery({
    queryKey: ['photoSubcategories'],
    queryFn: fetchPhotoSubcategories
  });
  
  const { data: photoTypes, isLoading, isError, error } = useQuery({
    queryKey: ['photoTypes'], 
    queryFn: fetchPhotoTypes,
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'], 
    queryFn: fetchCategories,
  });

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories'], 
    queryFn: fetchSubcategories,
  });

  const deleteMutation = useMutation({
    mutationFn: (remove: number) => deletePhoto(remove),
    onError: (error) => {
      console.error('Deletion failed:', error);
    }
  });

  const handleDelete = async () => {
    if (selectedBulkEdit.length === 0) return;

    setSelectedBulkEdit((prev : any) => prev.map((item: any) => ({ ...item, status: "deleting" })));

    const results = await Promise.allSettled(
      selectedBulkEdit.map(async (item) => {
        try {
          await deleteMutation.mutateAsync(item.id);
          setSelectedBulkEdit(prev => prev.map(i =>
            i.id === item.id ? { ...i, status: "success" } : i
          ));
        } catch (err) {
          setSelectedBulkEdit((prev: any) => prev.map((i: any) =>
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
      setIsBulkEdit(false);
      setSelectedBulkEdit([]);
    }
  };

  const handleBulkAdd = (photo: any) => {
    if (!photo || selectedBulkEdit.some((item: any) => item.id === photo.id)) return;

    const pendingPhoto = {
      id: photo.id,
      status: "pending" as const,
      isDelete: photo.isDelete,
    }

    setSelectedBulkEdit(prev => [...prev, pendingPhoto]);
  };

  const { filteredPhotos, filteredPhotosMap } = useMemo(() => {
    if(photoCategories === undefined || photoSubcategories === undefined) return {
      filteredPhotos: [],
      filteredPhotosMap: {}
    }

    const filteredPhotos = (photos ?? []).filter((photo: any) => {
        return photo.title.includes(searchText);
    }).map((photo: any) => {
      return {
        ...photo,
        categories: photoCategories[photo.id] ?? [],
        subcategories: photoSubcategories[photo.id] ?? []
      }
    })

    const filteredPhotosMap = (filteredPhotos ?? []).reduce((map: any, obj: any) => {
      map.set(obj.id, obj);
      return map;
    }, new Map());

    return {filteredPhotos, filteredPhotosMap, photoCategories, photoSubcategories}

  }, [photos, searchText, selectedSortOption, photoCategories, photoSubcategories]);

  const selectedEditPhotosFull = useMemo(() => {
    return filteredPhotos.filter((photo: any) => 
      selectedBulkEdit.some((bulkPhoto: any) => 
        bulkPhoto.id === photo.id));
  }, [selectedBulkEdit]);

  const allItemsEqual = (arr: any) => {
    if (arr.length <= 1) return true;
    const firstItemStr = JSON.stringify(arr[0]);
    return arr.every((item: any) => JSON.stringify(item) === firstItemStr);
  };

  const bulkEditValid = useMemo(() => {
    const selectedBulkPhotos: any = selectedBulkEdit.map((photo: any) => filteredPhotosMap.get(photo.id));
    const categoriesEqual = allItemsEqual(selectedBulkPhotos?.categories ?? []);
    const subcategoriesEqual = allItemsEqual(selectedBulkPhotos?.subcategories ?? []);

    return selectedBulkPhotos.every((photo: any) => {
      return photo.title === selectedBulkPhotos[0].title
      && photo.photo_type_id === selectedBulkPhotos[0].photo_type_id
      && categoriesEqual
      && subcategoriesEqual
    });

  }, [selectedBulkEdit, filteredPhotosMap]);

  const getMissingData = (photo: any) => {
    const missingType = photo.photo_type_id === null;
    const missingCategories = photoCategories?.[photo.id] === undefined;
    const missingSubcategories = photoSubcategories?.[photo.id] === undefined;
    return {
      missingType,
      missingCategories,
      missingSubcategories,
      hasMissingData: missingType || missingCategories || missingSubcategories
    }
  }

  useEffect(() => {
    if(selectedBulkEdit.length === 1 && selectedBulkEdit[0].isDelete && selectedBulkEdit[0].status === "pending") {
      handleDelete();
    }
  }, [selectedBulkEdit]);

  useEffect(() => {
    if(filter) {
      switch (filter) {
        case "unassigned":
          setSelectedAlerts({
            missingType: true,
            missingCategory: true,
            missingSubcategory: true
          });
          break;
        case "viewsD":
          setSelectedSortOption({
            label: "Most Viewed",
            value: "viewsD"
          });
          break;
        default:
          break;
      }

      const newParams = new URLSearchParams(searchParams);
      newParams.delete('filter');
      setSearchParams(newParams);
    }
  }, [filter]);
  
  return (
    <LayoutAdmin>
      <DashboardHeader title='Photos'>
        <Button onClick={() => setIsAddModalOpen(true)} isDisabled={false}>
          <FontAwesomeIcon icon={faPlus} /> Add Photos
        </Button>
      </DashboardHeader>

      <div className={styles['photos-wrapper']}>
        <div className={styles['filters-wrapper']}>
          <div className={styles['top-filters']}>
            <div className={styles.search}>
              <InputText
                wrapperClass='inverse'
                placeholder='Search by title...'
                value={searchText}
                setValue={(newValue) => setSearchText(newValue)}
              />
            </div>
            <div className={styles['base-filters']}>
              <div className={styles.types}>
                {(photoTypes ?? []).map((type: any) => {
                  const isSelected = selectedPhotoTypes.includes(type.id);

                  return (
                    <Button
                      key={`type_${type.id}`}
                      additionalClass={isSelected ? "muted" : "outline-muted"}
                      onClick={() => {
                        if(isSelected) {
                          setSelectedPhotoTypes((prev: any) => prev.filter((prevType: any) => prevType !== type.id));
                        } else {
                          setSelectedPhotoTypes((prev: any) => [...prev, type.id]);
                        }
                      }}
                      isDisabled={false}>
                        {type.title}
                      </Button>
                  )
                })}
              </div>
              <div className={styles.sort}>
                <InputDropDown
                  isInverseLight={true}
                  placeholder='Sort by'
                  value={selectedSortOption?.value ?? ""}
                  setValue={(selectedOption) => { setSelectedSortOption(selectedOption)}}
                  options={sortOptions}
                  isDisabled={false}
                  isMedium={true}
                  allowRemoval={true}
                />
              </div>
            </div>
          </div>
          <RowAccordion
            isOpenDefault={true}
            header={(isOpen, onToggle, isInverse) => 
              <Row
                isSimple={true}
                isOrderingDisabled={true}
                isOrderingHidden={true}
                title={<h3>Search by categories</h3>} 
                order={null} 
                isAccordion={true} 
                isOpen={isOpen} 
                accordionToggle={onToggle}
                actionElements={null}
              />
            }
          >
            <div className={styles['categories-wrapper']}>
              <FilterDisplay
                categoryData={categories}
                selectedCategoryFilters={selectedCategoryFilters}
                setSelectedCategoryFilters={setSelectedCategoryFilters}
                isAdmin={true}
              />
            </div>

          </RowAccordion>
          <div className={styles['bottom-filters']}>
            <div className={styles['missing-filters']}>
              <div className={styles['missing-option']}>
                <Button
                  additionalClass="no-style"
                  onClick={() => setSelectedAlerts((prev: any) => ({...prev, missingType: !selectedAlerts.missingType}))} 
                  isDisabled={false}
                  >
                  <span className={`${styles['checkbox-select']}${selectedAlerts.missingType ? ` ${styles.selected}` : ""}`}>
                    <FontAwesomeIcon icon={selectedAlerts.missingType ? faCheckSquare : faSquare} />
                    Missing type
                  </span>
                </Button>
              </div>
              <div className={styles['missing-option']}>
                  <Button
                    additionalClass="no-style"
                    onClick={() => setSelectedAlerts((prev: any) => ({...prev, missingCategory: !selectedAlerts.missingCategory}))} 
                    isDisabled={false}
                    >
                    <span className={`${styles['checkbox-select']}${selectedAlerts.missingCategory ? ` ${styles.selected}` : ""}`}>
                      <FontAwesomeIcon icon={selectedAlerts.missingCategory ? faCheckSquare : faSquare} />
                      Missing categories
                    </span>
                  </Button>
              </div>
              <div className={styles['missing-option']}>
                  <Button
                    additionalClass="no-style"
                    onClick={() => setSelectedAlerts((prev: any) => ({...prev, missingSubcategory: !selectedAlerts.missingSubcategory}))} 
                    isDisabled={false}
                    >
                    <span className={`${styles['checkbox-select']}${selectedAlerts.missingSubcategory ? ` ${styles.selected}` : ""}`}>
                      <FontAwesomeIcon icon={selectedAlerts.missingSubcategory ? faCheckSquare : faSquare} />
                      Missing subcategories
                    </span>
                  </Button>
              </div>
            </div>

            <div className={`${styles['bulk-edit']}${isBulkEdit ? ` ${styles['edit-active']}` : ""}`}>
              <Button additionalClass='outline-muted' onClick={() => {
                setIsBulkEdit(!isBulkEdit);
                setSelectedBulkEdit([]);
              }} isDisabled={false}>Bulk Select</Button>
              <div className={styles['bulk-controls']}>
                <ActionButton variant='alert' icon={faTrashCan} onAction={() => handleDelete()} isDisabled={(selectedBulkEdit.length === 0 && isBulkEdit) || !isBulkEdit} />
                <ActionButton variant='default' icon={faEdit} onAction={() => {
                  setSelectedEditPhotos(selectedEditPhotosFull)
                  setIsBulkEdit(false);
                }} isDisabled={selectedBulkEdit.length <= 1 || !isBulkEdit || !bulkEditValid} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles['photos-display-wrapper']}>
          {filteredPhotos.length > 0 ? (
            <div className={`grid ${styles.photos}`}>
              {filteredPhotos.map((photo: any) => {
                const missingData = getMissingData(photo);
                const pendingStatus = selectedBulkEdit.find((item: any) => item.id === photo.id);

                return (
                  <div className={`col-3 ${styles['photo-wrapper']}${missingData.hasMissingData ? ` ${styles.alert}` : ""}`} key={`photo_${photo.id}`}>
                    <div className={styles['image-wrapper']}>
                      <img src={`${baseUploadUrl}${photo.photo_filename}`} />
                      <div className={styles.badges}>
                        {getMissingData(photo).hasMissingData && (
                          <div className={styles.alerts}>
                            {getMissingData(photo).missingType && (
                              <FontAwesomeIcon icon={faTag} />
                            )}
                            {getMissingData(photo).missingCategories && (
                              <FontAwesomeIcon icon={faTableCellsLarge} />
                            )}
                            {getMissingData(photo).missingSubcategories && (
                              <FontAwesomeIcon icon={faTableList} />
                            )}
                          </div>
                        )}
                        {!isBulkEdit && (
                          <div className={styles.views}>
                            <span>{photo.views}</span>
                            <FontAwesomeIcon icon={faEye} />
                          </div>
                        )}
                      </div>
                      {isBulkEdit && (
                        <Button
                          additionalClass="no-style"
                          onClick={() => {
                            if(selectedBulkEdit.some((item: any) => item.id === photo.id)) {
                              setSelectedBulkEdit((prev: any) => prev.filter((prevItem:any) => prevItem.id !== photo.id))
                            } else {
                              handleBulkAdd(photo);
                            }
                          }} 
                          isDisabled={false}
                          >
                          <span className={`${styles['checkbox-select']}${selectedBulkEdit.some((item: any) => item.id === photo.id) ? ` ${styles.selected}` : ""}`}>
                            <FontAwesomeIcon icon={selectedBulkEdit.some((item: any) => item.id === photo.id) ? faCheckSquare : faSquare} />
                          </span>
                        </Button>
                      )}
                      {pendingStatus?.status === "error" && isBulkEdit && (
                        <p className={styles['error-badge']}>{photo.errorMessage ?? "Delete failed"}</p>
                      )}
                      {pendingStatus?.status === "deleting" && <FontAwesomeIcon className={styles['status-badge-loading']} icon={faSpinner} spin />}
                    </div>
                    <div className={styles['details-wrapper']}>
                      <h2><span>{photo.photo_type_id ? photo.type_title : "No Type"}</span>{photo.title !== "" ? photo.title : "No title"}</h2>
                      <div className={styles.details}>
                        <div className={styles.subcategories}>
                          {!getMissingData(photo).missingSubcategories ? (
                            photoSubcategories[photo.id].map((subcategory: any) => (
                              <span key={`photoSubcategory_${subcategory.id}`}>{subcategory.title}</span>
                            ))
                          ) : (
                            <p>No subcategories</p>
                          )}
                        </div>
                        <div className={styles.actions}>
                          <ActionButton variant='default' icon={faEdit} onAction={() => setSelectedEditPhotos([photo])} isDisabled={false} />
                            <ActionButton variant='alert' icon={faTrashCan} onAction={() => {
                              handleBulkAdd({...photo, isDelete: true})
                            }} isDisabled={false} />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <p>No photos.</p>
          )}
        </div>
      </div>

      <PhotoDetailsModal
        isOpen={(isAddModalOpen && selectedEditPhotos.length === 0) || selectedEditPhotos.length > 0}
        setIsOpen={setIsAddModalOpen}
        photoTypes={photoTypes ?? []}
        categories={categories?.groupedCategories ?? []}
        subcategories={subcategories ?? []}
        selectedPhotos={selectedEditPhotos}
        setSelectedPhotos={setSelectedEditPhotos}
      />
    </LayoutAdmin>
  );
};

export default AdminPhotos;
