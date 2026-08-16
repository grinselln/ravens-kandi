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

export interface IBlankEditSubcategory {
  isNew: boolean
  id: number | string | null;
  title: string;
  order_index: number | null;
  category_id: number | null;
}