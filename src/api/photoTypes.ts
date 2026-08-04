import { apiFetch } from "./apiFetch";
import { ApiError } from "./errors";

const API_URL = import.meta.env.VITE_API_URL;

export const fetchPhotoTypes = async () => {
  return apiFetch(`${API_URL}/types`, {requiresAuth: false});
};

interface IUpdatePhotoType {
  title: string,
  order?: number
}

export const addPhotoType = async (title: string) => {
  return apiFetch(`${API_URL}/types`, {requiresAuth: true}, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title })
  })
}

export const addPhotoTypes = async (records: Array<string>) => {
  return apiFetch(`${API_URL}/types/bulk`, {requiresAuth: true}, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ types: records })
  })
}

export const updatePhotoType = async (id: number, data : IUpdatePhotoType) => {
  return apiFetch(`${API_URL}/types/${id}`, {requiresAuth: true}, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  })
}

export const reorderPhotoTypes = async (types: any) => {
  return apiFetch(`${API_URL}/types/reorder`, {requiresAuth: true}, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ types })
  })
}


export const deletePhotoType = async (id: number, showConfirm?: boolean) => {
  return apiFetch(`${API_URL}/types/${id}${showConfirm ? '?showConfirm=true' : ""}`, 
    { requiresAuth: true },
    {
      method: "DELETE"
    });
}