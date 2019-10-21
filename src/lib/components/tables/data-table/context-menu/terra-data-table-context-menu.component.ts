import {
    Component,
    ElementRef,
    Input,
    OnDestroy,
    OnInit,
    ViewChild
} from '@angular/core';
import { TerraDataTableContextMenuEntryInterface } from './data/terra-data-table-context-menu-entry.interface';
import { TerraBaseData } from '../../../data/terra-base.data';
import { TerraDataTableContextMenuService } from './terra-data-table-context-menu.service';
import { isNullOrUndefined } from 'util';

/**
 * @author mkunze
 */
@Component({
    // tslint:disable-next-line
    selector:    'context-menu', // it still exists a terra-context-menu in terra, need to refactored first
    styleUrls:   ['./terra-data-table-context-menu.component.scss'],
    templateUrl: './terra-data-table-context-menu.component.html'
})
export class TerraDataTableContextMenuComponent<D extends TerraBaseData> implements OnInit, OnDestroy
{
    /**
     * @description list of links (buttons) to be shown in the context menu
     */
    @Input()
    public links:Array<TerraDataTableContextMenuEntryInterface<D>> = [];
    public _isShown:boolean = false;
    public _eventData:{ event:MouseEvent, data:D };

    protected top:number = 0;
    protected left:number = 0;

    @ViewChild('list')
    private list:ElementRef;

    private readonly clickListener:(event:Event) => void;

    /**
     * @description constructor
     * @param contextMenuService
     * @param elementRef
     */
    constructor(private contextMenuService:TerraDataTableContextMenuService<D>,
                private elementRef:ElementRef)
    {
        this.clickListener = (event:Event):void =>
        {
            this.clickedOutside(event);
        };
    }

    /**
     * @description initialisation life cycle hook.
     */
    public ngOnInit():void
    {
        this.contextMenuService.show.subscribe((eventData:{ event:MouseEvent, data:D }):void =>
        {
            this._eventData = eventData;
            this.isShown = !this.isShown;
        });
    }

    public ngOnDestroy():void
    {
        if(this._isShown)
        {
            window.document.body.removeChild(this.elementRef.nativeElement);
        }
    }

    private clickedOutside(event:Event):void
    {
        if(this._eventData.event.target !== event.target)
        {
            this.isShown = false;
        }
    }

    private set isShown(value:boolean)
    {
        if(this._isShown !== value && value)
        {
            window.document.body.appendChild(this.elementRef.nativeElement);
            document.addEventListener('click', this.clickListener, true);
        }
        else if(this._isShown !== value && !value)
        {
            window.document.body.removeChild(this.elementRef.nativeElement);
            document.removeEventListener('click', this.clickListener);
        }
        this._isShown = value;
        if(value)
        {
            let mousePosX:number = this._eventData.event.clientX; // left
            let mousePosY:number = this._eventData.event.clientY; // top

            let contextMenuHeight:number = this.list.nativeElement.offsetHeight;
            let contextMenuWidth:number = this.list.nativeElement.offsetWidth;

            let windowHeight:number = window.innerHeight;
            let windowWidth:number = window.innerWidth;

            let isOutsideRight:boolean = mousePosX + contextMenuWidth > windowWidth;
            let isOutsideBottom:boolean = mousePosY + contextMenuHeight > windowHeight;
            let isOutsideRightAndBottom:boolean = isOutsideRight && isOutsideBottom;

            if(isOutsideRightAndBottom)
            {
                this.top = mousePosY - contextMenuHeight;
                this.left = mousePosX - contextMenuWidth;
            }
            else if(isOutsideBottom)
            {
                this.top = mousePosY - contextMenuHeight;
                this.left = mousePosX;
            }
            else if(isOutsideRight)
            {
                this.top = mousePosY;
                this.left = mousePosX - contextMenuWidth;
            }
            else
            {
                this.top = mousePosY;
                this.left = mousePosX;
            }

            this._eventData.event.stopPropagation();
        }
    }

    public get _topAsString():string
    {
        return this.top + 'px';
    }

    public get _leftAsString():string
    {
        return this.left + 'px';
    }

    public get _linksAreSet():boolean
    {
        return !isNullOrUndefined(this.links) && this.links.length > 0;
    }
}
