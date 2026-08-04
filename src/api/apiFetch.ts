import { ApiError } from "./errors";
type ApiFetchAuth = { requiresAuth: boolean };

export const apiFetch = async (url: string, requiresAuth: ApiFetchAuth, options: RequestInit = {}) => {
  const response = await fetch(url, {
    ...options,
    ...(requiresAuth && { credentials: "include" })   
  }, 
);

  const body = await response.json();

  if(options?.method === "DELETE") {
    if (!response.ok && response.status !== 409) {
      throw new ApiError(body.message || 'Unable to delete record.', response.status);
    }

    return { status: response.status, ...body };
  }
  
  if (!response.ok) {
    throw new ApiError(response.statusText, response.status);
  }

  return body;
};