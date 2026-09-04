export interface IPhotoType {
  id: number;
  title: string;
  order_index: number;
}

export type IPhotoTypesQueryData = Array<IPhotoType>;

export interface IUpdatePhotoType {
  title: string,
  order?: number
}

export interface IReorderTypeContext {
  previousData: IPhotoTypesQueryData | undefined;
}