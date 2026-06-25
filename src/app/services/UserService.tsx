import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'user';

const URL = {
  COMMON_URL: `${BASE_URL}/create`,
  GET_ALL: `${BASE_URL}`,
  GET_BY_ID: (id: number | string) => `${BASE_URL}/${id}`,
  UPDATE: (id: number | string) => `${BASE_URL}/${id}`,
  DELETE: `${BASE_URL}/delete`,
};

export const addUser = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error('Error adding user:', error);
    throw error;
  }
};

export const getUserByID = async (id: number | string) => {
  try {
    const response = await ApiRequest.get(URL.GET_BY_ID(id));
    return response.data;
  } catch (error) {
    console.error(`Error fetching user with ID ${id}:`, error);
    throw error;
  }
};

export const updateUser = async (payload: any, id: number | string) => {
  try {
    const response = await ApiRequest.put(URL.UPDATE(id), payload);
    return response.data;
  } catch (error) {
    console.error(`Error updating user with ID ${id}:`, error);
    throw error;
  }
};

export const getAllUsers = async (
  page: number,
  limit: number,
  searchKeys?: string
) => {
  try {
    let userUrl = `${URL.GET_ALL}?page=${page}&limit=${limit}`;
    if (searchKeys) {
      userUrl += `&search=${searchKeys}`;
    }
    const response = await ApiRequest.get(userUrl);
    return response.data;
  } catch (error) {
    console.error('Error fetching user:', error);
    throw error;
  }
};

export const uploadProfilePicture = async (file: File): Promise<string> => {
  const form = new FormData();
  form.append('files', file);
  const response = await ApiRequest.post('uploadFiles/uploadS3', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const result = response.data?.files?.[0]?.data;
  if (!result?.access_url) throw new Error('Upload failed — no URL returned');
  return result.access_url;
};

export const changePassword = async (
  id: number | string,
  currentPassword: string,
  newPassword: string,
) => {
  const response = await ApiRequest.post(`user/change-password/${id}`, {
    currentPassword,
    newPassword,
  });
  return response.data;
};

export const deleteUsers = async (id: any) => {
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

// const URL = {
//   COMMON_URL: 'user',
//   // UPLOAD_CSV: 'uploadFiles/upload',
// };

// export const addUser = async (payload: any) => {
//   try {
//     const response = await ApiRequest.post(URL.COMMON_URL, payload);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
// // export const uploadCsv = async (files: any, broadcast_name?: any) => {
// //   let csvUrl = broadcast_name
// //     ? `${URL.UPLOAD_CSV}?entityName=csv-queue&name=${broadcast_name}`
// //     : `${URL.UPLOAD_CSV}?entityName=csv-queue`;
// //   try {
// //     const response = await ApiRequest.post(csvUrl, files);
// //     return response.data;
// //   } catch (error) {
// //     throw error;
// //   }
// // };

// export const getUserByID = async (id: any) => {
//   try {
//     const response = await ApiRequest.get(`${URL.COMMON_URL}/${id}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
// export const updateUser = async (payload: any, id: any) => {
//   try {
//     const response = await ApiRequest.put(`${URL.COMMON_URL}/${id}`, payload);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
// export const getAllUsers = async (
//   page?: number,
//   limit?: number,
//   searchQuery?: any
// ) => {
//   let userUrl = page
//     ? `${URL.COMMON_URL}?page=${page}&limit=${limit}&search=${searchQuery}`
//     : URL.COMMON_URL;
//   try {
//     const response = await ApiRequest.get(userUrl);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
// export const deleteUsers = async (id: number) => {
//   try {
//     const response = await ApiRequest.delete(`${URL.COMMON_URL}/${id}`);
//     return response.data;
//   } catch (error) {
//     throw error;
//   }
// };
