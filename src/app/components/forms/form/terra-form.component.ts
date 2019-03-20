import {
    AfterViewInit,
    Component,
    forwardRef,
    Input,
    Type,
} from '@angular/core';
import {
    ControlValueAccessor,
    FormGroup,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import { isNullOrUndefined } from 'util';
import { TerraFormScope } from './model/terra-form-scope.data';
import { TerraFormFieldInterface } from './model/terra-form-field.interface';
import { TerraFormTypeMap } from './model/terra-form-type-map.enum';
import { TerraFormFieldHelper } from './helper/terra-form-field.helper';
import { Data } from '@angular/router';

@Component({
    selector:  'terra-form',
    template:  require('./terra-form.component.html'),
    styles:    [require('./terra-form.component.scss')],
    providers: [
        {
            provide:     NG_VALUE_ACCESSOR,
            useExisting: forwardRef(() => TerraFormComponent),
            multi:       true
        }
    ]
})
export class TerraFormComponent implements ControlValueAccessor
{
    @Input()
    public set inputFormFields(fields:{ [key:string]:TerraFormFieldInterface })
    {
        this.formFields = TerraFormFieldHelper.detectLegacyFormFields(fields);
        this._formGroup = TerraFormFieldHelper.parseReactiveForm(fields);
        this._formGroup.valueChanges.subscribe((changes:Data) =>
        {
            Object.keys(changes).forEach((key:string) =>
            {
                this.values[key] = changes[key];
            });
            this.scope.data = this.values;
            this.onChangeCallback(this.values);
        });
    }

    public get inputFormFields():{ [key:string]:TerraFormFieldInterface }
    {
        if(isNullOrUndefined(this.formFields))
        {
            this.formFields = TerraFormFieldHelper.extractFormFields(this.values);
        }
        return this.formFields || {};
    }

    @Input()
    public set inputControlTypeMap(map:any)
    {
        this.controlTypeMap = map;
    }

    public get inputControlTypeMap():any
    {
        if(isNullOrUndefined(this.controlTypeMap))
        {
            return new TerraFormTypeMap();
        }
        return this.controlTypeMap;
    }

    @Input()
    public inputIsDisabled:boolean = false;

    public readonly scope:TerraFormScope = new TerraFormScope();

    protected values:any = {};

    protected controlTypeMap:{ [key:string]:Type<any> };

    private formFields:{ [key:string]:TerraFormFieldInterface };
    private _formGroup:FormGroup = new FormGroup({});

    private parseFormField(field:TerraFormFieldInterface):any
    {
        if(field.isList)
        {
            return field.defaultValue || [];
        }

        if(!isNullOrUndefined(field.children))
        {
            let result:any = {};
            Object.keys(field.children).forEach((fKey:string) =>
            {
                result[fKey] = this.parseFormField(field.children[fKey]);
            });
            return result;
        }
        return field.defaultValue || null;
    }

    public writeValue(values:any):void
    {
        if(isNullOrUndefined(values))
        {
            let defaultValues:any = {};
            Object.keys(this.inputFormFields).forEach((key:string) =>
            {
                defaultValues[key] = this.parseFormField(this.inputFormFields[key]);
            });
            this.values = defaultValues;
            this.scope.data = defaultValues;
            this.formGroup.patchValue(defaultValues);
            this.formGroup.markAsUntouched();
        }
        else if(this.scope.data !== values)
        {
            this.values = values;
            this.scope.data = values;
            TerraFormFieldHelper.updateFormArrays(this.formGroup, this.formFields, values);
            this.formGroup.patchValue(values);
        }
    }

    private onChangeCallback:(_:any) => void = (_:any):void => undefined;

    public registerOnChange(callback:any):void
    {
        this.onChangeCallback = callback;
    }

    public get formGroup():FormGroup
    {
        return this._formGroup;
    }

    private onTouchedCallback:() => void = ():void => undefined;

    public registerOnTouched(callback:any):void
    {
        this.onTouchedCallback = callback;
    }
}
