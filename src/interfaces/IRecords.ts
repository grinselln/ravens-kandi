export interface IDropDownOption<T> {
  label: string;
  value: T;
}

export interface IAddedBulkRecord {
  title: string;
  value: string | null;
}

export interface IReorderRecord {
  id: number;
  order_index: number;
}

export interface IReorderResponse {
  message: string;
}

export type RecordObject = Record<string | number, string | number | boolean | null>;

export type DynamicNestedObject = {
  [key: string | number]: string | number | boolean | DynamicNestedObject;
};
