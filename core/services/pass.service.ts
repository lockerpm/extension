import { StorageService } from '../abstractions/storage.service';
import { PassService as PassServiceAbstraction } from '../abstractions/pass.service';

const Keys = {
  generatePassword: 'generatePassword',
};

export class PassService implements PassServiceAbstraction {
  constructor(private storageService: StorageService) { }

  async setInformation(password: string, options: any, tab: any): Promise<any> {
    await this.storageService.save(Keys.generatePassword, {
      password: password,
      options: JSON.stringify(options),
      tab: tab
    });
  }

  async getGeneratePassword(): Promise<any> {
    return await this.storageService.get<string>(Keys.generatePassword) || null;
  }

  async clearGeneratePassword(): Promise<any> {
    await this.storageService.remove(Keys.generatePassword);
  }
}
