import 'reflect-metadata';
import {
    isArray,
    isFunction,
    isNullOrUndefined,
    isObject,
    isString
} from 'util';
import { TerraFormFieldBaseContainer } from '../../dynamic-form/data/terra-form-field-base-container';
import { TerraFormFieldCodeEditorOptions } from '../../dynamic-form/data/terra-form-field-code-editor';
import { TerraFormFieldInputDouble } from '../../dynamic-form/data/terra-form-field-input-double';
import { TerraFormFieldInputFile } from '../../dynamic-form/data/terra-form-field-input-file';
import { TerraFormFieldMultiCheckBox } from '../../dynamic-form/data/terra-form-field-multi-check-box';
import {
    AbstractControl,
    FormArray,
    FormControl,
    FormGroup,
    ValidatorFn,
    Validators
} from '@angular/forms';
import { TerraValidators } from '../../../../validators/validators';
import { TerraFormFieldInterface } from '../model/terra-form-field.interface';
import { TERRA_FORM_PROPERTY_METADATA_KEY } from '../model/terra-form-property.decorator';
import { TerraFormFieldBase } from '../../dynamic-form/data/terra-form-field-base';
import { TerraJsonToFormFieldService } from '../../dynamic-form/service/terra-json-to-form-field.service';
import { TerraControlTypeEnum } from '../../dynamic-form/enum/terra-control-type.enum';
import { TerraFormFieldInputText } from '../../dynamic-form/data/terra-form-field-input-text';
import { TerraFormFieldSelectBox } from '../../dynamic-form/data/terra-form-field-select-box';
import { StringHelper } from '../../../../helpers/string.helper';

export class TerraFormFieldHelper
{
    private static readonly CONTROL_TYPE_MAP:{ [key:string]:string } = {
        checkBox:             'checkbox',
        conditionalContainer: 'vertical',
        datePicker:           'date',
        horizontalContainer:  'horizontal',
        inputFile:            'file',
        inputText:            'text',
        inputTextArea:        'textarea',
        inputNumber:          'number',
        inputDouble:          'double',
        selectBox:            'select',
        verticalContainer:    'vertical',
        categoryPicker:       'category',
        multiCheckBox:        'checkboxGroup',
        noteEditor:           'noteEditor',
        codeEditor:           'codeEditor'
    };

    /**
     * @description Generates a list of validators based on the given formField's options that may be attached to a FormControl instance
     * @param formField
     */
    public static generateValidators(formField:TerraFormFieldInterface):Array<ValidatorFn>
    {
        let validators:Array<ValidatorFn> = [];

        if(isNullOrUndefined(formField.options))
        {
            return validators;
        }

        if(formField.options.required)
        {
            validators.push(Validators.required);
        }

        if(formField.options.minLength >= 0)
        {
            validators.push(Validators.minLength(formField.options.minLength));
        }

        if(formField.options.maxLength >= 0)
        {
            validators.push(Validators.maxLength(formField.options.maxLength));
        }

        if(!isNullOrUndefined(formField.options.minValue))
        {
            validators.push(Validators.min(formField.options.minValue));
        }

        if(!isNullOrUndefined(formField.options.maxValue))
        {
            validators.push(Validators.max(formField.options.maxValue));
        }

        if(!StringHelper.isNullUndefinedOrEmpty(formField.options.pattern) || formField.options.pattern instanceof RegExp)
        {
            validators.push(Validators.pattern(formField.options.pattern));
        }

        if(formField.options.email)
        {
            validators.push(Validators.email);
        }

        if(formField.options.isIban)
        {
            validators.push(TerraValidators.iban);
        }

        return validators;
    }

    /**
     * @description parses a set/map/key-value-list of formFields (TerraFormFieldInterface) and creates a representative FormGroup instance.
     * This FormGroup instance may be initialized by passing a set of values.
     * @param formFields
     * @param values
     */
    public static parseReactiveForm(formFields:{ [key:string]:TerraFormFieldInterface }, values?:{}):FormGroup
    {
        let controls:{ [key:string]:AbstractControl } = {};
        Object.keys(formFields).forEach((formFieldKey:string) =>
        {
            let formField:TerraFormFieldInterface = formFields[formFieldKey];
            if(formField.isList)
            {
                let formControls:Array<AbstractControl> = [];
                if(!isNullOrUndefined(values) && isArray(values))
                {
                    formControls = values.map((value:any) =>
                    {
                        return this.createNewControl(value || formField.defaultValue, formField);
                    });
                }
                if(isString(formField.isList))
                {
                    this.fitControlsToRange(formField, formControls);
                }
                controls[formFieldKey] = new FormArray(formControls);
            }
            else if(!isNullOrUndefined(formField.children))
            {
                controls[formFieldKey] = this.parseReactiveForm(formField.children, !isNullOrUndefined(values) ? values[formFieldKey] : undefined);
            }
            else
            {
                let value:any = !isNullOrUndefined(values) ? values[formFieldKey] : formField.defaultValue;
                controls[formFieldKey] = new FormControl(value, this.generateValidators(formField));
            }
        });
        return new FormGroup(controls);
    }

