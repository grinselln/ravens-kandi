import { IPhotoCategoriesQueryData } from '@/interfaces/ICategories';
import { IAdminFilterPhoto, IAdminPhotosQueryData } from '@/interfaces/IPhotos';
import { IPhotoSubcategoriesQueryData } from '@/interfaces/ISubcategories';
import { useState, useMemo } from 'react';

export interface ISearchablePhoto {
  id: number;
  title: string | null;
}

export const useSearch = <TPhoto extends ISearchablePhoto>(photos: Array<TPhoto> | undefined) => {
  const [searchText, setSearchText] = useState<string>("");

  const filteredPhotos = useMemo(() => {
    const needle = searchText.toLocaleLowerCase();

    return (photos ?? []).filter(photo => photo.title?.toLocaleLowerCase().includes(needle) ?? false);
  }, [photos, searchText]);

  return {
    searchText,
    setSearchText,
    filteredPhotos
  }
}

export const useAdminSearch = ({
  photos,
  photoCategories,
  photoSubcategories
}: {
  photos: IAdminPhotosQueryData | undefined;
  photoCategories: IPhotoCategoriesQueryData | undefined;
  photoSubcategories: IPhotoSubcategoriesQueryData | undefined;
}) => {
  const { searchText, setSearchText, filteredPhotos: matched } = useSearch(photos);

  const filteredPhotos = useMemo<Array<IAdminFilterPhoto>>(() => {
    if (!photoCategories || !photoSubcategories) return [];

    return matched.map(photo => ({
      ...photo,
      categories: photoCategories[photo.id] ?? [],
      subcategories: photoSubcategories[photo.id] ?? []
    }))
  }, [matched, photoCategories, photoSubcategories]);

  const filteredPhotosMap = useMemo(() => {
    return new Map(filteredPhotos.map(photo => [photo.id, photo]))
  }, [filteredPhotos]);

  return { searchText, setSearchText, filteredPhotos, filteredPhotosMap}
}