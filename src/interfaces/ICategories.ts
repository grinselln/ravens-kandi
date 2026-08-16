import { ISubcategory } from "./ISubcategories";

export interface ICategory {
  id: number;
  title: string;
  trigger_subcategory_id: number | null;
  order_index: number;
}

export interface ICategoriesQueryData {
  groupedCategories: Array<ICategoryQueryGroupedCategory>;
  groupedCategoriesPhotosOnly: Array<ICategoryQueryGroupedCategory>;
  groupedCategoriesMap: Record<string, ICategoryQueryGroupedCategory>;
  options: Array<ICategoryQueryOption>
}

export interface ICategoryQueryGroupedCategory extends ICategory {
  created_at: number;
  subcategories: Array<ICategoryQueryGroupedCategorySubcategory>;
}

export interface ICategoryQueryGroupedCategorySubcategory {
  //id: number | string | null;
  id: number;
  title: string;
  order_index: number;
}

export interface ICategoryQueryTriggerSubcategory {
  triggered_category_id: number;
  triggered_category_title: string;
}

export interface ICategoryQueryOption {
  id: number;
  category_id: number | null;
  trigger_details: ICategoryQueryTriggerSubcategory;
  label: string;
}

interface ICategoryLinkSubcategory {
  triggerSubcategoryCategory: ICategoryQueryGroupedCategory;
  triggerSubcategory: ISubcategory;
}

export interface ICategoryWithLink extends ICategoryQueryGroupedCategory {
  linkedSubcategory?: ICategoryLinkSubcategory;
}

export interface IReorderCategoryContext {
  previousData: ICategoriesQueryData | undefined;
}

export type IEditedCategoryRecord = INewCategoryDraft | IExistingCategoryDraft;

export interface INewCategoryDraft {
  isNew: boolean;
  id: null;
  title: string;
  subcategories: number[];
  newSubcategoryTitles: string[]; 
  order_index: null;
  trigger_subcategory_id: number | null;
}

export interface IExistingCategoryDraft extends ICategoryWithLink {
  isNew: false;
}

export interface IAddCategory {
  title: string;
  subcategories: Array<number>;
  newSubcategoryTitles: Array<string>;
  trigger_subcategory_id: number | null;
}

export interface IEditCategory extends IAddCategory {
  isNew: boolean;
  id: number | null;
  order_index: number;
}

export interface IUpdateCategory {
  title: string; 
  trigger_subcategory_id: number | null;
}

export interface ICategoryFilter {
  subcategory_ids: Array<number>,
}

export interface ICategoryFilterCollection  {
  [categoryId: number]:  ICategoryFilter
}

export interface IPhotoCategory {
  id: number,
  title: string
}

export interface IPhotoCategoriesQueryData  {
  [photoId: number]: Array<IPhotoCategory>
}