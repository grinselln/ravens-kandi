export interface ISubcategory {
  id: number;
  category_id: number | null;
  title: string;
  order_index: number; 
}


export interface IPhotoSubcategory {
  id: number,
  title: string
}

export interface IPhotoSubcategoriesQueryData  {
  [photoId: number]: Array<IPhotoSubcategory>
}

export interface ISubcategoryUpdateFetchData {
  id: number;
  updatedSubcategory: {
    category_id: number;
    title: string;
    order: number | null; 
  }
}

export type IEditedSubcategoryRecord = INewSubcategoryDraft | IExistingSubcategoryDraft;

export interface INewSubcategoryDraft {
  isNew: true;
  id: string;
  title: string;
  order_index: number | null;
  category_id: number | null;
}

export interface IExistingSubcategoryDraft extends ISubcategory {
  isNew: false;
}

export interface IBlankEditSubcategory {
  isNew: boolean
  id: number | string | null;
  title: string;
  order_index: number | null;
  category_id: number | null;
}