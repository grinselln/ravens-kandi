import { IAddCategory, ICategoriesQueryData, IEditedCategoryRecord, IPhotoCategoriesQueryData, IUpdateCategory } from "@/interfaces/ICategories";
import { apiFetch } from "./apiFetch";
import { IReorderRecord } from "@/interfaces/IRecords";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchCategories = async (): Promise<ICategoriesQueryData> => {
  return apiFetch(`${API_URL}/categories`, {requiresAuth: false});
};

export const fetchPhotoCategories = async (): Promise<IPhotoCategoriesQueryData> => {
  return apiFetch(`${API_URL}/categories/photoCategories`, {requiresAuth: true});
};

export const addCategory = async (data: IAddCategory | IEditedCategoryRecord) => {
  return apiFetch(`${API_URL}/categories`, {requiresAuth: true}, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
}

export const updateCategory = async (id: number, data: IUpdateCategory) => {
  return apiFetch(`${API_URL}/categories/${id}`, {requiresAuth: true}, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export const reorderCategories = async (categories: Array<IReorderRecord>) => {
  return apiFetch(`${API_URL}/categories/reorder`, {requiresAuth: true}, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ categories })
  })
};

export const deleteCategory = async (id: number, showConfirm?: boolean) => {
  return apiFetch(`${API_URL}/categories/${id}${showConfirm ? '?showConfirm=true' : ""}`, 
    { requiresAuth: true },
    {
      method: "DELETE"
    });
}