    public static extractFormFields(formModel:any):{ [key:string]:TerraFormFieldInterface }
    {
        let formFields:{ [key:string]:TerraFormFieldInterface }
            = Reflect.getMetadata(TERRA_FORM_PROPERTY_METADATA_KEY, formModel.constructor);

        if(!isNullOrUndefined(formFields))
        {
            Object.keys(formFields)
                  .forEach((formFieldProperty:string) =>
                  {
                      let formField:TerraFormFieldInterface = formFields[formFieldProperty];
                      if(isNullOrUndefined(formField.isList))
                      {
                          formField.isList = Reflect.getMetadata('design:type', formModel.constructor, formFieldProperty) === Array;
                      }

                      if(!isNullOrUndefined(formModel[formFieldProperty])
                         && Reflect.hasMetadata(TERRA_FORM_PROPERTY_METADATA_KEY, formModel[formFieldProperty].constructor))
                      {
                          formField.children = TerraFormFieldHelper.extractFormFields(formModel[formFieldProperty]);
                      }
                  });
        }
        return formFields;
    }

    public static injectOption(formFields:{ [key:string]:TerraFormFieldInterface },
                               type:string,
                               optionKey:string,
                               optionValue:any):{ [key:string]:TerraFormFieldInterface }
    {
        Object.keys(formFields).forEach((key:string) =>
        {
            if(formFields[key].type === type)
            {
                formFields[key].options = formFields[key].options || {};
                formFields[key].options[optionKey] = optionValue;
            }
            if(!isNullOrUndefined(formFields[key].children))
            {
                formFields[key].children = this.injectOption(formFields[key].children, type, optionKey, optionValue);
            }
        });

        return formFields;
    }

    public static isLegacyFormFields(formFields:{ [key:string]:any } | Array<TerraFormFieldBase<any>>):boolean
    {
        return isArray(formFields) || Object.keys(formFields).some((key:string) => !isNullOrUndefined(formFields[key].label));
    }

    public static detectLegacyFormFields(formFields:{ [key:string]:any } | Array<TerraFormFieldBase<any>>):{ [key:string]:TerraFormFieldInterface }
    {
        if(isArray(formFields))
        {
            let transformedFields:{ [key:string]:TerraFormFieldInterface } = {};
            formFields.forEach((field:TerraFormFieldBase<any>) =>
            {
                let transformedField:{ key:string, field:TerraFormFieldInterface } = this.transformLegacyFormField(field);
                transformedFields[transformedField.key] = transformedField.field;
            });
            return transformedFields;
        }
        else if(TerraFormFieldHelper.isLegacyFormFields(formFields))
        {
            return this.detectLegacyFormFields(
                TerraJsonToFormFieldService.generateFormFields(formFields)
            );
        }

        return <{ [key:string]:TerraFormFieldInterface }> formFields;
    }

    private static transformLegacyFormField(field:TerraFormFieldBase<any>):{ key:string, field:TerraFormFieldInterface }
    {
        let result:{ key:string, field:TerraFormFieldInterface } = {
            key:   field.key,
            field: null
        };
        let type:string = this.CONTROL_TYPE_MAP[field.controlType];

        result.field = {
            type:    type,
            options: {
                name:             field.label,
                tooltip:          field.tooltip,
                tooltipPlacement: field.tooltipPlacement,
                required:         field.required
            }
        };

        let transformFn:string = 'transform' + type.charAt(0).toUpperCase() + type.substr(1) + 'Field';
        if(isFunction(this[transformFn]))
        {
            result.field = this[transformFn](result.field, field);
        }

        if(!!field.pattern)
        {
            result.field.isValid = field.pattern.toString();
        }
        else
        {
            let validators:Array<string> = [];
            if(field.minLength >= 0)
            {
                validators.push('this.length >= ' + field.minLength);
            }
            if(field.maxLength >= 0)
            {
                validators.push('this.length <= ' + field.maxLength);
            }
            if(!isNullOrUndefined(field.minValue))
            {
                validators.push('this >= ' + field.minValue);
            }
            if(!isNullOrUndefined(field.maxValue))
            {
                validators.push('this <= ' + field.maxValue);
            }
            result.field.isValid = validators.join(' && ');
        }

        if(field.controlType === TerraControlTypeEnum.CONDITIONAL_CONTAINER
           || field.controlType === TerraControlTypeEnum.HORIZONTAL_CONTAINER
           || field.controlType === TerraControlTypeEnum.VERTICAL_CONTAINER)
        {
            result.field.children = this.detectLegacyFormFields(
                (<TerraFormFieldBaseContainer> field).containerEntries
            );
        }

        return result;
    }

