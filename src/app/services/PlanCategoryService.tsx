import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "plancategory";

const URL = {
  CREATE: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/get-all`,
  GET_BY_ID: `${BASE_URL}/get`,
  UPDATE: `${BASE_URL}/update`,
  DELETE: `${BASE_URL}/delete`,
};

interface PlanCategoryData {
  name: string;
  status?: number;
}

export const createPlanCategory = async (data: PlanCategoryData) => {
  try {
    const response = await ApiRequest.post(URL.CREATE, data);
    return response.data;
  } catch (error) {
    console.error("Error creating plan category:", error);
    throw error;
  }
};

export const getPlanCategories = async () => {
  try {
    const response = await ApiRequest.get(URL.GET_ALL);
    return response.data;
  } catch (error) {
    console.error("Error fetching plan categories:", error);
    throw error;
  }
};

export const getPlanCategoryById = async (id: number) => {
  try {
    const response = await ApiRequest.get(`${URL.GET_BY_ID}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching plan category:", error);
    throw error;
  }
};

export const updatePlanCategory = async (
  id: number,
  data: PlanCategoryData,
) => {
  try {
    const response = await ApiRequest.put(`${URL.UPDATE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating plan category:", error);
    throw error;
  }
};

export const deletePlanCategory = async (id: number) => {
  try {
    const response = await ApiRequest.delete(`${URL.DELETE}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting plan category:", error);
    throw error;
  }
};
