import { IAdminPhotosQueryData, IPublicPhotoFetchData, IPublicPhotosQueryData, IUpdatePhoto } from "@/interfaces/IPhotos";
import { apiFetch } from "./apiFetch";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchPhotos = async (data: {
  type: Array<number> | null,
  filters: Array<IPublicPhotoFetchData> | null,
  //sort: "" | "alpha" | "viewsA" | "viewsD"
}): Promise<IPublicPhotosQueryData> => {
  return apiFetch(`${API_URL}/photos`, { requiresAuth: false }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const fetchPhotosAdmin = async (data: {
  type: Array<number> | null,
  filters: Array<IPublicPhotoFetchData> | null,
  missingType: boolean | null,
  missingCategory: boolean | null,
  missingSubcategory: boolean | null,
  sort: "" | "alpha" | "viewsA" | "viewsD"
}): Promise<IAdminPhotosQueryData> => {
  return apiFetch(`${API_URL}/photos/admin`, { requiresAuth: true }, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
};

export const addPhoto = async (data: {title: string, story: string, source: string, photo_type_id: number | null, categories: Array<number>, subcategories: Array<number>, image: File}) => {
  const formData = new FormData();
  formData.append("image", data.image);
  formData.append("title", data.title);
  formData.append("story", data.story);
  formData.append("source", data.source);

  if (data.photo_type_id !== null) {
    formData.append("photo_type_id", String(data.photo_type_id));
  }

  data.categories.forEach((id) => formData.append("categories", String(id)));
  data.subcategories.forEach((id) => formData.append("subcategories", String(id)));

  return apiFetch(`${API_URL}/photos/new`, {requiresAuth: true}, {
    method: 'POST',
    body: formData
  })
}

export const updatePhoto = async (id: number, data: IUpdatePhoto) => {
  return apiFetch(`${API_URL}/photos/${id}`, {requiresAuth: true}, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export const updateViews = async (id: number) => {
  return apiFetch(`${API_URL}/photos/${id}/views`, {requiresAuth: false}, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

export const deletePhoto = async (id: number) => {
  return apiFetch(`${API_URL}/photos/${id}`, 
    { requiresAuth: true },
    {
      method: "DELETE"
    });
}