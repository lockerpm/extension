import { CipherService } from 'jslib-common/abstractions/cipher.service';
import { EventService } from 'jslib-common/abstractions/event.service';
import { TotpService } from 'jslib-common/abstractions/totp.service';
import { UserService } from 'jslib-common/abstractions/user.service';

import { AutofillService as AutofillServiceInterface } from './abstractions/autofill.service';
import {
  AutoFillConstants,
  CreditCardAutoFillConstants,
  IdentityAutoFillConstants
} from './constants/autofill';

import { CipherRepromptType } from 'jslib-common/enums/cipherRepromptType';
import { CipherType } from 'jslib-common/enums/cipherType';
import { FieldType } from 'jslib-common/enums/fieldType';

import { CipherView } from 'jslib-common/models/view/cipherView';

import AutofillField from '../models/autofillField';
import AutofillPageDetails from '../models/autofillPageDetails';
import AutofillScript from '../models/autofillScript';

import { BrowserApi } from '../browser/browserApi';

const UsernameFieldNames: string[] = AutoFillConstants.UsernameFieldNames;
const ExcludedAutofillTypes: string[] = AutoFillConstants.ExcludedAutofillTypes;
const PasswordFieldExcludeList: string[] = AutoFillConstants.PasswordFieldExcludeList;

const CardAttributes: string[] = CreditCardAutoFillConstants.CardAttributes;
const CardAttributesExtended: string[] = CreditCardAutoFillConstants.CardAttributesExtended;
const MonthAbbr = CreditCardAutoFillConstants.MonthAbbr;
const YearAbbrShort = CreditCardAutoFillConstants.YearAbbrShort;
const YearAbbrLong = CreditCardAutoFillConstants.YearAbbrLong;
const CardHolderFieldNames: string[] = CreditCardAutoFillConstants.CardHolderFieldNames;
const CardHolderFieldNameValues: string[] = CreditCardAutoFillConstants.CardHolderFieldNameValues;
const CardNumberFieldNames: string[] = CreditCardAutoFillConstants.CardNumberFieldNames;
const CardNumberFieldNameValues: string[] = CreditCardAutoFillConstants.CardNumberFieldNameValues;
const CardExpiryFieldNames: string[] = CreditCardAutoFillConstants.CardExpiryFieldNames;
const CardExpiryFieldNameValues: string[] = CreditCardAutoFillConstants.CardExpiryFieldNameValues;
const ExpiryMonthFieldNames: string[] = CreditCardAutoFillConstants.ExpiryMonthFieldNames;
const ExpiryYearFieldNames: string[] = CreditCardAutoFillConstants.ExpiryYearFieldNames;
const CVVFieldNames: string[] = CreditCardAutoFillConstants.CVVFieldNames;
const CardBrandFieldNames: string[] = CreditCardAutoFillConstants.CardBrandFieldNames;

const IdentityAttributes: string[] = IdentityAutoFillConstants.IdentityAttributes;
const FullNameFieldNames: string[] = IdentityAutoFillConstants.FullNameFieldNames;
const FullNameFieldNameValues: string[] = IdentityAutoFillConstants.FullNameFieldNameValues;
const FirstnameFieldNames: string[] = IdentityAutoFillConstants.FirstnameFieldNames;
const MiddlenameFieldNames: string[] = IdentityAutoFillConstants.MiddlenameFieldNames;
const EmailFieldNames: string[] = IdentityAutoFillConstants.EmailFieldNames;
const AddressFieldNames: string[] = IdentityAutoFillConstants.AddressFieldNames;
const AddressFieldNameValues: string[] = IdentityAutoFillConstants.AddressFieldNameValues;
const Address1FieldNames: string[] = IdentityAutoFillConstants.Address1FieldNames;
const Address2FieldNames: string[] = IdentityAutoFillConstants.Address2FieldNames;
const Address3FieldNames: string[] = IdentityAutoFillConstants.Address3FieldNames;
const LastnameFieldNames: string[] = IdentityAutoFillConstants.LastnameFieldNames;
const PostalCodeFieldNames: string[] = IdentityAutoFillConstants.PostalCodeFieldNames;
const CityFieldNames: string[] = IdentityAutoFillConstants.CityFieldNames;
const StateFieldNames: string[] = IdentityAutoFillConstants.StateFieldNames;
const CountryFieldNames: string[] = IdentityAutoFillConstants.CountryFieldNames;
const PhoneFieldNames: string[] = IdentityAutoFillConstants.PhoneFieldNames;
const CompanyFieldNames: string[] = IdentityAutoFillConstants.CompanyFieldNames;
const UserNameFieldNames: string[] = IdentityAutoFillConstants.UserNameFieldNames;
const TitleFieldNames: string[] = IdentityAutoFillConstants.TitleFieldNames;
const IsoCountries: { [id: string]: string; } = IdentityAutoFillConstants.IsoCountries;
const IsoStates: { [id: string]: string; } = IdentityAutoFillConstants.IsoStates;
const IsoProvinces: { [id: string]: string; } = IdentityAutoFillConstants.IsoProvinces;

export default class AutofillService implements AutofillServiceInterface {
  constructor(private cipherService: CipherService, private userService: UserService,
              private totpService: TotpService, private eventService: EventService) { }

