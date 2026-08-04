import { apiFetch } from "./apiFetch";

const API_URL = import.meta.env.VITE_API_URL;

export const getMe = async () => {
  const res = await fetch(`${API_URL}/auth/me`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return res.json();
};

export const logout = async () => {
  return apiFetch(`${API_URL}/auth/logout`, {requiresAuth: true}, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  })
};
