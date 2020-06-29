import { StringReplacementInterface } from '../string-replacement.interface';

export const stringsToReplace:Array<StringReplacementInterface> = [
    {
        query:       '[inputIsDisabled]',
        replacement: '[disabled]'
    },
    {
        query:       'inputIsDisabled',
        replacement: '[disabled]'
    },
    {
        query:       '[isIndeterminate]',
        replacement: '[indeterminate]'
    },
    {
        query:       '(isIndeterminateChange)',
        replacement: '(indeterminateChange)'
    },
    {
        query:       '[tooltipPlacement]',
        replacement: '[placement]'
    },
    {
        query:       '[(value)]',
        replacement: '[(ngModel)]'
    },
    {
        query:        'inputIcon',
        htmlTag:      'span class="checkbox-icon icon-delete"',
        move:         true,
        insertBefore: '<'
    },
    {
        query:        'inputCaption',
        htmlTag:      'span',
        move:         true,
        insertBefore: '<'
    }
];
