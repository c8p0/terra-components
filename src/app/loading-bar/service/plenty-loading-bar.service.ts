import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import { Subscriber } from 'rxjs/Subscriber';
import {
    PlentyLoadingBarEvent,
    PlentyLoadingBarEventType
} from '../event/plenty-loading-bar-event';

/**
 * SlimLoadingBar service helps manage Slim Loading bar on the top of screen or parent component
 */
@Injectable()
export class PlentyLoadingBarService
{
    private _progress: number = 0;
    private _height: string = '2px';
    private _color: string = 'firebrick';
    private _visible: boolean = true;

    private _intervalCounterId: any = 0;
    private interval: number = 500; // in milliseconds

    public observable: Observable<PlentyLoadingBarEvent>;
    private subscriber: Subscriber<PlentyLoadingBarEvent>;

    constructor()
    {
        this.observable = new Observable<PlentyLoadingBarEvent>((subscriber: Subscriber<PlentyLoadingBarEvent>) =>
        {
            this.subscriber = subscriber;
        });
    }

    public set progress(value: number)
    {
        if(value != null)
        {
            if(value > 0)
            {
                this.visible = true;
            }
            this._progress = value;
            this.emitEvent(new PlentyLoadingBarEvent(PlentyLoadingBarEventType.PROGRESS, this._progress));
        }
    }

    public get progress(): number
    {
        return this._progress;
    }

    public set height(value: string)
    {
        if(value != null)
        {
            this._height = value;
            this.emitEvent(new PlentyLoadingBarEvent(PlentyLoadingBarEventType.HEIGHT, this._height));
        }
    }

    public get height(): string
    {
        return this._height;
    }

    public set color(value: string)
    {
        if(value != null)
        {
            this._color = value;
            this.emitEvent(new PlentyLoadingBarEvent(PlentyLoadingBarEventType.COLOR, this._color));
        }
    }

    public get color(): string
    {
        return this._color;
    }

    public set visible(value: boolean)
    {
        if(value != null)
        {
            this._visible = value;
            this.emitEvent(new PlentyLoadingBarEvent(PlentyLoadingBarEventType.VISIBLE, this._visible));
        }
    }

    public get visible(): boolean
    {
        return this._visible;
    }

    private emitEvent(event: PlentyLoadingBarEvent)
    {
        if(this.subscriber)
        {
            // Push up a new event
            this.subscriber.next(event);
        }
    }

    public start(): void
    {
        // Stop current timer
        this.stop();
        // Make it visible for sure
        this.visible = true;
        // Run the timer with milliseconds iterval
        this._intervalCounterId = setInterval(() =>
                                              {
                                                  // Increment the progress and update view component
                                                  this.progress++;
                                                  // If the progress is 100% - call complete
                                                  if(this.progress === 100)
                                                  {
                                                      this.complete();
                                                  }
                                              }, this.interval);
    }

    public stop(): void
    {
        if(this._intervalCounterId)
        {
            clearInterval(this._intervalCounterId);
            this._intervalCounterId = null;
        }
    }

    public reset(): void
    {
        this.stop();
        this.progress = 0;
    }

    public complete(): void
    {
        this.progress = 100;
        this.stop();
        setTimeout(() =>
                   {
                       // Hide it away
                       this.visible = false;
                       setTimeout(() =>
                                  {
                                      // Drop to 0
                                      this.progress = 0;
                                  }, 250);
                   }, 250);
    }

}
