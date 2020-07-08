import {
    ComponentFixture,
    TestBed
} from '@angular/core/testing';
import {
    Component,
    DebugElement,
    SimpleChange
} from '@angular/core';
import { By } from '@angular/platform-browser';
import { TooltipDirective } from './tooltip.directive';
import {
    Router,
    RouterEvent
} from '@angular/router';
import { Subject } from 'rxjs';


const routerEvents$:Subject<RouterEvent> = new Subject();
const routerStub:Partial<Router> = {
    events: routerEvents$.asObservable()
};

@Component({
    template: `<label [tcTooltip]="'Test'">test</label>`
})
class TooltipDirectiveHostComponent
{}

describe('TooltipDirective', () =>
{
    let component:TooltipDirectiveHostComponent;
    let fixture:ComponentFixture<TooltipDirectiveHostComponent>;
    let inputEl:DebugElement;
    let directive:TooltipDirective;

    beforeEach(() =>
    {
        TestBed.configureTestingModule({
            declarations: [
                TooltipDirective,
                TooltipDirectiveHostComponent
            ],
            providers:    [
                {
                    provide:  Router,
                    useValue: routerStub
                }]
        });
    });

    beforeEach(() =>
    {
        fixture = TestBed.createComponent(TooltipDirectiveHostComponent);
        component = fixture.componentInstance;
        directive = fixture.debugElement.query(By.directive(TooltipDirective)).injector.get(TooltipDirective);

        inputEl = fixture.debugElement.query(By.css('label'));
    });

    it('should create an instance', () =>
    {
        expect(component).toBeTruthy();
    });

    it('should trigger the tooltip on `mouseover` and hide it on `mouseout`', () =>
    {
        fixture.detectChanges();
        inputEl.triggerEventHandler('mouseover', new Event('MouseEvent'));
        fixture.detectChanges();

        expect(getTippyElement()).toBeTruthy();
        expect(isTooltipVisible()).toBe(true);

        inputEl.triggerEventHandler('mouseout', new Event('MouseEvent'));
        fixture.detectChanges();

        expect(isTooltipVisible()).toBe(false);
    });

    it('should not trigger the tooltip when `isDisabled`', () =>
    {
        directive.isDisabled = true;
        directive.ngOnChanges({
            isDisabled: new SimpleChange(null, true, true)
        });

        inputEl.triggerEventHandler('mouseover', new Event('MouseEvent'));
        fixture.detectChanges();
        expect(isTooltipVisible()).toBe(false);
    });

    it('should subscribe to router events on initialization', () =>
    {
        directive.ngOnInit();
        expect(routerEvents$.observers.length).toBe(1);
    });

    it('should unsubscribe to router events when destroyed', () =>
    {
       directive.ngOnInit();
       directive.ngOnDestroy();
       expect(routerEvents$.observers.length).toBe(0);
    });
});

function isTooltipVisible():boolean
{
    return !!getTippyElement();
}

function getTippyElement():Element
{
    // OPTION #1
    // const id:string = inputEl.nativeElement.getAttribute('aria-describedBy');
    // return document.getElementById(id);

    // OPTION #2
    return document.body.lastElementChild.hasAttribute('data-tippy-root')
        ? document.body.lastElementChild
        : null;
}