  getPasswordsFields(pageDetails: AutofillPageDetails): any[] {
    return this.loadPasswordFields(pageDetails, true, true, false, false);
  }
  getNewPasswordsFields(pageDetails: AutofillPageDetails): any[] {
    return this.loadPasswordFields(pageDetails, true, true, false, true);
  }
  getFormsFields(pageDetails: AutofillPageDetails): any[] {
    const formData: any[] = [];

    const passwordFields = this.loadPasswordFields(pageDetails, true, true, false, false);
    const otpFields = this.loadOTPFields(pageDetails, true, true, false)

    for (const formKey in pageDetails.forms) {
      if (!pageDetails.forms.hasOwnProperty(formKey)) {
        continue;
      }
      const formPasswordFields = passwordFields.filter(pf => formKey === pf.form);
      const formOTPFields = otpFields.filter(pf => formKey === pf.form);
      let uf = this.findUsernameField(pageDetails, formPasswordFields[0], false, false, false, pageDetails.forms[formKey]);
      if (uf == null) {
        uf = this.findUsernameField(pageDetails, formPasswordFields[0], true, true, false, pageDetails.forms[formKey]);
      }
      formData.push({
        form: pageDetails.forms[formKey],
        password: formPasswordFields[0] || null,
        username: uf || null,
        passwords: formPasswordFields,
        otps: formOTPFields,
      });
    }

    return formData;
  }

  getCardForms(pageDetails: AutofillPageDetails): any[] {
    const formData: any[] = [];
    const cvvFields = this.loadCvvFields(pageDetails, true, true, false, false);
    if (cvvFields.length === 0) {
      return formData;
    }

    for (const formKey in pageDetails.forms) {
      if (!pageDetails.forms.hasOwnProperty(formKey)) {
        continue;
      }

      const formCvvFields = cvvFields.filter(pf => formKey === pf.form);
      if (formCvvFields.length > 0) {
        let cardholderName = null;
        let number = null;
        let exp = null;
        let expMonth = null;
        let expYear = null;
        let brand = null;
        pageDetails.fields.forEach((f: any) => {
          if (this.forCustomFieldsOnly(f)) {
            return;
          }

          if (this.isExcludedType(f.type, ExcludedAutofillTypes)) {
            return;
          }

          for (let i = 0; i < CardAttributes.length; i++) {
            const attr = CardAttributes[i];
            if (!f.hasOwnProperty(attr) || !f[attr] || !f.viewable) {
              continue;
            }

            if (this.isFieldMatch(
              f[attr],
              CardHolderFieldNames,
              CardHolderFieldNameValues
            )) {
              cardholderName = f;
              break;
            } else if (this.isFieldMatch(
              f[attr],
              CardNumberFieldNames,
              CardNumberFieldNameValues
            )) {
              number = f;
              break;
            } else if (this.isFieldMatch(
              f[attr],
              CardExpiryFieldNames,
              CardExpiryFieldNameValues
            )) {
              exp = f;
              break;
            } else if (this.isFieldMatch(
              f[attr],
              ExpiryMonthFieldNames
            )) {
              expMonth = f;
              break;
            } else if (this.isFieldMatch(
              f[attr],
              ExpiryYearFieldNames
            )) {
              expYear = f;
              break;
            } else if (this.isFieldMatch(
              f[attr],
              CardBrandFieldNames
            )) {
              brand = f;
              break;
            }
          }
        });
        formData.push({
          form: pageDetails.forms[formKey],
          cvv: formCvvFields[0],
          cardholderName,
          number,
          exp,
          expMonth,
          expYear,
          brand,
          cvvs: formCvvFields
        });
      }
    }

    return formData
  }

  async doAutoFill(options: any) {
    let totpPromise: Promise<string> = null;
    const tab = await this.getActiveTab();
    
    if (!tab || !options.cipher || !options.pageDetails || !options.pageDetails.length) {
      throw new Error('Nothing to auto-fill.');
    }

    const canAccessPremium = await this.userService.canAccessPremium();
    let didAutofill = false;
    options.pageDetails.forEach((pd: any) => {
      // make sure we're still on correct tab
      if (pd.tab.id !== tab.id || pd.tab.url !== tab.url) {
        return;
      }

      var fillScript = this.generateFillScript(pd.details, {
        skipUsernameOnlyFill: options.skipUsernameOnlyFill || false,
        onlyEmptyFields: options.onlyEmptyFields || false,
        onlyVisibleFields: options.onlyVisibleFields || false,
        fillNewPassword: options.fillNewPassword || false,
        cipher: options.cipher,
      });

      if (!fillScript || !fillScript.script || !fillScript.script.length) {
        return;
      }

      // Add a small delay between operations
      fillScript.properties.delay_between_operations = 20;

      didAutofill = true;
      if (!options.skipLastUsed) {
        this.cipherService.updateLastUsedDate(options.cipher.id);
      }
      BrowserApi.tabSendMessage(tab, {
        command: 'fillForm',
        fillScript: fillScript,
        url: tab.url,
      }, { frameId: pd.frameId });

      if (options.cipher.type !== CipherType.Login || totpPromise || !options.cipher.login.totp ||
        (!canAccessPremium && !options.cipher.organizationUseTotp)) {
        return;
      }

      totpPromise = this.totpService.isAutoCopyEnabled().then(enabled => {
        if (enabled) {
          return this.totpService.getCode(options.cipher.login.totp);
        }
        return null;
      });
    });

    if (didAutofill) {
      if (totpPromise != null) {
        return await totpPromise;
      } else {
        return null;
      }
    }
  }

