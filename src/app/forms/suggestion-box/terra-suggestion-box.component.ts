import {
    Component,
    ElementRef,
    EventEmitter,
    forwardRef,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { TerraSuggestionBoxValueInterface } from './data/terra-suggestion-box.interface';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { isNullOrUndefined } from 'util';

const MAX_LASTLY_USED_ENTRIES = 5;

@Component({
    selector:  'terra-suggestion-box',
    styles:    [require('./terra-suggestion-box.component.scss')],
    template:  require('./terra-suggestion-box.component.html'),
    providers: [
        {
            provide:     NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TerraSuggestionBoxComponent),
            multi:       true
        }
    ]
})
export class TerraSuggestionBoxComponent implements OnInit, OnChanges
{
    @Input() inputName:string;
    @Input() inputIsRequired:boolean;
    @Input() inputIsDisabled:boolean;
    @Input() inputTooltipText:string;
    @Input() inputTooltipPlacement:string;
    @Input() inputListBoxValues:Array<TerraSuggestionBoxValueInterface>;
    @Input() inputWithRecentlyUsed:boolean;
    @Output() outputValueChanged = new EventEmitter<TerraSuggestionBoxValueInterface>();

    private _selectedValue:TerraSuggestionBoxValueInterface;
    private _toggleOpen:boolean;
    private _hasLabel:boolean;
    private _isValid:boolean;
    private _value:number | string;
    private clickListener:(event:Event) => void;
    private _displayListBoxValues:Array<TerraSuggestionBoxValueInterface> = [];
    private _lastSelectedValues:Array<TerraSuggestionBoxValueInterface>;
    private _listBoxHeadingKey:string;
    private _noEntriesTextKey:string;

    constructor(private _elementRef:ElementRef)
    {
    }

    public get isValid():boolean
    {
        return this._isValid;
    }

    public set isValid(value:boolean)
    {
        this._isValid = value;
    }

    ngOnInit()
    {
        this.clickListener = (event) =>
        {
            this.clickedOutside(event);
        };

        this.inputTooltipPlacement = 'top';
        this._selectedValue =
            {
                value:   '',
                caption: ''
            };

        this._isValid = true;
        this._toggleOpen = false;
        this._hasLabel = this.inputName != null;
        this._lastSelectedValues = [];
        this._listBoxHeadingKey = '';
        this._noEntriesTextKey = this.inputWithRecentlyUsed? 'terraSuggestionBox.noRecentlyUsed': 'terraSuggestionBox.noSuggestions';

        if(!this.inputWithRecentlyUsed)
        {
            // initialize the displayed list with all possible values
            this._displayListBoxValues = this.inputListBoxValues;
        }
    }

    ngOnChanges(changes:SimpleChanges)
    {
        if(changes["inputListBoxValues"]
           && changes["inputListBoxValues"].currentValue.length > 0
           && this.inputListBoxValues.find((x) => this._selectedValue === x))
        {
            setTimeout(() =>
            {
                this.select(this.inputListBoxValues[0]);
            });
        }
    }

    private onTouchedCallback:() => void = () =>
    {
    };

    private onChangeCallback:(_:any) => void = (_) =>
    {
    };

    public registerOnChange(fn:any):void
    {
        this.onChangeCallback = fn;
    }

    public registerOnTouched(fn:any):void
    {
        this.onTouchedCallback = fn;
    }

    public writeValue(value:any):void
    {
        this.value = value;
    }

    public get value():any
    {
        return this._value;
    }

    public set value(value:any)
    {
        this._value = value;

        if(!isNullOrUndefined(value))
        {
            let selectedValue = this.inputListBoxValues.find((item:TerraSuggestionBoxValueInterface) => item.value === value);

            if(selectedValue)
            {
                this._selectedValue = {
                    caption: selectedValue.caption,
                    value:   selectedValue.value
                };
            }
        }
        else
        {
            this._selectedValue = {
                caption: this.inputListBoxValues[0].caption,
                value:   this.inputListBoxValues[0].value
            };
        }
    }

    private onClick(evt:Event):void
    {
        evt.stopPropagation(); // prevents the click listener on the document to be fired right after
        this.toggleOpen = !this.toggleOpen;
    }

    public set toggleOpen(value:boolean)
    {
        if(this._toggleOpen !== value && value == true)
        {
            document.addEventListener('click', this.clickListener);
        }
        else if(this._toggleOpen !== value && value == false)
        {
            document.removeEventListener('click', this.clickListener);
        }

        this._toggleOpen = value;
    }

    public get toggleOpen():boolean
    {
        return this._toggleOpen;
    }

    private clickedOutside(event):void
    {
        if(!this._elementRef.nativeElement.contains(event.target))
        {
            this.toggleOpen = false;
        }
    }

    private select(value:TerraSuggestionBoxValueInterface):void
    {
        // update selected value
        this._selectedValue = {
            caption: value.caption,
            value:   value.value
        };

        // update last selected values
        if(this.inputWithRecentlyUsed)
        {
            this.updateLastSelectedValues();
        }

        // execute callback functions
        this.onTouchedCallback();
        this.onChangeCallback(value.value);
        this.outputValueChanged.emit(value);
    }

    private updateLastSelectedValues():void
    {
        // check if newly selected value has been selected lastly
        let valueSelected:TerraSuggestionBoxValueInterface =
            this._lastSelectedValues.find((value:TerraSuggestionBoxValueInterface) =>
                value.caption === this._selectedValue.caption &&
                value.value === this._selectedValue.value
            );

        // add value to the last selected values, if it is not already added
        if(isNullOrUndefined(valueSelected))
        {
            let length:number = this._lastSelectedValues.unshift(
                {
                    caption: this._selectedValue.caption,
                    value:   this._selectedValue.value
                }
            );

            // check if length of the array exceeds the maximum amount of "lastly used" entries
            if(length > MAX_LASTLY_USED_ENTRIES)
            {
                // remove last element of the array
                this._lastSelectedValues.pop();
            }
        }
    }

    public onChange()
    {
        let searchString = this._selectedValue.caption;
        this.toggleOpen = true;

        if(searchString.length >= 3)
        {
            this._listBoxHeadingKey = 'terraSuggestionBox.suggestions';
            this._noEntriesTextKey = 'terraSuggestionBox.noSuggestions';
            this._displayListBoxValues = this.inputListBoxValues.filter(
                (value:TerraSuggestionBoxValueInterface) => value.caption.toUpperCase().search(searchString.toUpperCase()) !== -1
            );
        }
        else if(this.inputWithRecentlyUsed)
        {
            this._listBoxHeadingKey = 'terraSuggestionBox.recentlyUsed';
            this._noEntriesTextKey = 'terraSuggestionBox.noRecentlyUsed';
            this._displayListBoxValues = this._lastSelectedValues;
        }
        else
        {
            this._displayListBoxValues = this.inputListBoxValues;
        }

        this.value = this._selectedValue;
    }

    public resetComponentValue():void
    {
        this.value = null;

        this._selectedValue =
            {
                value:   '',
                caption: ''
            };
    }
}
