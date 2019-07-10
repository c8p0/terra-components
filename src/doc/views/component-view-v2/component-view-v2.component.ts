import {
    Component,
    OnInit,
    Type
} from '@angular/core';
import {
    ActivatedRoute,
    Params
} from '@angular/router';
import {
    map,
    tap
} from 'rxjs/operators';
import { examples } from '../../../lib/components/example-collection';
import { Observable } from 'rxjs';

@Component({
    selector:    'tc-component-view-v2',
    templateUrl: './component-view-v2.component.html',
    styleUrls:   ['./component-view-v2.component.scss']
})
export class ComponentViewV2Component implements OnInit
{
    protected component$:Observable<Type<any>>;

    constructor(private route:ActivatedRoute)
    {
    }

    public ngOnInit():void
    {
        this.component$ = this.route.params.pipe(
            map((params:Params) => examples.find((example:Type<any>) =>
                {
                    return example.name.toLowerCase().startsWith(params['componentName'].toLowerCase());
                })
            ),
            tap((component:Type<any>) => console.log('Component: ' + component.name))
        );
    }

}
