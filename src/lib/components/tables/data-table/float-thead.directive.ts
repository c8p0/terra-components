import {
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    OnInit
} from '@angular/core';
require('./lib/floatThead.js');
import * as jQuery from 'jquery';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterEvent
} from '@angular/router';
import { filter } from 'rxjs/internal/operators';
import { ActivatedRouteHelper } from '../../../helpers';
import { Subscription } from 'rxjs/index';
import { isNullOrUndefined } from 'util';

@Directive({
    selector: '[floatThead]'
})
export class FloatTheadDirective implements OnInit, OnDestroy
{
    @Input()
    public floatThead:ActivatedRoute;

    private subscription:Subscription;

    constructor(private elementRef:ElementRef, private router:Router)
    {
    }

    public ngOnInit():void
    {
        if(this.floatThead)
        {
            this.initStickyTableHeader();

            this.subscription = this.router.events.pipe(filter((event:RouterEvent) => event instanceof NavigationEnd)).subscribe((event:NavigationEnd) =>
            {
                if(event.url === ActivatedRouteHelper.getBasePathForActivatedRoute(this.floatThead.snapshot))
                {
                    this.initStickyTableHeader();
                }
            });
        }
    }

    ngOnDestroy():void
    {
        if(!isNullOrUndefined(this.subscription))
        {
            this.subscription.unsubscribe();
        }
    }

    public initStickyTableHeader():void
    {
        const tableElement:any = jQuery(this.elementRef.nativeElement);
        const overflowContainer:JQuery<HTMLElement> = tableElement.closest('.overflow-auto');
        const stickyOffset:number = overflowContainer.offset().top;

        if (overflowContainer.length > 0)
        {
            tableElement.floatThead('destroy');
            tableElement.floatThead({
                responsiveContainer: function(table:JQuery<HTMLElement>):JQuery<HTMLElement>
                                     {
                                         return table.closest('.table-responsive');
                                     },
                position:            'fixed',
                zIndex:              '2',
                top:                 stickyOffset
            });

            overflowContainer.scroll(function():void
            {
                tableElement.trigger('reflow');
            });
        }
    }
}
