import { IAdminQueryPhoto, IPhotoQuantities, IQuantityItemEdit } from "@/interfaces/IPhotos";

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

export const getSortedIds = (
  photos: IAdminQueryPhoto[],
  editedRecords: IQuantityItemEdit[], // use your actual edited-record type here
  key: keyof IPhotoQuantities,
  direction: "asc" | "desc"
) => {
  const getValue = (photo: IAdminQueryPhoto) => {
    const edited = editedRecords.find(record => record.id === photo.id)?.changes;

    if (key === "current_count") {
      return (
        (edited?.created_count ?? photo.created_count) -
        (edited?.given_count ?? photo.given_count) -
        (edited?.hidden_count ?? photo.hidden_count) -
        (edited?.taken_count ?? photo.taken_count) -
        (edited?.discard_count ?? photo.discard_count)
      );
    }
    return edited?.[key] ?? photo[key];
  };

  return [...photos]
    .sort((a, b) => {
      const valueOne = getValue(a);
      const valueTwo = getValue(b);
      if (valueOne === valueTwo) return 0;
      const result = valueOne > valueTwo ? 1 : -1;
      return direction === "asc" ? result : -result;
    })
    .map(photo => photo.id);
};
