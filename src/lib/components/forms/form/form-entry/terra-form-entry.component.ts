import {
    Component,
    ComponentFactoryResolver,
    Input,
    OnChanges,
    OnDestroy,
    OnInit
} from '@angular/core';
import {
    isFunction,
    isNullOrUndefined
} from 'util';
import {
    ControlValueAccessor,
    FormControl,
    NG_VALUE_ACCESSOR
} from '@angular/forms';
import { noop } from 'rxjs';
import { TerraFormEntryBase } from './terra-form-entry.base';

@Component({
    selector:  'terra-form-entry',
    templateUrl:  './terra-form-entry.component.html',
    styleUrls:    ['./terra-form-entry.component.scss'],
    providers: [
        {
            provide:     NG_VALUE_ACCESSOR,
            useExisting: TerraFormEntryComponent,
            multi:       true
        }
    ]
})
export class TerraFormEntryComponent extends TerraFormEntryBase implements OnInit, OnChanges, OnDestroy, ControlValueAccessor
{
    /**
     * @description FormControl instance corresponding to the given formField.
     */
    @Input()
    public inputFormControl:FormControl;

    private _onChangeCallback:(_:any) => void = noop;
    private _onTouchedCallback:() => void = noop;

    constructor(componentFactoryResolver:ComponentFactoryResolver)
    {
        super(componentFactoryResolver);
    }

    /**
     * Implementation of the OnInit life cycle hook.
     * @description Dynamically creates a component that will be bound to the given FormControl instance based on the specification of the
     *     `inputFormField`. Also starts listening to status changes of the FormControl instance to highlight the formField if it is
     *     invalid.
     */
    public ngOnInit():void
    {
        if(!this.hasChildren)
        {
            this.initComponent();

            if(isFunction(this.componentInstance.registerOnChange) &&
               isFunction(this.componentInstance.registerOnTouched))
            {
                this.componentInstance.registerOnChange((value:any):void => this._onChangeCallback(value));
                this.componentInstance.registerOnTouched(():void => this._onTouchedCallback());
            }
            else
            {
                console.error(
                    'Cannot bind component ' + this.getControlType().name + ' to dynamic form. ' +
                    'Bound components needs to implement the ControlValueAccessor interface.'
                );
            }
        }

        this.inputFormControl.statusChanges.subscribe((status:string) =>
        {
            if(!isNullOrUndefined(this.componentInstance))
            {
                this.componentInstance.isValid = status === 'VALID';
            }
        });
    }



    /**
     * Part of the implementation of the ControlValueAccessor interface
     * @description Registers a given callback method that will be called whenever the form field represented by the dynamically created
     *     component changes its value.
     * @param changeCallback
     */
    public registerOnChange(changeCallback:(value:any) => void):void
    {
        this._onChangeCallback = changeCallback;
    }

    /**
     * Part of the implementation of the ControlValueAccessor interface
     * @description Registers a given callback method that will be called when the form field represented by the dynamically created
     *     component has been touched.
     * @param touchedCallback
     */
    public registerOnTouched(touchedCallback:() => void):void
    {
        this._onTouchedCallback = touchedCallback;
    }

    /**
     * Part of the implementation of the ControlValueAccessor interface
     * @description Writes a given value to the form field using the writeValue method of the dynamically created component instance.
     * @param value
     */
    public writeValue(value:any):void
    {
        if(this.componentInstance && isFunction(this.componentInstance.writeValue))
        {
            this.componentInstance.writeValue(value);
        }
    }

    protected get hasChildren():boolean
    {
        return !isNullOrUndefined(this.inputFormField.children);
    }


}
