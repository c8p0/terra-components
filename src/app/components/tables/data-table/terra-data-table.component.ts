

/**
 * @author pweyrich
 */
import {
    Component,
    EventEmitter,
    Input,
    OnChanges,
    OnInit,
    Output,
    SimpleChanges
} from '@angular/core';
import { TerraDataTableContextMenuService } from './context-menu/service/terra-data-table-context-menu.service';
import {
    animate,
    state,
    style,
    transition,
    trigger
} from '@angular/animations';
import { TerraDataTableBaseService } from './terra-data-table-base.service';
import { TerraDataTableHeaderCellInterface } from './cell/terra-data-table-header-cell.interface';
import { TerraDataTableRowInterface } from './row/terra-data-table-row.interface';
import { TerraDataTableSortOrder } from './terra-data-table-sort-order.enum';
import { TerraButtonInterface } from '../../buttons/button/data/terra-button.interface';
import {
    TerraRefTypeEnum,
    TerraRefTypeInterface
} from './cell/terra-ref-type.interface';
import {
    TerraDataTableCellInterface,
    TerraDataTableTextInterface,
    TerraPagerInterface,
    TerraTagInterface
} from '../../../..';
import {
    isArray,
    isNullOrUndefined
} from 'util';
import { TerraTextAlignEnum } from './cell/terra-text-align.enum';
import { StringHelper } from '../../../helpers/string.helper';
import { TerraPlacementEnum } from '../../../helpers/enums/terra-placement.enum';

@Component({
    selector:   'terra-data-table',
    template:   require('./terra-data-table.component.html'),
    styles:     [require('./terra-data-table.component.scss')],
    providers:  [TerraDataTableContextMenuService],
    animations: [
        trigger('collapsedState', [
            state('hidden', style({
                height:          '0',
                overflow:        'hidden',
                'margin-bottom': '0'
            })),
            state('collapsed', style({
                height:          '*',
                overflow:        'initial',
                'margin-bottom': '6px'
            })),
            transition('hidden <=> collapsed', [
                animate(300)

            ])
        ])
    ]
})
export class TerraDataTableComponent<T, P> implements OnInit, OnChanges
{
    /**
     * @description Service, that is used to request the table data from the server
     */
    @Input() inputService:TerraDataTableBaseService<T, P>;
    /**
     * @description List of header cell elements
     */
    @Input() inputHeaderList:Array<TerraDataTableHeaderCellInterface>;
    /**
     * @description List of table rows containing all the data
     */
    @Input() inputRowList:Array<TerraDataTableRowInterface<T>>;

    /**
     * @description enables the user to sort the table by selected columns
     */
    @Input() inputIsSortable:boolean;
    /**
     * @description show checkboxes in the table, to be able to select any row
     */
    @Input() inputHasCheckboxes:boolean;
    /**
     * @description show/hides the pager above the table
     */
    @Input() inputHasPager:boolean;
    /**
     * @description Primary text for no results notice
     */
    @Input() inputNoResultTextPrimary:string;
    /**
     * @description Secondary text for no results notice
     */
    @Input() inputNoResultTextSecondary:string;
    /**
     * @description Buttons for no results notice
     */
    @Input() inputNoResultButtons:Array<TerraButtonInterface>;
    @Input() inputShowGroupFunctions:boolean = false;
    @Input() inputGroupFunctionExecuteButtonIsDisabled:boolean = true;

    /**
     * @description EventEmitter that notifies when a row has been selected via the select box. This is enabled, only if
     *     `inputHasCheckboxes` is true.
     */
    @Output() outputRowCheckBoxChanged:EventEmitter<TerraDataTableRowInterface<T>> = new EventEmitter();
    @Output() outputGroupFunctionExecuteButtonClicked:EventEmitter<Array<TerraDataTableRowInterface<T>>> = new EventEmitter();

    private _headerCheckbox:{ checked:boolean, isIndeterminate:boolean };
    private _selectedRowList:Array<TerraDataTableRowInterface<T>>;
    private _sortOrderEnum = TerraDataTableSortOrder;
    private _refTypeEnum = TerraRefTypeEnum;
    
    /**
     * @description Constructor initializing the table component
     */
    constructor()
    {
        // set default input values
        this.inputHasCheckboxes = true;
        this.inputHasPager = true;
        this.inputIsSortable = false;

        // initialize local variables
        this._selectedRowList = [];
        this._headerCheckbox = {
            checked:         false,
            isIndeterminate: false
        };
    }

    protected get getCollapsedState():string
    {
        if(this.inputShowGroupFunctions)
        {
            return 'collapsed';
        }
        else
        {
            return 'hidden';
        }
    }

    /**
     * @description Initialization routine. It sets up the pager.
     */
    public ngOnInit():void
    {
        this.initPagination();
    }