    private static transformCodeEditorField(result:TerraFormFieldInterface,
                                            field:TerraFormFieldCodeEditorOptions):TerraFormFieldInterface
    {
        result.options.fixedHeight = field.fixedHeight;
        return result;
    }

    private static transformDoubleField(result:TerraFormFieldInterface,
                                        field:TerraFormFieldInputDouble):TerraFormFieldInterface
    {
        result.options.isPrice = field.isPrice;
        result.options.decimalCount = field.decimalCount;
        return result;
    }

    private static transformFileField(result:TerraFormFieldInterface,
                                      field:TerraFormFieldInputFile):TerraFormFieldInterface
    {
        result.options.allowedExtensions = field.inputAllowedExtensions;
        return result;
    }

    private static transformCheckboxGroupField(result:TerraFormFieldInterface,
                                               field:TerraFormFieldMultiCheckBox):TerraFormFieldInterface
    {
        result.options.checkBoxValues = field.checkBoxValues;
        return result;
    }

    private static transformTextField(result:TerraFormFieldInterface,
                                      field:TerraFormFieldInputText):TerraFormFieldInterface
    {
        result.options.isPassword = field.isPassword;
        result.options.isIBAN = field.isIBAN;
        result.options.isReadOnly = field.isReadOnly;
        return result;
    }

    private static transformSelectField(result:TerraFormFieldInterface,
                                        field:TerraFormFieldSelectBox):TerraFormFieldInterface
    {
        result.options.listBoxValues = field.selectBoxValues;
        return result;
    }

    /**
     * @description scans the given form for FormArray instances recursively and adapts the amount of controls of those FormArrays to the
     *     amount of values that will be patched to them.
     * @param form
     * @param formFields
     * @param values
     */
    public static updateFormArrays(form:FormGroup, formFields:{ [key:string]:TerraFormFieldInterface }, values:any):void
    {
        if(form instanceof FormGroup && !isObject(values))
        {
            return;
        }

        Object.keys(form.controls).forEach((formControlKey:string) =>
        {
            let control:AbstractControl = form.get(formControlKey);
            let controlValues:any = values[formControlKey];
            let formField:TerraFormFieldInterface = formFields[formControlKey];

            if(formField.isList && control instanceof FormArray && isArray(controlValues))
            {
                let range:[number, number] = this.getListRange(formField.isList);
                let min:number = range[0];
                let max:number = range[1];
                while(control.length > Math.max(controlValues.length, min))
                {
                    control.removeAt(control.length - 1);
                }

                while(control.length < Math.min(controlValues.length, max))
                {
                    // silently push the new control. Do not use control.push() since it makes the valueChanges observable emit a value..
                    control.controls.push(this.createNewControl(controlValues[control.length], formField));
                }
            }
            else if(!isNullOrUndefined(formField.children) && control instanceof FormGroup && isObject(controlValues))
            {
                this.updateFormArrays(control, formField.children, controlValues);
            }
        });
    }

    /**
     * @description creates a new FormControl or FormGroup instance depending on whether the given formField has children or not.
     * The given value is used to initialize the control's value.
     * @param value
     * @param formField
     */
    public static createNewControl(value:any, formField:TerraFormFieldInterface):FormControl | FormGroup
    {
        if(isObject(value) && !isNullOrUndefined(formField.children))
        {
            return this.parseReactiveForm(formField.children, value);
        }
        else
        {
            return new FormControl(value, this.generateValidators(formField));
        }
    }

    /**
     * @description evaluates the upper and lower limit of form fields for a FormArray/FormEntryList based on a given string.
     * @param range
     */
    public static getListRange(range:boolean | string):[number, number]
    {
        let min:number;
        let max:number;

        if(isString(range))
        {
            let match:RegExpExecArray = /^\[(\d*),(\d*)]$/.exec(range);
            if(match !== null)
            {
                min = parseInt(match[1], 10);
                max = parseInt(match[2], 10);
            }
        }

        return [min || 0, max || Infinity];
    }

    /**
     * @description Fits the given list of controls into the range of the given formField by adding/removing controls.
     * @param formField
     * @param controls
     */
    private static fitControlsToRange(formField:TerraFormFieldInterface, controls:Array<AbstractControl>):void
    {
        if(isNullOrUndefined(controls) || isNullOrUndefined(formField))
        {
            return;
        }

        let range:[number, number] = this.getListRange(formField.isList);
        let min:number = range[0];
        let max:number = range[1];

        while(!isNaN(min) && min > controls.length)
        {
            controls.push(this.createNewControl(formField.defaultValue, formField));
        }
        while(!isNaN(max) && max < controls.length)
        {
            controls.pop();
        }
    }
}