  async doAutoFillActiveTab(pageDetails: any, fromCommand: boolean) {
    const tab = await this.getActiveTab();
    if (!tab || !tab.url) {
      return;
    }

    let cipher: CipherView;
    if (fromCommand) {
      cipher = await this.cipherService.getNextCipherForUrl(tab.url);
    } else {
      const lastLaunchedCipher = await this.cipherService.getLastLaunchedForUrl(tab.url, true);
      if (lastLaunchedCipher && Date.now().valueOf() - lastLaunchedCipher.localData?.lastLaunched?.valueOf() < 30000) {
        cipher = lastLaunchedCipher;
      }
      else {
        cipher = await this.cipherService.getLastUsedForUrl(tab.url, true);
      }

      if (cipher == null) {
        return null;
      }
    }

    if (cipher.reprompt !== CipherRepromptType.None) {
      return;
    }

    const totpCode = await this.doAutoFill({
      cipher: cipher,
      pageDetails: pageDetails,
      skipLastUsed: !fromCommand,
      skipUsernameOnlyFill: !fromCommand,
      onlyEmptyFields: !fromCommand,
      onlyVisibleFields: !fromCommand,
      fillNewPassword: fromCommand,
    });

    // Update last used index as autofill has succeed
    if (fromCommand) {
      this.cipherService.updateLastUsedIndexForUrl(tab.url);
    }

    return totpCode;
  }

  // Helpers
  private async getActiveTab(): Promise<any> {
    const tab = await BrowserApi.getTabFromCurrentWindow();
    if (!tab) {
      throw new Error('No tab found.');
    }

    return tab;
  }

  private generateFillScript(pageDetails: AutofillPageDetails, options: any): AutofillScript {
    if (!pageDetails || !options.cipher) {
      return null;
    }

    var fillScript = new AutofillScript(pageDetails.documentUUID);
    var filledFields: { [id: string]: AutofillField; } = {};
    const fields = options.cipher.fields;

    if (fields && fields.length) {
      const fieldNames: string[] = [];

      fields.forEach((f: any) => {
        if (this.hasValue(f.name)) {
          fieldNames.push(f.name.toLowerCase());
        }
      });

      pageDetails.fields.forEach((field: any) => {
        if (filledFields.hasOwnProperty(field.opid)) {
          return;
        }

        if (!field.viewable && field.tagName !== 'span') {
          return;
        }

        const matchingIndex = this.findMatchingFieldIndex(field, fieldNames);
        if (matchingIndex > -1) {
          let val = fields[matchingIndex].value;
          if (val == null && fields[matchingIndex].type === FieldType.Boolean) {
            val = 'false';
          }

          filledFields[field.opid] = field;
          this.fillByOpid(fillScript, field, val);
        }
      });
    }

    switch (options.cipher.type) {
      case CipherType.Login:
        fillScript = this.generateLoginFillScript(fillScript, pageDetails, filledFields, options);
        break;
      case CipherType.Card:
        fillScript = this.generateCardFillScript(fillScript, pageDetails, filledFields, options);
        break;
      case CipherType.Identity:
        fillScript = this.generateIdentityFillScript(fillScript, pageDetails, filledFields, options);
        break;
      default:
        return null;
    }
    return fillScript;
  }

  private generateLoginFillScript(fillScript: AutofillScript, pageDetails: any,
                                  filledFields: { [id: string]: AutofillField; }, options: any): AutofillScript {
    if (!options.cipher.login) {
      return null;
    }
    const passwords: AutofillField[] = [];
    const usernames: AutofillField[] = [];
    const login = options.cipher.login;

    if (!login.password || login.password === '') {
      // No password for this login. Maybe they just wanted to auto-fill some custom fields?
      fillScript = this.setFillScriptForFocus(filledFields, fillScript);
      return fillScript;
    }

    let passwordFields = this.loadPasswordFields(pageDetails, false, false, options.onlyEmptyFields, options.fillNewPassword);
    if (!passwordFields.length && !options.onlyVisibleFields) {
      // not able to find any viewable password fields. maybe there are some "hidden" ones?
      passwordFields = this.loadPasswordFields(pageDetails, true, true, options.onlyEmptyFields, options.fillNewPassword);
    }

    passwordFields.forEach(passField => {
      passwords.push(passField);
    });

    if (login.username) {
      for (const formKey in pageDetails.forms) {
        if (!pageDetails.forms.hasOwnProperty(formKey)) {
          continue;
        }
        const password = passwordFields.find((p) => p.form === formKey)
        const username = this.findUsernameField(pageDetails, password, false, false, false, pageDetails.forms[formKey]);
        if (username) {
          usernames.push(username);
        }
      }
    }

    usernames.forEach(u => {
      if (filledFields.hasOwnProperty(u.opid)) {
        return;
      }

      filledFields[u.opid] = u;
      this.fillByOpid(fillScript, u, login.username);
    });

    passwords.forEach(p => {
      if (filledFields.hasOwnProperty(p.opid)) {
        return;
      }

      filledFields[p.opid] = p;
      this.fillByOpid(fillScript, p, login.password);
    });

    fillScript = this.setFillScriptForFocus(filledFields, fillScript);
    return fillScript;
  }

