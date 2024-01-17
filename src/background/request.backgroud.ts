import MainBackground from './main.background';
import ENDPOINT from "@/config/endpoint";

export default class RequestBackground {
  constructor(private main: MainBackground) {
  }

  async request(config: any) {
    const cs_store: any = await this.main.storageService.get('cs_store')
    const accessToken = await this.main.storageService.get('cs_token')
    const deviceId: string = await this.main.storageService.get('device_id')
    const baseUrl = cs_store?.baseApiUrl || process.env.VUE_APP_BASE_API_URL;
    return await fetch(baseUrl + config.url, {
      method: config.method,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
        "device-id": deviceId
      },
      body: JSON.stringify(config.data),
    }).then(async (response) => {
      return await response.json()
    }).catch((error) => {
      return Promise.reject(error);
    });
  }

  async sso_access_token(data: any) {
    return await this.request({
      url: ENDPOINT.SSO_ACCESS_TOKEN,
      method: "post",
      data
    });
  }

  async me() {
    return await this.request({
      url: ENDPOINT.ME,
      method: "get",
    });
  }
  
  async users_me(params = {}) {
    return await this.request({
      url: ENDPOINT.CYSTACK_PLATFORM_USERS_ME,
      method: "get",
      params
    });
  }

  async create_ciphers_vault(data = {}) {
    return await this.request({
      url: ENDPOINT.CYSTACK_PLATFORM_CIPHERS_VAULTS,
      method: "post",
      data
    });
  }

  async sync(params = {}) {
    return await this.request({
      url: ENDPOINT.CYSTACK_PLATFORM_SYNC,
      method: "get",
      params
    });
  }

  async sync_cipher(id = '') {
    return await this.request({
      url: ENDPOINT.CYSTACK_PLATFORM_SYNC_CIPHER.replace(':id', id),
      method: "get",
    });
  }

  async sync_folder(id = '') {
    return await this.request({
      url: ENDPOINT.CYSTACK_PLATFORM_SYNC_FOLDER.replace(':id', id),
      method: "get",
    });
  }
}
