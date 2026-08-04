import { apiFetch } from "./apiFetch";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchCategories = async () => {
  return apiFetch(`${API_URL}/categories`, {requiresAuth: false});
};

export const fetchPhotoCategories = async () => {
  return apiFetch(`${API_URL}/categories/photoCategories`, {requiresAuth: true});
};

export const addCategory = async (data: {title: string; subcategories: any; newSubcategoryTitles: any; triggerSubcategoryId: any}) => {
  return apiFetch(`${API_URL}/categories`, {requiresAuth: true}, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data)
  })
}

export const updateCategory = async (id: number, data: {title: string; triggerSubcategoryId: number, order: number, views: number}) => {
  return apiFetch(`${API_URL}/categories/${id}`, {requiresAuth: true}, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export const reorderCategories = async (categories: any) => {
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