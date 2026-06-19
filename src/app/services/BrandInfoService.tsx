import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "brandinfo";

const URL = {
  CREATE_OR_UPDATE: `${BASE_URL}/create`,
  GET: `${BASE_URL}/get`,
  UPDATE: `${BASE_URL}/update`,
};

export const createOrUpdateBrandInfo = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.CREATE_OR_UPDATE, payload);
    return response.data;
  } catch (error) {
    console.error("Error creating/updating brand info:", error);
    throw error;
  }
};

export const getBrandInfo = async () => {
  try {
    const response = await ApiRequest.get(URL.GET);
    return response.data;
  } catch (error) {
    console.error("Error fetching brand info:", error);
    throw error;
  }
};

export const updateBrandInfo = async (payload: any) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE, payload);
    return response.data;
  } catch (error) {
    console.error("Error updating brand info:", error);
    throw error;
  }
};
