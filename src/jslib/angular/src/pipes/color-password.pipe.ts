import {
    Pipe,
    PipeTransform,
} from '@angular/core';
import { Utils } from 'jslib-common/misc/utils';

/*
 An updated pipe that sanitizes HTML, highlights numbers and special characters (in different colors each)
 and handles Unicode / Emoji characters correctly.
*/
@Pipe({ name: 'colorPassword' })
export class ColorPasswordPipe implements PipeTransform {
    transform(password: string) {
        // Convert to an array to handle cases that stings have special characters, ie: emoji.
        const passwordArray = Array.from(password);
        let colorizedPassword = '';
        for (let i = 0; i < passwordArray.length; i++) {
            let character = passwordArray[i];
            let isSpecial = false;
            // Sanitize HTML first.
            switch (character) {
                case '&':
                    character = '&amp;';
                    isSpecial = true;
                    break;
                case '<':
                    character = '&lt;';
                    isSpecial = true;
                    break;
                case '>':
                    character = '&gt;';
                    isSpecial = true;
                    break;
                case ' ':
                    character = '&nbsp;';
                    isSpecial = true;
                    break;
                default:
                    break;
            }
            let type = 'letter';
            if (character.match(Utils.regexpEmojiPresentation)) {
                type = 'emoji';
            } else if (isSpecial || character.match(/[^\w ]/)) {
                type = 'special';
            } else if (character.match(/\d/)) {
                type = 'number';
            }
            colorizedPassword += '<span class="password-' + type + '">' + character + '</span>';
        }
        return colorizedPassword;
    }
}
