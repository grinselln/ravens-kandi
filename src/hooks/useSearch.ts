import { IPhotoCategoriesQueryData } from '@/interfaces/ICategories';
import { IAdminBulkPhotoValidation, IAdminFilterPhoto, IAdminPhotosQueryData, IAdminQueryPhoto } from '@/interfaces/IPhotos';
import { IPhotoSubcategoriesQueryData } from '@/interfaces/ISubcategories';
import { useState, useMemo } from 'react';

interface IUseSearch {
  photos: IAdminPhotosQueryData,  
  photoCategories: IPhotoCategoriesQueryData, 
  photoSubcategories: IPhotoSubcategoriesQueryData
}

export const useSearch = ({photos, photoCategories, photoSubcategories}: IUseSearch) => {
  const [searchText, setSearchText] = useState<string>("");

  const { filteredPhotos, filteredPhotosMap } = useMemo(() => {
    if(photoCategories === undefined || photoSubcategories === undefined) return {
      filteredPhotos: [],
      filteredPhotosMap: new Map()
    }

    const filteredPhotos: Array<IAdminFilterPhoto> = (photos ?? []).filter((photo: IAdminQueryPhoto) => {
      if (photo.title === null) return false;

      const compareTitle = photo.title.toLocaleLowerCase();
      const compareSearch = searchText.toLocaleLowerCase();

      return compareTitle.includes(compareSearch);
    }).map((photo: IAdminQueryPhoto) => {
      return {
        ...photo,
        categories: photoCategories[photo.id] ?? [],
        subcategories: photoSubcategories[photo.id] ?? []
      }
    });

    const filteredPhotosMap = (filteredPhotos ?? []).reduce<Map<number, IAdminBulkPhotoValidation>>((map, obj) => {
      map.set(obj.id, obj);
      return map;
    }, new Map());

    return {filteredPhotos, filteredPhotosMap}

  }, [photos, searchText, photoCategories, photoSubcategories]);

  return {
    searchText,
    setSearchText,
    filteredPhotos,
    filteredPhotosMap
  }
}