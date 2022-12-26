import { StorageService } from '../abstractions/storage.service';
import { PassService as PassServiceAbstraction } from '../abstractions/pass.service';

const Keys = {
  generatePassword: 'generatePassword',
};

export class PassService implements PassServiceAbstraction {
  private generatePassword: Object;
  constructor(private storageService: StorageService) { }

  async setInformation(password: string, options: any, tab: any): Promise<any> {
    this.generatePassword = {
      password: password,
      options: options,
      tab: tab
    };
    await this.storageService.save(Keys.generatePassword, this.generatePassword);
  }

  async getGeneratePassword(): Promise<any> {
    if (this.generatePassword == null) {
      this.generatePassword = await this.storageService.get<string>(Keys.generatePassword);
    }
    return this.generatePassword;
  }

  async clearGeneratePassword(): Promise<any> {
    await this.storageService.remove(Keys.generatePassword);
  }
}
