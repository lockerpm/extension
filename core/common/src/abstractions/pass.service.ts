export abstract class PassService {
  setInformation: (password: string, options: any, tab: any) => Promise<any>;
  getGeneratePassword: () => Promise<any>;
  clearGeneratePassword: () => Promise<any>;
}
