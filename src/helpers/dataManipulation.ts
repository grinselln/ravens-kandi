export const isObjectEmpty = (obj: object | null | undefined): boolean => {
  return (
    obj != null &&
    Object.keys(obj).length === 0 &&
    obj.constructor === Object
  );
};

export const formatClsxClassString = (classes: string[] | undefined, styles: CSSModuleClasses): string[] => {
  return (classes ?? []).map((cls: string) => styles[cls])
}
