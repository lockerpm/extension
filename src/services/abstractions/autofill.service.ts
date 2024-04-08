import AutofillPageDetails from '../../models/autofillPageDetails';
import AutofillField from '@/models/autofillField';

export abstract class AutofillService {
    getFormsFields: (pageDetails: AutofillPageDetails) => any[];
    getPasswordsFields: (
      pageDetails: AutofillPageDetails,
      canBeHidden?: boolean,
      canBeReadOnly?: boolean,
      mustBeEmpty?: boolean,
      fillNewPassword?: boolean
    ) => any[];
    getNewPasswordsFields: (pageDetails: AutofillPageDetails) => any[];
    getCardForms: (pageDetails: AutofillPageDetails) => any[];
    doAutoFill: (options: any) => Promise<string>;
    doAutoFillActiveTab: (pageDetails: any, fromCommand: boolean) => Promise<string>;
    findUsernameField: (
      pageDetails: AutofillPageDetails,
      passwordField: AutofillField,
      canBeHidden?: boolean,
      canBeReadOnly?: boolean,
      mustBeEmpty?: boolean,
      fillNewPassword?: boolean
    ) => any;
}
