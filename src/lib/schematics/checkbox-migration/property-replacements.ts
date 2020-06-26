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
    }
];
