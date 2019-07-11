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
import { TerraButtonInterface } from '../../../lib';

@Component({
    selector:    'tc-component-view-v2',
    templateUrl: './component-view-v2.component.html',
    styleUrls:   ['./component-view-v2.component.scss']
})
export class ComponentViewV2Component implements OnInit
{
    protected component$:Observable<{ class:Type<any>, metadata:Component }>;
    protected readonly sourceToggle:Array<TerraButtonInterface> = [{
        icon: 'icon-placeholder_show_list',
        clickFunction: ():void => this.toggleSources()
    }];

    private source:boolean = false;
    private readonly annotations:string = '__annotations__';

    constructor(private route:ActivatedRoute)
    {}

    public ngOnInit():void
    {
        this.component$ = this.route.params.pipe(
            map((params:Params) =>
            {
                this.source = false;
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

    private toggleSources():void
    {
        this.source = !this.source;
    }

}
