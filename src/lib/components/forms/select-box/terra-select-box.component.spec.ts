import { TerraSelectBoxComponent } from './terra-select-box.component';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule } from '@angular/forms';
import { L10nTranslationModule } from 'angular-l10n';
import { TerraSelectBoxValueInterface } from './data/terra-select-box.interface';
import { TooltipDirective } from '../../tooltip/tooltip.directive';
import { By } from '@angular/platform-browser';
import { AllowedColors } from './data/allowed.colors.enum';
import { DebugElement } from '@angular/core';
import { Router } from '@angular/router';
import { MockRouter } from '../../../testing/mock-router';
import { mockL10nConfig } from 'src/lib/testing/mock-l10n-config';

/**
 * @author mfrank
 */
describe('TerraSelectBoxComponent:', () => {
    let component: TerraSelectBoxComponent;
    let fixture: ComponentFixture<TerraSelectBoxComponent>;

    let listBoxValue1: TerraSelectBoxValueInterface = {
        caption: 'Value 01',
        value: 1
    };

    let listBoxValue2: TerraSelectBoxValueInterface = {
        caption: 'Value 02',
        value: 2
    };

    let listBoxValue3: TerraSelectBoxValueInterface = {
        caption: 'Value 03',
        value: 3,
        color: AllowedColors.add
    };

    let listBoxValues: Array<TerraSelectBoxValueInterface> = [listBoxValue1, listBoxValue2];
    const router: MockRouter = new MockRouter();

    beforeEach(() => {
        TestBed.configureTestingModule({
            declarations: [TooltipDirective, TerraSelectBoxComponent],
            imports: [FormsModule, L10nTranslationModule.forRoot(mockL10nConfig)],
            providers: [
                {
                    provide: Router,
                    useValue: router
                }
            ]
        });
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(TerraSelectBoxComponent);
        component = fixture.componentInstance;

        component.inputListBoxValues = []; // this also resets the selectedValue to null
        component.value = null;

        fixture.detectChanges();
    });

    it('should create an instance', () => {
        expect(component).toBeTruthy();
    });
    // TODO test does not work properly
    xit('should set color for caption', () => {
        component.inputListBoxValues.push(listBoxValue3);
        fixture.detectChanges();
        let selectBoxDE: DebugElement = fixture.debugElement.query(By.css('div.select-box'));
        let spanElement: DebugElement = selectBoxDE.query(By.css('span'));
        expect(spanElement.styles['color']).toBe('var(--color-group-add)');
    });
});
