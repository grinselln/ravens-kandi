import { ICategoryFilterCollection, IPhotoCategory } from "./ICategories";
import { IPhotoSubcategory } from "./ISubcategories";

export interface IPhoto {
  id: number;
  photo_type_id: number | null;
  photo_filename: string;
  title: string | null;
  story: string | null;
  source: string | null;
  views: number;
}

export interface IPublicPhotoFetchData {
  type: Array<number>;
  filters: {
    category_id: number,
  } & ICategoryFilterCollection
}

export interface IPublicQueryPhoto extends IPhoto {
  categories: {
    category_name: string,
    subcategory_names: Array<string>
  }
}

export type IPublicPhotosQueryData = Array<IPublicQueryPhoto>;

export interface ISelectedPhoto extends IPublicQueryPhoto {
  isOdd: boolean;
}

export interface IAdminQueryPhoto extends IPhoto {
  type_title: string;
  missing_type: boolean;
  missing_category: boolean;
  missing_subcategory: boolean;
}

export interface IUploadItem {
  id: number; 
  status: "pending" | "deleting" | "success" | "error";
  errorMessage?: string;
  isDelete?: boolean;
}

export type IAdminPhotosQueryData = Array<IAdminQueryPhoto>;

export interface IAdminPhotoCategories {
  categories: Array<IPhotoCategory>;
  subcategories: Array<IPhotoSubcategory>;
}

export interface IAdminFilterPhoto extends IAdminQueryPhoto, IAdminPhotoCategories {}

export interface IAdminBulkPhotoValidation extends IAdminPhotoCategories {
  title: string | null;
  photo_type_id: number | null;
}

export interface IPhotoAlerts {
  missingType: boolean;
  missingCategory: boolean;
  missingSubcategory: boolean;
}

export interface IUpdatePhoto {
  title: string | null;
  story: string | null;
  source: string | null;
  photo_type_id: number | null,
  categories: Array<number>;
  subcategories: Array<number>;
}

export interface IPhotoCategoryViews {
  title: string;
  totalViews: number;
  totalPhotos: number;
  averageViews?: number;
}

export interface IPhotoCategoryViewsAvg extends IPhotoCategoryViews {
  averageViews: number;
}

export interface IPhotoTopCount extends IPhotoCategory {
  topPhotoCount: number;
}