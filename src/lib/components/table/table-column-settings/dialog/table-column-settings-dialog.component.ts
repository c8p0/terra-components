import {
    Component,
    Inject
} from '@angular/core';
import { Language } from 'angular-l10n';
import {
    MAT_DIALOG_DATA,
    MatDialogRef
} from '@angular/material/dialog';
import { TableColumnSettingsDialogData } from '../interface/table-column-settings-dialog-data.interface';
import { MatColumnDef } from '@angular/material/table';

@Component({
    selector:    'tc-table-column-settings-dialog',
    templateUrl: './table-column-settings-dialog.component.html'
})
export class TableColumnSettingsDialogComponent
{
    public _columns:Array<MatColumnDef> = [];
    public _selectedColumns:Array<string> = [];
    @Language()
    public _lang:string;

    constructor(public dialogRef:MatDialogRef<TableColumnSettingsDialogComponent>,
                @Inject(MAT_DIALOG_DATA) public data:TableColumnSettingsDialogData)
    {
    }

    /**
     * @description Assign the injected data to the component properties.
     */
    public ngOnInit():void
    {
        this._columns = this.data.columns;
        this._selectedColumns = this.data.selectedColumns;
    }
}
