import axios from "axios";
import { handleResponseErrorMessage } from "./response";
import JSLib from '@/services'
const browserStorageService = JSLib.getBgService('storageService')()

const service = axios.create({
  withCredentials: false,
  timeout: 60000,
});

// request interceptor
service.interceptors.request.use(async (config) => {
  const cs_store = await browserStorageService.get('cs_store')
  const accessToken = await browserStorageService.get('cs_token')
  const deviceId = await browserStorageService.get('device_id')

  const baseUrl = cs_store?.baseApiUrl || process.env.VUE_APP_BASE_API_URL;

  config.baseURL = baseUrl

  config.headers["Content-Type"] = "application/json";
  config.headers["Authorization"] = `Bearer ${accessToken}`;
  config.headers['device-id'] = deviceId;
  return config;
},
(error) => {
  return Promise.reject(error);
});

// response interceptor
service.interceptors.response.use(
  (response) => {
    return response && response.data
  },
  (error) => {
    return Promise.reject(handleResponseErrorMessage(error));
  }
);

export default service;