    /**
     * @description Change detection routine. It resets the sorting configuration if the header list is updated.
     * @param {SimpleChanges} changes
     */
    public ngOnChanges(changes:SimpleChanges):void
    {
        if(changes['inputHeaderList'])
        {
            if(this.inputIsSortable)
            {
                this.resetSorting();
            }
        }
    }

    /**
     * default initialization of the paging information which are stored in the input service
     */
    private initPagination()
    {
        let itemsPerPage:number = 25;
        if(this.inputService.defaultPagingSize)
        {
            itemsPerPage = this.inputService.defaultPagingSize;
        }
        else if(this.inputService.pagingSizes && this.inputService.pagingSizes[0])
        {
            itemsPerPage = this.inputService.pagingSizes[0].value;
        }

        // init paging data
        this.inputService.updatePagingData({
            page:           1,
            itemsPerPage:   itemsPerPage,
            totalsCount:    1,
            isLastPage:     true,
            lastPageNumber: 1,
            lastOnPage:     1,
            firstOnPage:    1
        });
    }

    protected onHeaderCheckboxChange():void
    {
        if(this._headerCheckbox.checked)
        {
            this.resetSelectedRows();
        }
        else
        {
            this.selectAllRows();
        }
    }

    protected onRowCheckboxChange(row:TerraDataTableRowInterface<T>):void
    {
        // notify component user
        this.outputRowCheckBoxChanged.emit(row);

        // update row selection
        if(this.isSelectedRow(row))
        {
            this.deselectRow(row);
        }
        else
        {
            this.selectRow(row);
        }

        // update header checkbox state
        this.updateHeaderCheckboxState();
    }

    private checkHeaderCheckbox():void
    {
        this._headerCheckbox.checked = true;
        this._headerCheckbox.isIndeterminate = false;
    }

    private uncheckHeaderCheckbox():void
    {
        this._headerCheckbox.checked = false;
        this._headerCheckbox.isIndeterminate = false;
    }

    private setHeaderCheckboxIndeterminate():void
    {
        this._headerCheckbox.checked = false;
        this._headerCheckbox.isIndeterminate = true;
    }

    private updateHeaderCheckboxState():void
    {
        if(this.selectedRowList.length === 0) // anything selected?
        {
            this.uncheckHeaderCheckbox();
        }
        else if(this.selectedRowList.length > 0 && this.inputRowList.length === this.selectedRowList.length) // all selected?
        {
            this.checkHeaderCheckbox();
        }
        else // some rows selected -> indeterminate
        {
            this.setHeaderCheckboxIndeterminate();
        }
    }

    private selectRow(row:TerraDataTableRowInterface<T>):void
    {
        // check if row is already selected
        if(this.selectedRowList.find((r:TerraDataTableRowInterface<T>) => r === row))
        {
            return;
        }

        // add row to selected row list
        this.selectedRowList.push(row);
    }

    private deselectRow(row:TerraDataTableRowInterface<T>):void
    {
        // get index of the row in the selected row list
        let rowIndex:number = this.selectedRowList.indexOf(row);

        // check if selected row list contains the given row
        if(rowIndex >= 0)
        {
            // remove row from selected row list
            this.selectedRowList.splice(rowIndex, 1);
        }
    }

    private selectAllRows():void
    {
        this.checkHeaderCheckbox();

        this.inputRowList.forEach((row) =>
        {
            if(!row.disabled)
            {
                this.selectRow(row);
            }
        });
    }

    private resetSelectedRows():void
    {
        this.uncheckHeaderCheckbox();

        // reset selected row list
        this._selectedRowList = [];
    }

    private isSelectedRow(row:TerraDataTableRowInterface<T>):boolean
    {
        return this.selectedRowList.indexOf(row) >= 0;
    }

    /**
     * @description Getter for selectedRowList
     * @returns {Array<TerraDataTableRowInterface<T>>}
     */
    public get selectedRowList():Array<TerraDataTableRowInterface<T>>
    {
        return this._selectedRowList;
    }

    protected rowClicked(cell:TerraDataTableCellInterface, row:TerraDataTableRowInterface<T>):void
    {
        let dataType:string = this.getCellDataType(cell.data);
        if(dataType !== 'buttons' && !row.disabled)
        {
            this.inputRowList.forEach((r:TerraDataTableRowInterface<T>) =>
            {
                r.isActive = false;
            });

            row.isActive = true;
            row.clickFunction();
        }
    }

    protected checkTooltipPlacement(placement:string):string
    {
        if(!StringHelper.isNullUndefinedOrEmpty(placement))
        {
            return placement;
        }

        return TerraPlacementEnum.TOP;
    }

    protected isTableDataAvailable():boolean
    {
        return this.inputRowList && this.inputRowList.length > 0;
    }

