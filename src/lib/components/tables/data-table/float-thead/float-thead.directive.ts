import {
    Directive,
    ElementRef,
    Input,
    OnDestroy,
    OnInit
} from '@angular/core';
import * as jQuery from 'jquery';
import {
    ActivatedRoute,
    NavigationEnd,
    Router,
    RouterEvent
} from '@angular/router';
import { filter } from 'rxjs/internal/operators';
import { ActivatedRouteHelper } from '../../../../helpers/index';
import {
    fromEvent,
    Subscription
} from 'rxjs';
import { isNullOrUndefined } from 'util';

require('./floatThead.js');

@Directive({
    selector: '[floatThead]'
})
export class FloatTheadDirective implements OnInit, OnDestroy
{
    /**
     * @description provide the `activatedRoute` to subscribe to router event and re-initialize the sticky table header on tab-switch.
     */
    @Input()
    public floatThead:ActivatedRoute;

    private navigationSubscription:Subscription;
    private windowSubscription:Subscription;
    private themeSwitched:boolean;

    constructor(private elementRef:ElementRef, private router:Router)
    {
    }

    public ngOnInit():void
    {
        if(this.floatThead)
        {
            this.initStickyTableHeader();

            this.navigationSubscription = this.router.events.pipe(filter((event:RouterEvent) => event instanceof NavigationEnd))
                                              .subscribe((event:NavigationEnd) =>
                                              {
                                                  if(event.url === ActivatedRouteHelper.getBasePathForActivatedRoute(this.floatThead.snapshot) &&
                                                     this.themeSwitched)
                                                  {
                                                      this.initStickyTableHeader();
                                                      this.themeSwitched = false;
                                                  }
                                              });

            if(window === window.top)
            {
                this.windowSubscription = fromEvent(window, 'themeSwitched').subscribe(() =>
                {
                    this.themeSwitched = true;
                });
            }
            else
            {
                this.windowSubscription = fromEvent(window.parent.window, 'themeSwitched').subscribe(() =>
                {
                    this.themeSwitched = true;
                });
            }
        }
    }

    public ngOnDestroy():void
    {
        if(!isNullOrUndefined(this.navigationSubscription))
        {
            this.navigationSubscription.unsubscribe();
        }

        if(!isNullOrUndefined(this.windowSubscription))
        {
            this.windowSubscription.unsubscribe();
        }
    }

    public initStickyTableHeader():void
    {
        const tableElement:any = jQuery(this.elementRef.nativeElement);
        const overflowContainer:JQuery<HTMLElement> = tableElement.closest('.overflow-auto');
        const stickyOffset:number = overflowContainer.offset().top;

        if(overflowContainer.length > 0)
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
