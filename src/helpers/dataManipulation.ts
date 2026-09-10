import { DynamicNestedObject, RecordObject } from "@/interfaces/IRecords";

export const isObjectEmpty = (obj: DynamicNestedObject| RecordObject): boolean => {
  return obj && Object.keys(obj).length === 0 && obj.constructor === Object;
};

export const formatClsxClassString = (classes: string[] | undefined, styles: CSSModuleClasses): string[] => {
  return (classes ?? []).map((cls: string) => styles[cls])
}
