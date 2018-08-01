import {
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
    Type
} from '@angular/core';
import { TerraDynamicFormElementInterface } from '../model/terra-dynamic-form-element.interface';
import {
    isArray,
    isNullOrUndefined,
    isString
} from 'util';
import { TerraDynamicFormScope } from '../model/terra-dynamic-form-scope.data';

@Component({
    selector: 'terra-dynamic-form2-entry-list',
    template: require('./terra-dynamic-form2-entry-list.component.html'),
    styles:   [require('./terra-dynamic-form2-entry-list.component.scss')]
})
export class TerraDynamicForm2EntryListComponent implements OnInit
{
    @Input()
    public inputFormField:TerraDynamicFormElementInterface;

    @Input()
    public set inputFormValue(value:Array<any>)
    {
        if(isNullOrUndefined(value) || !isArray(value))
        {
            this._value = [];
            setTimeout(() =>
            {
                this.outputFormValueChanged.next(this._value);
            });
        }
        else
        {
            this._value = value;
        }
        this.fillRange();
    }

    @Input()
    public inputListRange:boolean | string;

    @Input()
    public inputScope:TerraDynamicFormScope;

    @Input()
    public inputControlTypeMap:{ [key:string]:Type<any> } = {};

    @Input()
    public inputIsDisabled:boolean = false;

    @Output()
    public outputFormValueChanged:EventEmitter<any> = new EventEmitter<any>();

    protected min:number;
    protected max:number;

    private _value:Array<any> = [];

    public ngOnInit():void
    {
        if(isString(this.inputListRange))
        {
            let match:RegExpExecArray = /^\[(\d*),(\d*)]$/.exec(this.inputListRange);
            if(match !== null)
            {
                this.min = parseInt(match[1], 10);
                this.max = parseInt(match[2], 10);
            }
            else
            {
                this.min = 1 / 0;   // NaN
                this.max = 1 / 0;   // NaN
            }
            this.fillRange();
        }
    }

    protected get canAddElement():boolean
    {
        return isNaN(this.max) || this._value.length - 1 < this.max;
    }

    protected addElement():void
    {
        if(this.canAddElement)
        {
            this._value.push(isNullOrUndefined(this.inputFormField.defaultValue) ? null : this.inputFormField.defaultValue);
            this.outputFormValueChanged.next(this._value);
        }
    }

    protected get canRemoveElement():boolean
    {
        return isNaN(this.min) || this._value.length > this.min;
    }

    protected removeElement(index:number):void
    {
        if(index < 0 || index > this._value.length)
        {
            return;
        }

        if(this.canRemoveElement)
        {
            this._value.splice(index, 1);
            this.outputFormValueChanged.next(this._value);
        }
    }

    protected fillRange():void
    {
        let defaultValue:any = !isNullOrUndefined(this.inputFormField) ? this.inputFormField.defaultValue : null;
        while(!isNaN(this.min) && this.min > this._value.length)
        {
            this._value.push(defaultValue);
        }
        while(!isNaN(this.max) && this.max < this._value.length)
        {
            this._value.pop();
        }
    }

    protected onElementValueChanged(index:number, value:any):void
    {
        this._value[index] = value;
        this.outputFormValueChanged.next(this._value);
    }

    protected trackByFn(index:number, item:any):number
    {
        return index;
    }

}