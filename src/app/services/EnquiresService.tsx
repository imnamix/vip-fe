import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'enquiry';

const URL = {
  GET_ALL: `${BASE_URL}/allEnquiries`,
  DELETE: `${BASE_URL}/delete`,
};

export const getAllEnquires = async (
  page: number = 1,
  limit: number = 10,
  searchKeys?: string
) => {
  try {
    let enquiresUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) {
      enquiresUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(enquiresUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching enquires:', error);
    throw error;
  }
};

export const deleteEnquires = async (id: any) => {
  try {
    const response = await ApiRequest.delete(URL.DELETE, {
      data: id,
    });
    return response.data;
  } catch (error) {
    console.error(`Error deleting user with ID ${id}:`, error);
    throw error;
  }
};
