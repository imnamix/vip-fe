import { ApiRequest } from "../config/AxiosInterceptor";

const BASE_URL = "events";

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}/getAll`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/getById/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/updateEvents/${id}`,
  DELETE: `${BASE_URL}/deleteEvents`,
};

export const addEvents = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error("Error adding event:", error);
    throw error;
  }
};

export const getEventsByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching event with ID ${id}:`, error);
    throw error;
  }
};

export const updateEvents = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating event with ID ${id}:`, error);
    throw error;
  }
};

export const getAllEvents = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string,
  status?: string,
) => {
  try {
    let eventsUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) eventsUrl += `&search=${encodeURIComponent(searchKeys)}`;
    if (status && status !== "All") eventsUrl += `&status=${encodeURIComponent(status)}`;
    const response = await ApiRequest.get(eventsUrl);
    return response.data;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
};

export const deleteEvents = async (payload: { ids: number[] }) => {
  try {
    const response = await ApiRequest.delete(URL.DELETE, {
      data: payload,
    });
    return response.data;
  } catch (error) {
    console.error("Error deleting event(s):", error);
    throw error;
  }
};
