import {
    Directive,
    Input,
} from '@angular/core';

import {
    CdkDragDrop,
    moveItemInArray,
} from '@angular/cdk/drag-drop';

import { EventService } from 'jslib-common/abstractions/event.service';
import { I18nService } from 'jslib-common/abstractions/i18n.service';

import { CipherView } from 'jslib-common/models/view/cipherView';
import { FieldView } from 'jslib-common/models/view/fieldView';

import { CipherType } from 'jslib-common/enums/cipherType';
import { EventType } from 'jslib-common/enums/eventType';
import { FieldType } from 'jslib-common/enums/fieldType';

@Directive()
export class AddEditCustomFieldsComponent {
    @Input() cipher: CipherView;
    @Input() editMode: boolean;

    addFieldType: FieldType = FieldType.Text;
    addFieldTypeOptions: any[];
    linkedFieldOptions: any[] = [];

    cipherType = CipherType;
    fieldType = FieldType;
    eventType = EventType;

    constructor(private i18nService: I18nService, private eventService: EventService) {
        this.addFieldTypeOptions = [
            { name: i18nService.t('cfTypeText'), value: FieldType.Text },
            { name: i18nService.t('cfTypeHidden'), value: FieldType.Hidden },
            { name: i18nService.t('cfTypeBoolean'), value: FieldType.Boolean },
        ];
    }

    addField() {
        if (this.cipher.fields == null) {
            this.cipher.fields = [];
        }

        const f = new FieldView();
        f.type = this.addFieldType;
        f.newField = true;

        this.cipher.fields.push(f);
    }

    removeField(field: FieldView) {
        const i = this.cipher.fields.indexOf(field);
        if (i > -1) {
            this.cipher.fields.splice(i, 1);
        }
    }

    toggleFieldValue(field: FieldView) {
        const f = (field as any);
        f.showValue = !f.showValue;
        if (this.editMode && f.showValue) {
            this.eventService.collect(EventType.Cipher_ClientToggledHiddenFieldVisible, this.cipher.id);
        }
    }

    trackByFunction(index: number, item: any) {
        return index;
    }

    drop(event: CdkDragDrop<string[]>) {
        moveItemInArray(this.cipher.fields, event.previousIndex, event.currentIndex);
    }
}
