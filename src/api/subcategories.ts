import { IPhotoSubcategoriesQueryData, ISubcategory, ISubcategoryUpdateFetchData } from "@/interfaces/ISubcategories";
import { apiFetch } from "./apiFetch";
import { IAddedBulkRecord, IReorderRecord } from "@/interfaces/IRecords";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchSubcategories = async (): Promise<Array<ISubcategory>> => {
  return apiFetch(`${API_URL}/subcategories`, {requiresAuth: false});
};

export const fetchPhotoSubcategories = async (): Promise<IPhotoSubcategoriesQueryData> => {
  return apiFetch(`${API_URL}/subcategories/photoSubcategories`, {requiresAuth: true});
};

export const addSubcategory = async (data: {category: number; title: string; order: number | null}) => {
  return apiFetch(`${API_URL}/subcategories`, {requiresAuth: true}, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
}

export const addSubcategories = async (records: IAddedBulkRecord[]) => {
  return apiFetch(`${API_URL}/subcategories/bulk`, {requiresAuth: true}, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subcategories: records })
  })
}

export const updateSubcategory = async (data: ISubcategoryUpdateFetchData) => {
  return apiFetch(`${API_URL}/subcategories/${data.id}`, {requiresAuth: true}, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data.updatedSubcategory),
  })
}

export const reorderSubcategories = async (categoryId: number, subcategories: Array<IReorderRecord>) => {
  return apiFetch(`${API_URL}/subcategories/${categoryId}/reorder`, {requiresAuth: true}, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ subcategories })
  })
}

export const deleteSubcategory = async (id: number, showConfirm?: boolean) => {
  return apiFetch(`${API_URL}/subcategories/${id}${showConfirm ? '?showConfirm=true' : ""}`, 
    { requiresAuth: true },
    {
      method: "DELETE"
    });
}