import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "plan";

const URL = {
  CREATE: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/get-all`,
  GET_BY_ID: `${BASE_URL}/get`,
  UPDATE: `${BASE_URL}/update`,
  DELETE: `${BASE_URL}/delete`,
};

interface PlanBannerData {
  type: "Banner";
  banner_name: string;
  banner_description: string;
  banner_image?: any;
  status?: number;
}

interface PlanPlanData {
  type: "Plan";
  name: string;
  description: string;
  plan_image?: any;
  plan_category_id: number;
  status?: number;
}

type PlanData = PlanBannerData | PlanPlanData;

export interface PlanDetail {
  id: number;
  type: string;
  banner_name?: string;
  banner_description?: string;
  banner_image?: string;
  name?: string;
  description?: string;
  plan_image?: string;
  plan_category_id?: number;
  plan_category?: {
    id: number;
    name: string;
    status: number;
  };
  status: number;
  created_at: string;
  updated_at: string;
}

export const createPlan = async (data: PlanData) => {
  try {
    const response = await ApiRequest.post(URL.CREATE, data);
    return response.data;
  } catch (error) {
    console.error("Error creating plan:", error);
    throw error;
  }
};

export const getPlans = async () => {
  try {
    const response = await ApiRequest.get(URL.GET_ALL);
    return response.data;
  } catch (error) {
    console.error("Error fetching plans:", error);
    throw error;
  }
};

export const getPlanById = async (id: number) => {
  try {
    const response = await ApiRequest.get(`${URL.GET_BY_ID}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error fetching plan:", error);
    throw error;
  }
};

export const updatePlan = async (id: number, data: PlanData) => {
  try {
    const response = await ApiRequest.put(`${URL.UPDATE}/${id}`, data);
    return response.data;
  } catch (error) {
    console.error("Error updating plan:", error);
    throw error;
  }
};

export const deletePlan = async (id: number) => {
  try {
    const response = await ApiRequest.delete(`${URL.DELETE}/${id}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting plan:", error);
    throw error;
  }
};