  private generateCardFillScript(fillScript: AutofillScript, pageDetails: any,
                                 filledFields: { [id: string]: AutofillField; }, options: any): AutofillScript {
    if (!options.cipher.card) {
      return null;
    }

    const fillFields: { [id: string]: AutofillField; } = {};

    pageDetails.fields.forEach((f: any) => {
      if (this.forCustomFieldsOnly(f)) {
        return;
      }

      if (this.isExcludedType(f.type, ExcludedAutofillTypes)) {
        return;
      }

      for (let i = 0; i < CardAttributes.length; i++) {
        const attr = CardAttributes[i];
        if (!f.hasOwnProperty(attr) || !f[attr] || !f.viewable) {
          continue;
        }

        if (!fillFields.cardholderName && this.isFieldMatch(
          f[attr],
          CardHolderFieldNames,
          CardHolderFieldNameValues
        )) {
          fillFields.cardholderName = f;
          break;
        } else if (!fillFields.number && this.isFieldMatch(
          f[attr],
          CardNumberFieldNames,
          CardNumberFieldNameValues
        )) {
          fillFields.number = f;
          break;
        } else if (!fillFields.exp && this.isFieldMatch(
          f[attr],
          CardExpiryFieldNames,
          CardExpiryFieldNameValues
        )) {
          fillFields.exp = f;
          break;
        } else if (!fillFields.expMonth && this.isFieldMatch(
          f[attr],
          ExpiryMonthFieldNames
        )) {
          fillFields.expMonth = f;
          break;
        } else if (!fillFields.expYear && this.isFieldMatch(
          f[attr],
          ExpiryYearFieldNames
        )) {
          fillFields.expYear = f;
          break;
        } else if (!fillFields.code && this.isFieldMatch(
          f[attr],
          CVVFieldNames
        )) {
          fillFields.code = f;
          break;
        } else if (!fillFields.brand && this.isFieldMatch(
          f[attr],
          CardBrandFieldNames
        )) {
          fillFields.brand = f;
          break;
        }
      }
    });
    const card = options.cipher.card;
    this.makeScriptAction(fillScript, card, fillFields, filledFields, 'cardholderName');
    this.makeScriptAction(fillScript, card, fillFields, filledFields, 'number');
    this.makeScriptAction(fillScript, card, fillFields, filledFields, 'code');
    this.makeScriptAction(fillScript, card, fillFields, filledFields, 'brand');

    if (fillFields.expMonth && this.hasValue(card.expMonth)) {
      let expMonth: string = card.expMonth;

      if (fillFields.expMonth.selectInfo && fillFields.expMonth.selectInfo.options) {
        let index: number = null;
        const siOptions = fillFields.expMonth.selectInfo.options;
        if (siOptions.length === 12) {
          index = parseInt(card.expMonth, null) - 1;
        } else if (siOptions.length === 13) {
          if (siOptions[0][0] != null && siOptions[0][0] !== '' &&
            (siOptions[12][0] == null || siOptions[12][0] === '')) {
            index = parseInt(card.expMonth, null) - 1;
          } else {
            index = parseInt(card.expMonth, null);
          }
        }

        if (index != null) {
          const option = siOptions[index];
          if (option.length > 1) {
            expMonth = option[1];
          }
        }
      } else if ((this.fieldAttrsContain(fillFields.expMonth, 'mm') || fillFields.expMonth.maxLength === 2)
        && expMonth.length === 1) {
        expMonth = '0' + expMonth;
      }

      filledFields[fillFields.expMonth.opid] = fillFields.expMonth;
      this.fillByOpid(fillScript, fillFields.expMonth, expMonth);
    }

    if (fillFields.expYear && this.hasValue(card.expYear)) {
      let expYear: string = card.expYear;
      if (fillFields.expYear.selectInfo && fillFields.expYear.selectInfo.options) {
        for (let i = 0; i < fillFields.expYear.selectInfo.options.length; i++) {
          const o: [string, string] = fillFields.expYear.selectInfo.options[i];
          if (o[0] === card.expYear || o[1] === card.expYear) {
            expYear = o[1];
            break;
          }
          if (o[1].length === 2 && card.expYear.length === 4 && o[1] === card.expYear.substring(2)) {
            expYear = o[1];
            break;
          }
          const colonIndex = o[1].indexOf(':');
          if (colonIndex > -1 && o[1].length > colonIndex + 1) {
            const val = o[1].substring(colonIndex + 2);
            if (val != null && val.trim() !== '' && val === card.expYear) {
              expYear = o[1];
              break;
            }
          }
        }
      } else if (this.fieldAttrsContain(fillFields.expYear, 'yyyy') || fillFields.expYear.maxLength === 4) {
        if (expYear.length === 2) {
          expYear = '20' + expYear;
        }
      } else if (this.fieldAttrsContain(fillFields.expYear, 'yy') || fillFields.expYear.maxLength === 2) {
        if (expYear.length === 4) {
          expYear = expYear.substr(2);
        }
      }

      filledFields[fillFields.expYear.opid] = fillFields.expYear;
      this.fillByOpid(fillScript, fillFields.expYear, expYear);
    }

    if (fillFields.exp && this.hasValue(card.expMonth) && this.hasValue(card.expYear)) {
      const fullMonth = ('0' + card.expMonth).slice(-2);

      let fullYear: string = card.expYear;
      let partYear: string = null;
      if (fullYear.length === 2) {
        partYear = fullYear;
        fullYear = '20' + fullYear;
      } else if (fullYear.length === 4) {
        partYear = fullYear.substr(2, 2);
      }

      let exp: string = null;
      for (let i = 0; i < MonthAbbr.length; i++) {
        if (this.fieldAttrsContain(fillFields.exp, MonthAbbr[i] + '/' + YearAbbrShort[i]) &&
          partYear != null) {
          exp = fullMonth + '/' + partYear;
        } else if (this.fieldAttrsContain(fillFields.exp, MonthAbbr[i] + '/' + YearAbbrLong[i])) {
          exp = fullMonth + '/' + fullYear;
        } else if (this.fieldAttrsContain(fillFields.exp, YearAbbrShort[i] + '/' + MonthAbbr[i]) &&
          partYear != null) {
          exp = partYear + '/' + fullMonth;
        } else if (this.fieldAttrsContain(fillFields.exp, YearAbbrLong[i] + '/' + MonthAbbr[i])) {
          exp = fullYear + '/' + fullMonth;
        } else if (this.fieldAttrsContain(fillFields.exp, MonthAbbr[i] + '-' + YearAbbrShort[i]) &&
          partYear != null) {
          exp = fullMonth + '-' + partYear;
        } else if (this.fieldAttrsContain(fillFields.exp, MonthAbbr[i] + '-' + YearAbbrLong[i])) {
          exp = fullMonth + '-' + fullYear;
        } else if (this.fieldAttrsContain(fillFields.exp, YearAbbrShort[i] + '-' + MonthAbbr[i]) &&
          partYear != null) {
          exp = partYear + '-' + fullMonth;
        } else if (this.fieldAttrsContain(fillFields.exp, YearAbbrLong[i] + '-' + MonthAbbr[i])) {
          exp = fullYear + '-' + fullMonth;
        } else if (this.fieldAttrsContain(fillFields.exp, YearAbbrShort[i] + MonthAbbr[i]) &&
          partYear != null) {
          exp = partYear + fullMonth;
        } else if (this.fieldAttrsContain(fillFields.exp, YearAbbrLong[i] + MonthAbbr[i])) {
          exp = fullYear + fullMonth;
        } else if (this.fieldAttrsContain(fillFields.exp, MonthAbbr[i] + YearAbbrShort[i]) &&
          partYear != null) {
          exp = fullMonth + partYear;
        } else if (this.fieldAttrsContain(fillFields.exp, MonthAbbr[i] + YearAbbrLong[i])) {
          exp = fullMonth + fullYear;
        }

        if (exp != null) {
          break;
        }
      }

      if (exp == null) {
        exp = fullYear + '-' + fullMonth;
      }

      this.makeScriptActionWithValue(fillScript, exp, fillFields.exp, filledFields);
    }

    return fillScript;
  }