    protected isNoResultsNoticeDefined():boolean
    {
        return (this.inputNoResultButtons && this.inputNoResultButtons.length > 0) || // a button is given
               (this.inputNoResultTextPrimary && this.inputNoResultTextPrimary.length > 0) || // a primary text is given
               (this.inputNoResultTextSecondary && this.inputNoResultTextSecondary.length > 0); // a secondary text is given
    }

    protected doPaging(pagerData:TerraPagerInterface<T>):void
    {
        // request data from server
        this.getResults();

        // reset row selections
        this.resetSelectedRows();
    }

    protected getCellDataType(data:any):string
    {
        function isRefType(arg:any):arg is TerraRefTypeInterface
        {
            return !isNullOrUndefined(arg)
                   && !isNullOrUndefined(arg.type) && typeof arg.type === 'string'
                   && !isNullOrUndefined(arg.value) && (typeof arg.value === 'string' || typeof arg.value === 'number' || typeof arg.value === 'function');
        }

        function isTextType(arg:any):arg is TerraDataTableTextInterface
        {
            return !isNullOrUndefined(arg) && !isNullOrUndefined(arg.caption) && typeof arg.caption === 'string';
        }

        function isTagArray(arg:any):arg is Array<TerraTagInterface>
        {
            // check if it is an array
            if(!isArray(arg))
            {
                return false;
            }

            // check if every element of the array implements the tag interface
            let implementsInterface:boolean = arg.every((elem:any) =>
            {
                return !isNullOrUndefined(elem.name) && typeof elem.name === 'string';
            });

            return !isNullOrUndefined(arg) && implementsInterface;
        }

        function isButtonArray(arg:any):arg is Array<TerraButtonInterface>
        {
            // check if it is an array
            if(!isArray(arg))
            {
                return false;
            }

            // check if every element of the array implements the button interface
            let implementsInterface:boolean = arg.every((elem:any) =>
            {
                return !isNullOrUndefined(elem.clickFunction) && typeof elem.clickFunction === 'function';
            });

            return !isNullOrUndefined(arg) && implementsInterface;
        }

        if(typeof data === 'object')
        {
            if(isRefType(data))
            {
                return 'TerraRefTypeInterface';
            }
            else if(isTextType(data))
            {
                return 'TerraDataTableTextInterface';
            }
            else if(isTagArray(data))
            {
                return 'tags';
            }
            else if(isButtonArray(data))
            {
                return 'buttons';
            }
        }
        return typeof data;
    }

    protected onColumnHeaderClick(header:TerraDataTableHeaderCellInterface):void
    {
        // change sorting column and order only if no request is pending and sortBy attribute is given
        if(!this.inputService.requestPending && this.inputIsSortable && header.sortBy)
        {
            this.changeSortingColumn(header);
        }
    }

    private changeSortingColumn(header:TerraDataTableHeaderCellInterface):void
    {
        // clicked on the same column?
        if(this.inputService.sortBy === header.sortBy)
        {
            // only change sorting order
            this.toggleSortingOrder();
        }
        else
        {
            this.inputService.sortBy = header.sortBy;
            this.inputService.sortOrder = TerraDataTableSortOrder.DESCENDING; // default is descending
        }

        // get Results with updated parameter
        this.getResults();
    }

    private toggleSortingOrder():void
    {
        this.inputService.sortOrder = this.inputService.sortOrder === TerraDataTableSortOrder.DESCENDING ?
            TerraDataTableSortOrder.ASCENDING :
            TerraDataTableSortOrder.DESCENDING;
    }

    private resetSorting():void
    {
        // sort by the first sortable column, if available
        let defaultSortColumn:TerraDataTableHeaderCellInterface = this.getFirstSortableColumn();
        if(this.inputHeaderList && defaultSortColumn)
        {
            this.inputService.sortBy = defaultSortColumn.sortBy;
            this.inputService.sortOrder = TerraDataTableSortOrder.DESCENDING;
        }
    }

    private getFirstSortableColumn():TerraDataTableHeaderCellInterface
    {
        // check if header list is given
        if(this.inputHeaderList)
        {
            // find first header cell where sortBy attribute is given
            let headerCell:TerraDataTableHeaderCellInterface;
            headerCell = this.inputHeaderList.find((header:TerraDataTableHeaderCellInterface) => !isNullOrUndefined(header.sortBy));
            if(headerCell)
            {
                return headerCell;
            }
        }

        // return null if nothing is found
        return null;
    }

    private getResults():void
    {
        this.inputService.getResults();
    }

    protected onGroupFunctionExecuteButtonClicked(event:Event):void
    {
        this.outputGroupFunctionExecuteButtonClicked.emit(this._selectedRowList);
    }

    protected getTextAlign(item:TerraDataTableHeaderCellInterface):TerraTextAlignEnum
    {

        if(!isNullOrUndefined(item.textAlign))
        {
            return item.textAlign;
        }
        else
        {
            return TerraTextAlignEnum.LEFT;
        }
    }
}
