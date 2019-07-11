import {
    Component,
    OnInit,
    Type,
    ViewChild
} from '@angular/core';
import {
    ActivatedRoute,
    Params
} from '@angular/router';
import { map } from 'rxjs/operators';
import { examples } from '../../../lib/components/example-collection';
import { Observable } from 'rxjs';
import { TabsetComponent } from 'ngx-bootstrap';

@Component({
    selector:    'tc-component-view-v2',
    templateUrl: './component-view-v2.component.html',
    styleUrls:   ['./component-view-v2.component.scss']
})
export class ComponentViewV2Component implements OnInit
{
    protected component$:Observable<{ class:Type<any>, metadata:Component }>;

    private readonly annotations:string = '__annotations__';

    @ViewChild('tabs')
    private tabs:TabsetComponent;

    constructor(private route:ActivatedRoute)
    {}

    public ngOnInit():void
    {
        this.component$ = this.route.params.pipe(
            map((params:Params) =>
            {
                this.selectTab(0);
                const component:Type<any> = examples.find((example:Type<any>) =>
                {
                    return example.name.toLowerCase().startsWith(params['componentName'].toLowerCase());
                });
                const decorator:Component = component[this.annotations][0];
                return {
                    class:    component,
                    metadata: decorator
                };
            }),
        );
    }

    protected selectTab(tabId:number):void
    {
        if(this.tabs)
        {
            this.tabs.tabs[tabId].active = true;
        }
    }

}
