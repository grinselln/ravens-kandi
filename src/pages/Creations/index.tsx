import { fetchPhotoTypes } from "@/api/photoTypes";
import Layout from "@/components/Layout/Layout";
import PageHeader from "@/components/User/PageHeader/PageHeader";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import styles from './Creations.module.scss';
import Button from "@/components/Input/Button/Button";
import { fetchCategories } from "@/api/categories";
import { useEffect, useMemo, useState } from "react";
import FilterDisplay from "@/components/Shared/FilterDisplay/FilterDisplay";
import { fetchPhotos, updateViews } from "@/api/photos";
import ViewPhotoModal from "@/components/User/ViewPhotoModal/ViewPhotoModal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faChevronDown, faChevronUp, faDiamond, faDiamondTurnRight, faSpinner, faSquare } from "@fortawesome/free-solid-svg-icons";
import { useWindowWidth } from "@/hooks/useWindowWidth";
import ActionButton from "@/components/Admin/Rows/ActionElements/ActionButton/ActionButton";

interface IPhotoType {
  id: number;
  title: string;
  order_index: number;
}

const API_URL = import.meta.env.VITE_API_URL;
const API_UPLOAD_DIRECTORY = import.meta.env.VITE_API_UPLOAD_DIRECTORY;

const Creations = () => {
  const baseUploadUrl = `${API_URL}/${API_UPLOAD_DIRECTORY}/`;
  const queryClient = useQueryClient();
  const {windowBreakPoints} = useWindowWidth();

  const [selectedPhotoTypes, setSelectedPhotoTypes] = useState<Array<number>>([]);
  //const [selectedSortOption, setSelectedSortOption] = useState<IOption>({label: "", value: ""});
  const [selectedCategoryFilters, setSelectedCategoryFilters] = useState<any>({});
  const [selectedPhoto, setSelectedPhoto] = useState<any>(null);

  const { data: photos, isLoading: photoLoading } = useQuery({
    queryKey: ['photos', selectedPhotoTypes, selectedCategoryFilters/*, selectedSortOption?.value ?? ""*/],
    queryFn: () => {
      const arrayFilters = Object.entries(selectedCategoryFilters)
      .map(([key, value]) => ({
        category_id: key,
        ...(value ? { ...value } : {})
      }));

      return fetchPhotos({
        type: selectedPhotoTypes.length > 0 ? selectedPhotoTypes : null,
        filters: arrayFilters.length > 0 ? arrayFilters : null
        //sort: isSortOption(selectedSortOption.value) ? selectedSortOption.value : ""
      })
    },
    placeholderData: keepPreviousData,
  });

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['photoTypes'], 
    queryFn: fetchPhotoTypes,
  });

  const { data: categoryData } = useQuery({
    queryKey: ['categories'], 
    queryFn: fetchCategories,
  });

  const updateMutation = useMutation({
    mutationFn: (id: number) => updateViews(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['photos'] });
    },
    onError: (error) => {
      console.error('Update failed:', error);
    }
  });

  const noFiltersSelected = useMemo(() => {
    return Object.keys(selectedCategoryFilters).length === 0
  }, [selectedPhotoTypes, selectedCategoryFilters]);

  const [activeId, setActiveId] = useState<number | null>(null);

  useEffect(() => {
    if (activeId === null) return;

    if (!windowBreakPoints.isMobile) {
      setActiveId(null);
      return;
    }

    const handleDropDownMouseDown = (e: MouseEvent) => { 
      const target = e.target as HTMLElement;
      const clickedCard = target.closest('[data-card-id]');

      if (!clickedCard) {
        // click landed outside every card — close it
        setActiveId(null);
      }
    }

    document.addEventListener('click', handleDropDownMouseDown);
    return () => document.removeEventListener('click', handleDropDownMouseDown);
  }, [activeId, windowBreakPoints.isMobile]);
  
  return (
    <Layout>
      <PageHeader 
        title="Creations" 
        subtitle="handmade kandi & perlers" 
        secondarySubtitle="all original designs unless noted otherwise"
      />

      <div className={styles['filter-types']}>
        <Button additionalClass={selectedPhotoTypes.length === 0 ? "accent" : "accent-outline"} isDisabled={false} onClick={() => {setSelectedPhotoTypes([])}}>All</Button>
        {(data ?? []).map((photoType: IPhotoType) => {
          const isSelected = selectedPhotoTypes.includes(photoType.id);
        
          return (
            <Button key={`photoType_${photoType.id}`} additionalClass={isSelected ? "accent" : "accent-outline"} isDisabled={false}
              onClick={() => {
                if(isSelected) {
                  setSelectedPhotoTypes((prev: any) => prev.filter((prevItem: any) => prevItem !== photoType.id))
                }
                else {
                  setSelectedPhotoTypes((prev: any) => [...prev, photoType.id])}}
                }
              >
              {photoType.title}
            </Button>
          )
        })}
      </div>
      <FilterDisplay
        isAdmin={false}
        categoryData={categoryData}
        selectedCategoryFilters={selectedCategoryFilters}
        setSelectedCategoryFilters={setSelectedCategoryFilters}
      />
      <div className={styles['photos-wrapper']}>
        <div className={styles['count-wrapper']}>
          <span className={styles.count}>{photos?.length ?? 0} photo{photos?.length === 1 ? "" : "s"}</span>
          <Button 
          additionalClass="pill-square"
          onClick={() => {
            setSelectedCategoryFilters({});
          }}
          isDisabled={noFiltersSelected}
          >Clear Filters</Button>
        </div>
        <div className={`grid ${styles['photo-display-wrapper']}`}>
          {photoLoading ? (
            <div className={`col ${styles.loading}`}>
              <span className={`${styles['loading-icon']}`}>
                <FontAwesomeIcon icon={faSpinner} spin />
              </span>
            </div>
          ) : (
            (photos ?? []).map((photo: any, idx: number) => {

              return (
                <div className={`col-6 col-md-4 col-xl-3 ${styles['photo-wrapper']}${activeId === photo.id ? ` ${styles.active}` : ''}`} key={`photo_${photo.id}`}
                data-card-id={photo.id}  
                onClick={() => {
                    if (windowBreakPoints.isMobile) { 
                      setActiveId(prev => prev === photo.id ? null : photo.id) 
                    }
                  }
                }
                >
                  <div className={styles.overlay}>
                    {photo.title && (
                      <span className={styles.title}>{photo.title}</span>
                    )}
                    <Button onClick={() => {
                      setSelectedPhoto({...photo, isOdd: idx % 2 !== 0});
                      updateMutation.mutate(photo.id);
                    }} isDisabled={false}>View Details</Button>
                  </div>
                  <img src={`${baseUploadUrl}${photo.photo_filename}`} />
                </div>
              )
            })
          )}
        </div>
      </div>

      <ViewPhotoModal
        isOpen={!!selectedPhoto}
        setIsOpen={() => setSelectedPhoto(null)}
        photo={selectedPhoto}
      />
    </Layout>
  );
};

export default Creations;
