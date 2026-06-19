import { ApiRequest } from '../config/AxiosInterceptor';

const BASE_URL = 'uploadFiles';

const URL = {
  COMMON_URL: `${BASE_URL}/uploadS3`,
  GET_ALL: `${BASE_URL}/getImage`,
  DELETE: `${BASE_URL}/delete`,
};

export const uploadFiles = async (payload: any) => {
  try {
    const response = await ApiRequest.post(URL.COMMON_URL, payload);
    return response.data;
  } catch (error) {
    console.error('Error uploading file:', error);
    throw error;
  }
};

export const getImageURL = async (filename: any) => {
  try {
    const response = await ApiRequest.get(
      `${URL.GET_ALL}?filePath=${filename}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching image:', error);
    throw error;
  }
};

export const deleteImage = async (
  filename: any,
  imageId: any,
  moduleValue: any
) => {
  try {
    const response = await ApiRequest.delete(
      `${URL.DELETE}?file=${filename}&moduleName=${moduleValue}&id=${imageId}`
    );
    return response.data;
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};
