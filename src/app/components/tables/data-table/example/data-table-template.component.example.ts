import { Component, OnInit } from '@angular/core';
import { TerraDataTableExampleInterface } from './terra-data-table.interface.example';
import { TerraDataTableRowInterface } from '../interfaces/terra-data-table-row.interface';
import { TerraDataTableServiceExample } from './terra-data-table.service.example';
import { TerraDataTableComponentExample } from './terra-data-table.component.example';
import {
    TerraMultiCheckBoxValueInterface,
    TerraSelectBoxValueInterface
} from '../../../../..';

@Component({
    selector:  'tc-data-table-template-example',
    template:  require('./data-table-template.component.example.html'),
    styles:    [require('./data-table-template.component.example.scss')],
    providers: [TerraDataTableServiceExample]
})
export class DataTableTemplateComponentExample extends TerraDataTableComponentExample implements OnInit
{
    protected editIndex:number;

    protected _isToggled:boolean = false;

    constructor(service:TerraDataTableServiceExample)
    {
        super(service);
    }

    protected buttonClicked(row:TerraDataTableRowInterface<TerraDataTableExampleInterface>):void
    {
        console.log(row.data.id + ' button clicked');
    }

    protected isEdited(index:number):boolean
    {
        if (this._isToggled == true)
        {
            return true;
        }
        else
        {
            return index === this.editIndex;
        }
    }

    protected startEditing(index:number):void
    {
        this.editIndex = index;
    }

    protected stopEditing():void
    {
        this.editIndex = undefined;
    }

    //SelectBox
    protected _selectableOptionTypesList:Array<TerraSelectBoxValueInterface> = [{
                    value:   'en',
                    caption: 'english'
                },
                {
                    value:   'de',
                    caption: 'german'
                }];
    protected _pickedValue:string;

    protected disabled1:boolean = false;
    protected values:Array<TerraMultiCheckBoxValueInterface> = [
    {
        value:    '0',
        caption:  'Value 1',
        selected: false
    },
    {
        value:    '1',
        caption:  'Value 2',
        selected: true
    },
    {
        value:    '2',
        caption:  'Value 3',
        selected: true
    },
    {
        value:    '3',
        caption:  'Value 4',
        selected: false
    },
    {
        value:    '4',
        caption:  'Value 5',
        selected: false
    }];

    protected disabled3:boolean = true;

 /*   public ngOnInit():void
    {
        this.values = [
            {
                value:    '0',
                caption:  'Value 1',
                selected: false
            },
            {
                value:    '1',
                caption:  'Value 2',
                selected: true
            },
            {
                value:    '2',
                caption:  'Value 3',
                selected: true
            },
            {
                value:    '3',
                caption:  'Value 4',
                selected: false
            },
            {
                value:    '4',
                caption:  'Value 5',
                selected: false
            }
        ];
    }*/
}
