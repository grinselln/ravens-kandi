export interface IDropDownOption {
  label: string;
  value: string | number;
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
