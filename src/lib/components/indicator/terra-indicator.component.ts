import { Component, Input } from '@angular/core';
import { TerraIndicatorLabelTypeEnum } from '../../helpers/enums/indicator-label-type.enum';

@Component({
    selector: 'terra-indicator',
    styleUrls: ['./terra-indicator.component.scss'],
    templateUrl: './terra-indicator.component.html'
})
/** @deprecated since v5.0. Please use mat-badge or mat-chip instead */
export class TerraIndicatorComponent {
    @Input()
    public inputLabel: string;

    @Input()
    public inputType: TerraIndicatorLabelTypeEnum;

    constructor() {
        this.inputType = TerraIndicatorLabelTypeEnum.default;
    }

    public get _indicator(): string {
        return 'label-' + this.inputType;
    }
}
