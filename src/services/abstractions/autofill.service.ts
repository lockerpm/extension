import AutofillPageDetails from '../../models/autofillPageDetails';

export abstract class AutofillService {
    getFormsWithPasswordFields: (pageDetails: AutofillPageDetails) => any[];
    getPasswordsFields: (pageDetails: AutofillPageDetails) => any[];
    getNewPasswordsFields: (pageDetails: AutofillPageDetails) => any[];
    getCardForms: (pageDetails: AutofillPageDetails) => any[];
    doAutoFill: (options: any) => Promise<string>;
    doAutoFillActiveTab: (pageDetails: any, fromCommand: boolean) => Promise<string>;
}
