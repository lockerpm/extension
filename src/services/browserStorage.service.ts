import { StorageService } from 'jslib-common/abstractions/storage.service';

export default class BrowserStorageService implements StorageService {
    private chromeStorageApi: any;
    private chromeSessionStorageApi: any;

    constructor() {
        const storage: any = chrome.storage;
        this.chromeStorageApi = storage.local;
        this.chromeSessionStorageApi = storage.session;
    }

    async get<T>(key: string): Promise<T> {
        return new Promise(resolve => {
            this.chromeStorageApi.get(key, (obj: any) => {
                if (obj != null && obj[key] != null) {
                    resolve(obj[key] as T);
                    return;
                }
                resolve(null);
            });
        });
    }

    async has(key: string): Promise<boolean> {
        return await this.get(key) != null;
    }

    async save(key: string, obj: any): Promise<any> {
        if (obj == null) {
            // Fix safari not liking null in set
            return new Promise<void>(resolve => {
                this.chromeStorageApi.remove(key, () => {
                    resolve();
                });
            });
        }

        if (obj instanceof Set) {
            obj = Array.from(obj);
        }

        const keyedObj = { [key]: obj };
        return new Promise<void>(resolve => {
            this.chromeStorageApi.set(keyedObj, () => {
                resolve();
            });
        });
    }

    async remove(key: string): Promise<any> {
        return new Promise<void>(resolve => {
            this.chromeStorageApi.remove(key, () => {
                resolve();
            });
        });
    }

    async sessionGet<T>(key: string): Promise<T> {
      return new Promise(resolve => {
          this.chromeSessionStorageApi.get(key, (obj: any) => {
              if (obj != null && obj[key] != null) {
                  resolve(obj[key] as T);
                  return;
              }
              resolve(null);
          });
      });
  }

  async sessionSave(key: string, obj: any): Promise<any> {
    if (obj == null) {
        // Fix safari not liking null in set
        return new Promise<void>(resolve => {
            this.chromeSessionStorageApi.remove(key, () => {
                resolve();
            });
        });
    }

    if (obj instanceof Set) {
        obj = Array.from(obj);
    }

    const keyedObj = { [key]: obj };
    return new Promise<void>(resolve => {
        this.chromeSessionStorageApi.set(keyedObj, () => {
            resolve();
        });
    });
}
}
