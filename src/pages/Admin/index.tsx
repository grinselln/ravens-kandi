import LayoutAdmin from '@/components/Layout/LayoutAdmin';
import styles from './Admin.module.scss';
import Button from '@/components/Input/Button/Button';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faPlus, faTableCellsLarge, faTableList, faTag } from '@fortawesome/free-solid-svg-icons';
import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { fetchPhotosAdmin } from '@/api/photos';
import { fetchCategories, fetchPhotoCategories } from '@/api/categories';
import { fetchPhotoSubcategories, fetchSubcategories } from '@/api/subcategories';
import { useMemo } from 'react';

const API_URL = import.meta.env.VITE_API_URL;
const API_UPLOAD_DIRECTORY = import.meta.env.VITE_API_UPLOAD_DIRECTORY;

const Admin = () => {
  const queryClient = useQueryClient();

  const baseUploadUrl = `${API_URL}/${API_UPLOAD_DIRECTORY}/`;

  const { data: allPhotos } = useQuery({
    queryKey: ['photos', 'all'],
    queryFn: () => fetchPhotosAdmin({
      type: null,
      filters: null,
      missingType: null,
      missingCategory: null,
      missingSubcategory: null,
      sort: ""
    }),
  });
  
  const { data: unassignedPhotos } = useQuery({
    queryKey: ['photos', 'unassigned'],
    queryFn: () => fetchPhotosAdmin({
      type: null,
      filters: null,
      missingType: true,
      missingCategory: true,
      missingSubcategory: true,
      sort: ""
    }),
  });

  const { data: mostViewedPhotos } = useQuery({
    queryKey: ['photos', 'mostViewed'],
    queryFn: () => fetchPhotosAdmin({
      type: null,
      filters: null,
      missingType: null,
      missingCategory: null,
      missingSubcategory: null,
      sort: "viewsD"
    }),
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

  const { data: subcategories } = useQuery({
    queryKey: ['subcategories'], 
    queryFn: fetchSubcategories,
  });

  const { viewTopPhotos, categoryTopPhotos, categoryViews, subcategoryViews } = useMemo(() => {
    let categoryViewsObj: any = {};
    let subcategoryViewsObj: any = {};
    const viewTopPhotos = (mostViewedPhotos ?? []).filter((photo: any) => photo.views !== 0);

    const triggerSubcategories = [...new Set((categories?.groupedCategories ?? []).map((category: any) => category.trigger_subcategory_id))];

    (allPhotos ?? []).forEach((photo: any) => {
      (photoCategories?.[photo.id] ?? []).forEach((category: any) => {
        const viewData = categoryViewsObj[category.id];
        const currentViews = !!viewData ? viewData.totalViews : 0;
        const currentPhotos = !!viewData ? viewData.totalPhotos : 0;

        categoryViewsObj[category.id] = {
          title: category.title,
          totalViews: currentViews + photo.views,
          totalPhotos: currentPhotos + 1
        }
      });

      (photoSubcategories?.[photo.id] ?? []).forEach((subcategory: any) => {
        const viewData = subcategoryViewsObj[subcategory.id];
        const currentViews = !!viewData ? viewData.totalViews : 0;
        const currentPhotos = !!viewData ? viewData.totalPhotos : 0;

        if(!triggerSubcategories.includes(subcategory.id)) {
          subcategoryViewsObj[subcategory.id] = {
            title: subcategory.title,
            totalViews: currentViews + photo.views,
            totalPhotos: currentPhotos + 1
          }
        }
      });
    });

    const categoryViews = Object.values(categoryViewsObj)
    .filter((category: any) => category.totalViews !== 0)
    .map((category: any) => ({...category, averageViews: category.totalViews / category.totalPhotos === Infinity ? 0 : Math.round(category.totalViews / category.totalPhotos)}))
    .sort((a: any, b: any) => {
      return b.averageViews - a.averageViews
    }).slice(0, 5);

    const subcategoryViews = Object.values(subcategoryViewsObj)
    .filter((subcategory: any) => subcategory.totalViews !== 0)
    .map((subcategory: any) => ({...subcategory, averageViews: subcategory.totalViews / subcategory.totalPhotos === Infinity ? 0 : Math.round(subcategory.totalViews / subcategory.totalPhotos)}))
    .sort((a: any, b: any) => {
      return b.averageViews - a.averageViews
    }).slice(0, 5);

    const topFivePhotos = (viewTopPhotos ?? []).slice(0, 5);
    let categoryTopPhotosObj: any = {};

    topFivePhotos.forEach((photo: any) => {
      const categoryList = photoCategories?.[photo.id] ?? [];

      categoryList.forEach((category: any) => {
        const categoryOrder = categories?.groupedCategoriesMap?.[category.id]?.order_index ?? 0;
        const currentPhotoCount = !!categoryTopPhotosObj[category.id] ? categoryTopPhotosObj[category.id].topPhotoCount : 0;

        if(categoryOrder !== 0) {
          categoryTopPhotosObj[category.id] = {
            ...category,
            topPhotoCount: currentPhotoCount + 1
          }
        }
      })
    });

    const categoryTopPhotos = Object.values(categoryTopPhotosObj)
    .sort((a: any, b: any) => b.topPhotoCount - a.topPhotoCount);

    return {
      viewTopPhotos: viewTopPhotos ?? [], 
      categoryTopPhotos: categoryTopPhotos ?? [],
      categoryViews: categoryViews ?? [], 
      subcategoryViews: subcategoryViews ?? []
    };
  }, [allPhotos, photoCategories, photoSubcategories, categories?.groupedCategories, categories?.groupedCategoriesMap, mostViewedPhotos]);

  return (
    <LayoutAdmin>
      <div className={styles['admin-wrapper']}>
        <div className='grid'>
          <div className='col-6 col-lg-3'>
            <div className={styles['stat-box']}>
              <span className={styles.header}>Total Photos</span>
              <span className={styles.count}>{allPhotos?.length ?? 0}</span>
            </div>
          </div>
          <div className='col-6 col-lg-3'>
            <div className={`${styles['stat-box']} ${styles['alert']}`}>
              <span className={styles.header}>Unassigned Photos</span>
              <span className={styles.count}>{unassignedPhotos?.length ?? 0}</span>
            </div>
          </div>
          <div className='col-6 col-lg-3'>
            <div className={`${styles['stat-box']}`}>
              <span className={styles.header}>Categories</span>
              <span className={styles.count}>{(categories?.groupedCategories?.length ?? 1) - 1}</span>
            </div>
          </div>
          <div className='col-6 col-lg-3'>
            <div className={styles['stat-box']}>
              <span className={styles.header}>Subcategories</span>
              <span className={styles.count}>{subcategories?.length ?? 0}</span>
            </div>
          </div>
        </div>
        {/*<div className={styles.add}>
          <Button onClick={() => {}} isDisabled={false}>
            <span className={styles['button-content-wrapper']}><FontAwesomeIcon icon={faPlus} /><span className={styles['button-text']}>Add Photos</span></span>
          </Button>
          <Button additionalClass='muted' onClick={() => {}} isDisabled={false}>
            <span className={styles['button-content-wrapper']}><FontAwesomeIcon icon={faPlus} /><span className={styles['button-text']}>Add Types</span></span>
          </Button>
          <Button additionalClass='muted' onClick={() => {}} isDisabled={false}>
            <span className={styles['button-content-wrapper']}><FontAwesomeIcon icon={faPlus} /><span className={styles['button-text']}>Add Categories</span></span>
          </Button>
          <Button additionalClass='muted' onClick={() => {}} isDisabled={false}>
            <span className={styles['button-content-wrapper']}><FontAwesomeIcon icon={faPlus} /><span className={styles['button-text']}>Add Subcategories</span></span>
          </Button>
        </div>*/}
        <div className={styles['photo-display']}>
          <div className={styles.header}>
            <h2>Unassigned photos</h2>
            <Link to={'/admin/photos?filter=unassigned'}>View all</Link>
          </div>
          {(unassignedPhotos ?? []).length === 0 && (
            <p>No unassigned photos.</p>
          )}
          <div className={styles.photos}>
            {(unassignedPhotos ?? []).map((photo: any) => {
              const hasMissingData = !!photo.missing_type || !!photo.missing_category || !!photo.missing_subcategory;
              return (
                <div className={`${styles.photo} ${hasMissingData ? ` ${styles.alert}` : ""}`} key={`photoMissing_${photo.id}`}>
                  <img src={`${baseUploadUrl}${photo.photo_filename}`} />
                  <div className={styles.badges}>
                    {hasMissingData && (
                      <div className={styles.alerts}>
                        {!!photo.missing_type && (
                          <FontAwesomeIcon icon={faTag} />
                        )}
                        {!!photo.missing_category && (
                          <FontAwesomeIcon icon={faTableCellsLarge} />
                        )}
                        {!!photo.missing_subcategory && (
                          <FontAwesomeIcon icon={faTableList} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className={styles['photo-display']}>
          <div className={styles.header}>
            <h2>Most viewed photos</h2>
            <Link to={'/admin/photos?filter=viewsD'}>View all</Link>
          </div>
          {(viewTopPhotos).length === 0 && (
            <p>No photos.</p>
          )}
          <div className={styles.photos}>
            {(viewTopPhotos).map((photo: any) => {
              return (
                <div className={`${styles.photo}`} key={`photoView_${photo.id}`}>
                  <img src={`${baseUploadUrl}${photo.photo_filename}`} />
                  <div className={styles.badges}>
                    <div className={styles.views}>
                        <span>{photo.views}</span>
                        <FontAwesomeIcon icon={faEye} />
                      </div>
                  </div>
                </div>
              )
            })}
          </div>
          {categoryTopPhotos.length > 0 && (
            <div className={styles['category-wrapper']}>
              <h3>
                Top Photo Categories
              </h3>
              <div className={styles['category-views']}>
                {(categoryTopPhotos).map((category: any) => (
                  <span className={styles['category-view']}>
                    <span>{category.title}</span>
                    <span className={styles.views}>{category.topPhotoCount}</span>
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className={styles['category-display']}>
          <h2>Most viewed categories & subcategories</h2>
          <div className={styles['category-wrapper']}>
            <h3>
              Categories
            </h3>
            <div className={styles['category-views']}>
              {(categoryViews).map((category: any) => (
                <span className={styles['category-view']}>
                  <span>{category.title}</span>
                  <span className={styles.views}>{category.averageViews}</span>
                </span>
              ))}
              {categoryViews.length === 0 && (
                <p>No data.</p>
              )}
            </div>
          </div>
          <div className={styles['category-wrapper']}>
            <h3>
              Subcategories
            </h3>
            <div className={styles['category-views']}>
              {(subcategoryViews).map((subcategory: any) => (
                <span className={styles['category-view']}>
                  <span>{subcategory.title}</span>
                  <span className={styles.views}>{subcategory.averageViews}</span>
                </span>
              ))}
              {subcategoryViews.length === 0 && (
                <p>No data.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </LayoutAdmin>
  );
};

export default Admin;
