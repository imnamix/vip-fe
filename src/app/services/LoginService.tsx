import { ApiRequest } from '../config/AxiosInterceptor';

const URL = {
  LOGIN: 'login/auth/login',
  FORGETPASSWORD: 'login/forgotPassword',
  VERIFYOTP: 'login/verifyOtp',
  RESETPASSWORD: 'login/resetPassword',
};

export const LoginPage = async (payLoad: {
  email: string;
  password: string;
}) => {
  try {
    const response = await ApiRequest.post(URL.LOGIN, payLoad);
    return response;
  } catch (error) {
    throw error;
  }
};
export const ForgetPasswordOTP = async (payLoad: { email: string }) => {
  try {
    const response = await ApiRequest.post(URL.FORGETPASSWORD, payLoad);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (payLoad: { email: string; otp: number }) => {
  try {
    const response = await ApiRequest.post(URL.VERIFYOTP, payLoad);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const ResetPassword = async (payLoad: {
  email: string;
  newPassword: string;
}) => {
  try {
    const response = await ApiRequest.post(URL.RESETPASSWORD, payLoad);
    return response.data;
  } catch (error) {
    throw error;
  }
};
