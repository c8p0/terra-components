import {
    Component,
    DebugElement
} from '@angular/core';
import {
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { MatLabel } from '@angular/material/form-field';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

@Component({
    template: `<mat-form-field>
                    <mat-label>a certain label</mat-label>
                    <input matInput>
               </mat-form-field>`
})
class MaterialFormFieldTestComponent
{
}

fdescribe('Material form field styles', () =>
    {
        let component:MaterialFormFieldTestComponent;
        let fixture:ComponentFixture<MaterialFormFieldTestComponent>;

        let matFormField:DebugElement;

        beforeEach(() =>
            {
                TestBed.configureTestingModule({
                        declarations: [
                            MaterialFormFieldTestComponent
                        ],
                        imports: [
                            MatInputModule,
                            BrowserAnimationsModule
                        ]
                    });
            }
        );

        beforeEach(() =>
        {
            fixture = TestBed.createComponent(MaterialFormFieldTestComponent);
            component = fixture.componentInstance;
            matFormField = fixture.debugElement.query(By.css('.mat-form-field'));
            fixture.detectChanges();
        });

        it('should set a label with a certain font size', () =>
        {
            const labelFontSize:string = '18px';
            const matLabel:Element = matFormField.query(By.directive(MatLabel)).nativeElement;
            const fontSize:string = window.getComputedStyle(matLabel).fontSize;
            expect(fontSize).toEqual(labelFontSize);
        });
    }
);
