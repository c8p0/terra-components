import {
    Component,
    ViewChild,
    Input,
    Output,
    AfterViewInit,
    EventEmitter
} from '@angular/core';
import {
    ModalDirective
} from 'ng2-bootstrap/ng2-bootstrap';

/**
 * @author mfrank
 */
@Component({
               selector: 'plenty-overlay',
               styles:   [require('./plenty-overlay.component.scss').toString()],
               template: require('./plenty-overlay.component.html')
           })
export class PlentyOverlay implements AfterViewInit
{
    @ViewChild('overlay') public overlay:ModalDirective;

    @Input() addButtonTooltip:string;
    @Input() cancelButtonTooltip:string;
    @Input() saveButtonTooltip:string;
    @Input() overlayTitle:string;
    @Input() hasPrimaryButton:boolean = false;
    @Input() hasSecondaryButton:boolean = false;
    @Input() hasSaveButton:boolean = false;
    @Input() isStatic:boolean = false;
    @Input() isCloseable:boolean = true;
    @Input() isLarge:boolean = false;
    @Input() isSmall:boolean = false;

    @Output() primaryButtonClicked = new EventEmitter<PlentyOverlay>();
    @Output() secondaryButtonClicked = new EventEmitter<PlentyOverlay>();
    @Output() saveButtonClicked = new EventEmitter<PlentyOverlay>();

    constructor()
    {
    }

    ngAfterViewInit()
    {
        if(!this.isCloseable)
        {
            this.isStatic = true;
        }

        if(this.isStatic)
        {
            this.overlay.config.backdrop = 'static';
            this.overlay.config.keyboard = false;
        }
    }

    private primaryClicked():void
    {
        this.primaryButtonClicked.emit(this);
    }

    private secondaryClicked():void
    {
        this.secondaryButtonClicked.emit(this);
    }

    public showOverlay():void
    {
        this.overlay.show();
    }

    public hideOverlay():void
    {
        this.overlay.hide();
    }
}
