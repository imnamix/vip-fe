import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "gallery";

const URL = {
  CREATE: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/update/${id}`,
  DELETE: (id: number | string) => `${BASE_URL}/delete/${id}`,
};

export const createGalleryItem = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.CREATE, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating gallery item:", error);
    throw error;
  }
};

export const getAllGalleryItems = async (
  skip: number = 0,
  take: number = 1000,
  search: string = "",
) => {
  try {
    const response = await ApiRequest.get(URL.GET_ALL, { params: { skip, take, search } });
    return response.data;
  } catch (error) {
    console.error("Error fetching gallery items:", error);
    throw error;
  }
};

export const updateGalleryItem = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error("Error updating gallery item:", error);
    throw error;
  }
};

export const deleteGalleryItem = async (id: number | string) => {
  try {
    const response = await ApiRequest.delete(URL.DELETE(id));
    return response.data;
  } catch (error) {
    console.error("Error deleting gallery item:", error);
    throw error;
  }
};
