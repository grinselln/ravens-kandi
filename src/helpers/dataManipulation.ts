import { DynamicNestedObject, RecordObject } from "@/interfaces/IRecords";

export const isObjectEmpty = (obj: DynamicNestedObject| RecordObject): boolean => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};
