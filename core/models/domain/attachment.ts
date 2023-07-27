import { AttachmentData } from '../data/attachmentData';

import { AttachmentView } from '../view/attachmentView';

import Domain from './domainBase';
import { EncString } from './encString';
import { SymmetricCryptoKey } from './symmetricCryptoKey';

import { CryptoService } from '../../abstractions/crypto.service';

import { Utils } from '../../misc/utils';

export class Attachment extends Domain {
    id: string;
    url: string;
    size: string;
    sizeName: string;
    key: EncString;
    fileName: EncString;

    constructor(obj?: AttachmentData, alreadyEncrypted: boolean = false) {
        super();
        if (obj == null) {
            return;
        }

        this.size = obj.size;
        this.buildDomainModel(this, obj, {
            id: null,
            url: null,
            sizeName: null,
            fileName: null,
            key: null,
        }, alreadyEncrypted, ['id', 'url', 'sizeName']);
    }

    async decrypt(orgId: string, encKey?: SymmetricCryptoKey): Promise<AttachmentView> {
        const view = await this.decryptObj(new AttachmentView(this), {
            fileName: null,
        }, orgId, encKey);

        if (this.key != null) {
            let cryptoService: CryptoService;
            const containerService = (Utils.global as any).lockerContainerService;
            if (containerService) {
                cryptoService = containerService.getCryptoService();
            } else {
                throw new Error('global lockerContainerService not initialized.');
            }

            try {
                const orgKey = await cryptoService.getOrgKey(orgId);
                const decValue = await cryptoService.decryptToBytes(this.key, orgKey ?? encKey);
                view.key = new SymmetricCryptoKey(decValue);
            } catch (e) {
                // TODO: error?
            }
        }

        return view;
    }

    toAttachmentData(): AttachmentData {
        const a = new AttachmentData();
        a.size = this.size;
        this.buildDataModel(this, a, {
            id: null,
            url: null,
            sizeName: null,
            fileName: null,
            key: null,
        }, ['id', 'url', 'sizeName']);
        return a;
    }
}
