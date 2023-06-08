import axios from "axios";
import MainBackground from './main.background';
import ENDPOINT from "@/config/endpoint";

export default class RequestBackground {
  constructor(private main: MainBackground) {
  }

  async request(config: any) {
    // const service = axios.create({
    //   withCredentials: false,
    //   timeout: 60000,
    // });
    
    // service.interceptors.request.use(async (config) => {
    //   const cs_store: any = await this.main.storageService.get('cs_store')
    //   const accessToken = await this.main.storageService.get('cs_token')
    //   const deviceId = await this.main.storageService.get('device_id')
    
    //   const baseUrl = cs_store?.baseApiUrl || process.env.VUE_APP_BASE_API_URL;
    
    //   config.baseURL = baseUrl
    
    //   config.headers["Content-Type"] = "application/json";
    //   config.headers["Authorization"] = `Bearer ${accessToken}`;
    //   config.headers['device-id'] = deviceId
    //   return config;
    // },
    // (error) => {
    //   return Promise.reject(error);
    // });
    
    // service.interceptors.response.use(
    //   (response) => {
    //     if (response.headers['device-id']) {
    //       this.main.storageService.save("device_id", response.headers["device-id"]);
    //     }
    //     return response && response.data
    //   },
    //   (error) => {
    //     return Promise.reject(error)
    //   }
    // );

    // return service(config)

    const cs_store: any = await this.main.storageService.get('cs_store')
    const accessToken = await this.main.storageService.get('cs_token')
    const deviceId: string = await this.main.storageService.get('device_id')
    const baseUrl = cs_store?.baseApiUrl || process.env.VUE_APP_BASE_API_URL;
    try {
      const response = await fetch(baseUrl + config.url, {
        method: config.method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
          "device-id": deviceId
        },
        body: JSON.stringify(config.data),
      });
      return response
    } catch (error) {
      return error
    }
  }

  async use_cipher(id: any, data = {}) {
    return await this.request({
      url: ENDPOINT.CYSTACK_PLATFORM_CIPHER_USE.replace(':id', id),
      method: "put",
      data
    });
  }

  async sso_access_token(data: any) {
    return this.request({
      url: ENDPOINT.SSO_ACCESS_TOKEN,
      method: "post",
      data
    });
  }

  async create_ciphers_vault(data = {}) {
    return await this.request({
      url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_VAULTS,
      method: "post",
      data
    });
  }

  async update_cipher(id: any, data = {}) {
    return await this.request({
      url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_DETAIL.replace(':id', id),
      method: "put",
      data
    });
  }
}