  private fieldAttrsContain(field: any, containsVal: string) {
    if (!field) {
      return false;
    }

    let doesContain = false;
    CardAttributesExtended.forEach(attr => {
      if (doesContain || !field.hasOwnProperty(attr) || !field[attr]) {
        return;
      }

      let val = field[attr];
      val = val.replace(/ /g, '').toLowerCase();
      doesContain = val.indexOf(containsVal) > -1;
    });

    return doesContain;
  }

  private generateIdentityFillScript(fillScript: AutofillScript, pageDetails: any,
                                     filledFields: { [id: string]: AutofillField; }, options: any): AutofillScript {
    if (!options.cipher.identity) {
      return null;
    }

    const fillFields: { [id: string]: AutofillField; } = {};

    pageDetails.fields.forEach((f: any) => {
      if (this.forCustomFieldsOnly(f)) {
        return;
      }

      if (this.isExcludedType(f.type, ExcludedAutofillTypes)) {
        return;
      }

      for (let i = 0; i < IdentityAttributes.length; i++) {
        const attr = IdentityAttributes[i];
        if (!f.hasOwnProperty(attr) || !f[attr] || !f.viewable) {
          continue;
        }

        if (!fillFields.name && this.isFieldMatch(
          f[attr],
          FullNameFieldNames,
          FullNameFieldNameValues
        )) {
          fillFields.name = f;
          break;
        } else if (!fillFields.firstName && this.isFieldMatch(
          f[attr],
          FirstnameFieldNames
        )) {
          fillFields.firstName = f;
          break;
        } else if (!fillFields.middleName && this.isFieldMatch(
          f[attr],
          MiddlenameFieldNames
        )) {
          fillFields.middleName = f;
          break;
        } else if (!fillFields.lastName && this.isFieldMatch(
          f[attr],
          LastnameFieldNames
        )) {
          fillFields.lastName = f;
          break;
        } else if (!fillFields.title && this.isFieldMatch(
          f[attr],
          TitleFieldNames
        )) {
          fillFields.title = f;
          break;
        } else if (!fillFields.email && this.isFieldMatch(
          f[attr],
          EmailFieldNames
        )) {
          fillFields.email = f;
          break;
        } else if (!fillFields.address && this.isFieldMatch(
          f[attr],
          AddressFieldNames,
          AddressFieldNameValues
        )) {
          fillFields.address = f;
          break;
        } else if (!fillFields.address1 && this.isFieldMatch(
          f[attr],
          Address1FieldNames
        )) {
          fillFields.address1 = f;
          break;
        } else if (!fillFields.address2 && this.isFieldMatch(
          f[attr],
          Address2FieldNames
        )) {
          fillFields.address2 = f;
          break;
        } else if (!fillFields.address3 && this.isFieldMatch(
          f[attr],
          Address3FieldNames
        )) {
          fillFields.address3 = f;
          break;
        } else if (!fillFields.postalCode && this.isFieldMatch(
          f[attr],
          PostalCodeFieldNames
        )) {
          fillFields.postalCode = f;
          break;
        } else if (!fillFields.city && this.isFieldMatch(
          f[attr],
          CityFieldNames
        )) {
          fillFields.city = f;
          break;
        } else if (!fillFields.state && this.isFieldMatch(
          f[attr],
          StateFieldNames
        )) {
          fillFields.state = f;
          break;
        } else if (!fillFields.country && this.isFieldMatch(
          f[attr],
          CountryFieldNames
        )) {
          fillFields.country = f;
          break;
        } else if (!fillFields.phone && this.isFieldMatch(
          f[attr],
          PhoneFieldNames
        )) {
          fillFields.phone = f;
          break;
        } else if (!fillFields.username && this.isFieldMatch(
          f[attr],
          UserNameFieldNames
        )) {
          fillFields.username = f;
          break;
        } else if (!fillFields.company && this.isFieldMatch(
          f[attr],
          CompanyFieldNames
        )) {
          fillFields.company = f;
          break;
        }
      }
    });

    const identity = options.cipher.identity;
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'title');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'firstName');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'middleName');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'lastName');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'address1');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'address2');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'address3');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'city');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'postalCode');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'company');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'email');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'phone');
    this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'username');

    let filledState = false;
    if (fillFields.state && identity.state && identity.state.length > 2) {
      const stateLower = identity.state.toLowerCase();
      const isoState = IsoStates[stateLower] || IsoProvinces[stateLower];
      if (isoState) {
        filledState = true;
        this.makeScriptActionWithValue(fillScript, isoState, fillFields.state, filledFields);
      }
    }

    if (!filledState) {
      this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'state');
    }

    let filledCountry = false;
    if (fillFields.country && identity.country && identity.country.length > 2) {
      const countryLower = identity.country.toLowerCase();
      const isoCountry = IsoCountries[countryLower];
      if (isoCountry) {
        filledCountry = true;
        this.makeScriptActionWithValue(fillScript, isoCountry, fillFields.country, filledFields);
      }
    }

    if (!filledCountry) {
      this.makeScriptAction(fillScript, identity, fillFields, filledFields, 'country');
    }

    if (fillFields.name && (identity.firstName || identity.lastName)) {
      let fullName = '';
      if (this.hasValue(identity.firstName)) {
        fullName = identity.firstName;
      }
      if (this.hasValue(identity.middleName)) {
        if (fullName !== '') {
          fullName += ' ';
        }
        fullName += identity.middleName;
      }
      if (this.hasValue(identity.lastName)) {
        if (fullName !== '') {
          fullName += ' ';
        }
        fullName += identity.lastName;
      }

      this.makeScriptActionWithValue(fillScript, fullName, fillFields.name, filledFields);
    }

    if (fillFields.address && this.hasValue(identity.address1)) {
      let address = '';
      if (this.hasValue(identity.address1)) {
        address = identity.address1;
      }
      if (this.hasValue(identity.address2)) {
        if (address !== '') {
          address += ', ';
        }
        address += identity.address2;
      }
      if (this.hasValue(identity.address3)) {
        if (address !== '') {
          address += ', ';
        }
        address += identity.address3;
      }

      this.makeScriptActionWithValue(fillScript, address, fillFields.address, filledFields);
    }

    return fillScript;
  }

  private isExcludedType(type: string, excludedTypes: string[]) {
    return excludedTypes.indexOf(type) > -1;
  }

  private isFieldMatch(value: string, options: string[], containsOptions?: string[]): boolean {
    value = value.trim().toLowerCase().replace(/[^a-zA-Z0-9]+/g, '');
    for (let i = 0; i < options.length; i++) {
      let option = options[i];
      const checkValueContains = containsOptions == null || containsOptions.indexOf(option) > -1;
      option = option.toLowerCase().replace(/-/g, '');
      if (value === option || (checkValueContains && value.indexOf(option) > -1)) {
        return true;
      }
    }

    return false;
  }

  private makeScriptAction(fillScript: AutofillScript, cipherData: any, fillFields: { [id: string]: AutofillField; },
                           filledFields: { [id: string]: AutofillField; }, dataProp: string, fieldProp?: string) {
    fieldProp = fieldProp || dataProp;
    this.makeScriptActionWithValue(fillScript, cipherData[dataProp], fillFields[fieldProp], filledFields);
  }

  private makeScriptActionWithValue(fillScript: AutofillScript, dataValue: any, field: AutofillField,
                                    filledFields: { [id: string]: AutofillField; }) {
    let doFill = false;
    if (this.hasValue(dataValue) && field) {
      if (field.type === 'select-one' && field.selectInfo && field.selectInfo.options) {
        for (let i = 0; i < field.selectInfo.options.length; i++) {
          const option = field.selectInfo.options[i];
          for (let j = 0; j < option.length; j++) {
            if (this.hasValue(option[j]) && option[j].toLowerCase() === dataValue.toLowerCase()) {
              doFill = true;
              if (option.length > 1) {
                dataValue = option[1];
              }
              break;
            }
          }

          if (doFill) {
            break;
          }
        }
      } else {
        doFill = true;
      }
    }

    if (doFill) {
      filledFields[field.opid] = field;
      this.fillByOpid(fillScript, field, dataValue);
    }
  }

  private loadCvvFields(pageDetails: AutofillPageDetails, canBeHidden: boolean, canBeReadOnly: boolean,
                             mustBeEmpty: boolean, fillNewPassword: boolean) {
    const arr: AutofillField[] = [];
    pageDetails.fields.forEach(f => {
      if (this.forCustomFieldsOnly(f)) {
        return;
      }
      const valueIsLikeCvv = (value: string) => {
        if (value == null) {
          return false;
        }
        // Removes all whitespace, _ and - characters
        const cleanedValue = value.toLowerCase().replace(/[\s_\-]/g, '');

        if (cleanedValue.indexOf('cvv') < 0 && cleanedValue.indexOf('cvc') < 0) {
          return false;
        }

        return true;
      };
      const isLikeCvv = () => {
        if (valueIsLikeCvv(f.htmlID)) {
          return true;
        }
        if (valueIsLikeCvv(f.htmlName)) {
          return true;
        }
        if (valueIsLikeCvv(f.placeholder)) {
          return true;
        }
        return false;
      };
      if (!f.disabled && (canBeReadOnly || !f.readonly) && isLikeCvv()) {
        arr.push(f);
      }
    });
    return arr;
  }

  private loadPasswordFields(pageDetails: AutofillPageDetails, canBeHidden: boolean, canBeReadOnly: boolean,
                             mustBeEmpty: boolean, fillNewPassword: boolean) {
    const arr: AutofillField[] = [];
    pageDetails.fields.forEach(f => {
      if (this.forCustomFieldsOnly(f)) {
        return;
      }

      const isPassword = f.type === 'password';
      const valueIsLikePassword = (value: string) => {
        if (value == null) {
          return false;
        }
        // Removes all whitespace, _ and - characters
        const cleanedValue = value.toLowerCase().replace(/[\s_\-]/g, '');
        if (cleanedValue.indexOf('password') < 0) {
          return false;
        }

        const ignoreList = PasswordFieldExcludeList;
        if (ignoreList.some(i => cleanedValue.indexOf(i) > -1)) {
          return false;
        }

        return true;
      };
      const isLikePassword = () => {
        if (f.type !== 'text') {
          return false;
        }
        if (valueIsLikePassword(f.htmlID)) {
          return true;
        }
        if (valueIsLikePassword(f.htmlName)) {
          return true;
        }
        if (valueIsLikePassword(f.placeholder)) {
          return true;
        }
        return false;
      };
      if (!f.disabled && (canBeReadOnly || !f.readonly) && (isPassword || isLikePassword())
        && (canBeHidden || f.viewable) && (!mustBeEmpty || f.value == null || f.value.trim() === '')
      ) {
        arr.push(f);
      }
    });
    return arr;
  }

  private loadOTPFields(pageDetails: AutofillPageDetails, canBeHidden: boolean, canBeReadOnly: boolean,
    mustBeEmpty: boolean) {
    const arr: AutofillField[] = [];
    pageDetails.fields.forEach(f => {      
      if (this.forCustomFieldsOnly(f)) {
        return;
      }

      const valueIsLikeOTP = (value: string) => {
        if (value == null) {
          return false;
        }
        // Removes all whitespace, _ and - characters
        const cleanedValue = value.toLowerCase().replace(/[\s_\-]/g, '');

        if (cleanedValue.indexOf('otp') < 0 && cleanedValue.indexOf('code') < 0) {
          return false;
        }

        const ignoreList = ['countrycode'];
        if (ignoreList.some(i => cleanedValue.indexOf(i) > -1)) {
          return false;
        }

        return true;
      };

      const isLikeOTP = () => {
        if (f.type === 'password') {
          return false;
        }
        if (valueIsLikeOTP(f.htmlID)) {
          return true;
        }
        if (valueIsLikeOTP(f.htmlName)) {
          return true;
        }
        if (valueIsLikeOTP(f.placeholder)) {
          return true;
        }
        return false;
      };

      if (
        !f.disabled
        && isLikeOTP()
        && (canBeReadOnly || !f.readonly)
        && (canBeHidden || f.viewable)
        && (!mustBeEmpty || f.value == null || f.value.trim() === '')
      ) {
        arr.push(f);
      }
    });
    return arr;
  }

  private findUsernameField(
    pageDetails: AutofillPageDetails,
    passwordField: AutofillField,
    canBeHidden: boolean,
    canBeReadOnly: boolean,
    withoutForm: boolean,
    form?: any
  ) {
    let usernameField: AutofillField = null;
    for (let i = 0; i < pageDetails.fields.length; i += 1) {
      const f = pageDetails.fields[i];
      if (this.forCustomFieldsOnly(f)) {
        continue;
      }
      if (!passwordField) {
        if (
          !f.disabled &&
          (canBeReadOnly || !f.readonly) &&
          (f.form === form.opid) &&
          (canBeHidden || f.viewable) &&
          (f.type === 'text' || f.type === 'email' || f.type === 'tel')
        ) {
          if (this.findMatchingFieldIndex(f, UsernameFieldNames) > -1) {
            usernameField = f;
            break;
          }
        }
        continue;
      }

      if (f.elementNumber >= passwordField.elementNumber) {
        break;
      }

      if (
        !f.disabled &&
        (canBeReadOnly || !f.readonly) &&
        (withoutForm || f.form === passwordField.form) &&
        (canBeHidden || f.viewable) &&
        (f.type === 'text' || f.type === 'email' || f.type === 'tel')
      ) {
        usernameField = f;
        break;
      }
    }

    return usernameField;
  }

  private findMatchingFieldIndex(field: AutofillField, names: string[]): number {
    for (let i = 0; i < names.length; i++) {
      if (names[i].indexOf('=') > -1) {
        if (this.fieldPropertyIsPrefixMatch(field, 'htmlID', names[i], 'id')) {
          return i;
        }
        if (this.fieldPropertyIsPrefixMatch(field, 'htmlName', names[i], 'name')) {
          return i;
        }
        if (this.fieldPropertyIsPrefixMatch(field, 'label-tag', names[i], 'label')) {
          return i;
        }
        if (this.fieldPropertyIsPrefixMatch(field, 'label-aria', names[i], 'label')) {
          return i;
        }
        if (this.fieldPropertyIsPrefixMatch(field, 'placeholder', names[i], 'placeholder')) {
          return i;
        }
      }

      if (this.fieldPropertyIsMatch(field, 'htmlID', names[i])) {
        return i;
      }
      if (this.fieldPropertyIsMatch(field, 'htmlName', names[i])) {
        return i;
      }
      if (this.fieldPropertyIsMatch(field, 'label-tag', names[i])) {
        return i;
      }
      if (this.fieldPropertyIsMatch(field, 'label-aria', names[i])) {
        return i;
      }
      if (this.fieldPropertyIsMatch(field, 'placeholder', names[i])) {
        return i;
      }
    }

    return -1;
  }

  private fieldPropertyIsPrefixMatch(field: any, property: string, name: string, prefix: string,
                                     separator = '='): boolean {
    if (name.indexOf(prefix + separator) === 0) {
      const sepIndex = name.indexOf(separator);
      const val = name.substring(sepIndex + 1);
      return val != null && this.fieldPropertyIsMatch(field, property, val);
    }
    return false;
  }

  private fieldPropertyIsMatch(field: any, property: string, name: string): boolean {
    let fieldVal = field[property] as string;
    if (!this.hasValue(fieldVal)) {
      return false;
    }

    fieldVal = fieldVal.trim().replace(/(?:\r\n|\r|\n)/g, '');
    if (name.startsWith('regex=')) {
      try {
        const regexParts = name.split('=', 2);
        if (regexParts.length === 2) {
          const regex = new RegExp(regexParts[1], 'i');
          return regex.test(fieldVal);
        }
      } catch (e) { }
    } else if (name.startsWith('csv=')) {
      const csvParts = name.split('=', 2);
      if (csvParts.length === 2) {
        const csvVals = csvParts[1].split(',');
        for (let i = 0; i < csvVals.length; i++) {
          const val = csvVals[i];
          if (val != null && val.trim().toLowerCase() === fieldVal.toLowerCase()) {
            return true;
          }
        }
        return false;
      }
    }

    return fieldVal.toLowerCase() === name;
  }

  private fieldIsFuzzyMatch(field: AutofillField, names: string[]): boolean {
    if (this.hasValue(field.htmlID) && this.fuzzyMatch(names, field.htmlID)) {
      return true;
    }
    if (this.hasValue(field.htmlName) && this.fuzzyMatch(names, field.htmlName)) {
      return true;
    }
    if (this.hasValue(field['label-tag']) && this.fuzzyMatch(names, field['label-tag'])) {
      return true;
    }
    if (this.hasValue(field.placeholder) && this.fuzzyMatch(names, field.placeholder)) {
      return true;
    }
    if (this.hasValue(field['label-left']) && this.fuzzyMatch(names, field['label-left'])) {
      return true;
    }
    if (this.hasValue(field['label-top']) && this.fuzzyMatch(names, field['label-top'])) {
      return true;
    }
    if (this.hasValue(field['label-aria']) && this.fuzzyMatch(names, field['label-aria'])) {
      return true;
    }

    return false;
  }

  private fuzzyMatch(options: string[], value: string): boolean {
    if (options == null || options.length === 0 || value == null || value === '') {
      return false;
    }

    value = value.replace(/(?:\r\n|\r|\n)/g, '').trim().toLowerCase();

    for (let i = 0; i < options.length; i++) {
      if (value.indexOf(options[i]) > -1) {
        return true;
      }
    }

    return false;
  }

  private hasValue(str: string): boolean {
    return str && str !== '';
  }

  private setFillScriptForFocus(filledFields: { [id: string]: AutofillField; },
                                fillScript: AutofillScript): AutofillScript {
    let lastField: AutofillField = null;
    let lastPasswordField: AutofillField = null;

    for (const opid in filledFields) {
      if (filledFields.hasOwnProperty(opid) && filledFields[opid].viewable) {
        lastField = filledFields[opid];

        if (filledFields[opid].type === 'password') {
          lastPasswordField = filledFields[opid];
        }
      }
    }

    // Prioritize password field over others.
    if (lastPasswordField) {
      fillScript.script.push(['focus_by_opid', lastPasswordField.opid]);
    } else if (lastField) {
      fillScript.script.push(['focus_by_opid', lastField.opid]);
    }

    return fillScript;
  }

  private fillByOpid(fillScript: AutofillScript, field: AutofillField, value: string): void {
    if (field.maxLength && value && value.length > field.maxLength) {
      value = value.substr(0, value.length);
    }
    if (field.tagName !== 'span') {
      fillScript.script.push(['click_on_opid', field.opid]);
      fillScript.script.push(['focus_by_opid', field.opid]);
    }
    fillScript.script.push(['fill_by_opid', field.opid, value]);
    fillScript.script.push(['fill_by_id', field.htmlID, value]);
  }

  private forCustomFieldsOnly(field: AutofillField): boolean {
    return field.tagName === 'span';
  }
}
