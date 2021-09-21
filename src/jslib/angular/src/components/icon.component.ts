import {
    Component,
    Input,
    OnChanges,
} from '@angular/core';

import { CipherType } from 'jslib-common/enums/cipherType';

import { CipherView } from 'jslib-common/models/view/cipherView';

import { EnvironmentService } from 'jslib-common/abstractions/environment.service';
import { StateService } from 'jslib-common/abstractions/state.service';

import { ConstantsService } from 'jslib-common/services/constants.service';

import { Utils } from 'jslib-common/misc/utils';

const IconMap: any = {
    'fa-globe': String.fromCharCode(0xf0ac),
    'fa-sticky-note-o': String.fromCharCode(0xf24a),
    'fa-id-card-o': String.fromCharCode(0xf2c3),
    'fa-credit-card': String.fromCharCode(0xf09d),
    'fa-android': String.fromCharCode(0xf17b),
    'fa-apple': String.fromCharCode(0xf179),
};

@Component({
    selector: 'app-vault-icon',
    templateUrl: 'icon.component.html',
})
export class IconComponent implements OnChanges {
    @Input() cipher: CipherView;
    icon: string;
    image: string;
    fallbackImage: string;
    imageEnabled: boolean;

    private iconsUrl: string;

    constructor(environmentService: EnvironmentService, protected stateService: StateService) {
        this.iconsUrl = environmentService.getIconsUrl();
    }

    async ngOnChanges() {
        // Components may be re-used when using cdk-virtual-scroll. Which puts the component in a weird state,
        // to avoid this we reset all state variables.
        this.image = null;
        this.fallbackImage = null;
        this.imageEnabled = !(await this.stateService.get<boolean>(ConstantsService.disableFaviconKey));
        this.load();
    }

    get iconCode(): string {
        return IconMap[this.icon];
    }

    protected load() {
        switch (this.cipher.type) {
            case CipherType.Login:
                this.icon = 'fa-globe';
                this.setLoginIcon();
                break;
            case CipherType.SecureNote:
                this.icon = 'fa-sticky-note-o';
                break;
            case CipherType.Card:
                this.icon = 'fa-credit-card';
                break;
            case CipherType.Identity:
                this.icon = 'fa-id-card-o';
                break;
            default:
                break;
        }
    }

    private setLoginIcon() {
        if (this.cipher.login.uri) {
            let hostnameUri = this.cipher.login.uri;
            let isWebsite = false;

            if (hostnameUri.indexOf('androidapp://') === 0) {
                this.icon = 'fa-android';
                this.image = null;
            } else if (hostnameUri.indexOf('iosapp://') === 0) {
                this.icon = 'fa-apple';
                this.image = null;
            } else if (this.imageEnabled && hostnameUri.indexOf('://') === -1 && hostnameUri.indexOf('.') > -1) {
                hostnameUri = 'http://' + hostnameUri;
                isWebsite = true;
            } else if (this.imageEnabled) {
                isWebsite = hostnameUri.indexOf('http') === 0 && hostnameUri.indexOf('.') > -1;
            }

            if (this.imageEnabled && isWebsite) {
                try {
                    this.image = this.iconsUrl + '/' + Utils.getHostname(hostnameUri) + '/icon.png';
                    this.fallbackImage = 'images/fa-globe.png';
                } catch (e) { }
            }
        } else {
            this.image = null;
        }
    }
}
