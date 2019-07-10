import {
    NgModule,
    Type
} from '@angular/core';
import { DocComponent } from './doc.component';
import { ComponentViewComponent } from './views/component-view/component-view.component';
import { ComponentTemplateComponent } from './components/component-template.component';
import { ComponentSidebarComponent } from './components/sidebar/component-sidebar.component';
import {
    Route,
    RouterModule,
    Routes
} from '@angular/router';
import {
    TerraComponentsExamplesModule,
    TerraComponentsModule
} from '../lib';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { LocalizationModule } from 'angular-l10n';
import { BrowserModule } from '@angular/platform-browser';

const routes:Routes = [
    {
        path: '',
        pathMatch: 'full',
        redirectTo: 'components'
    },
    {
        path: 'components',
        component: ComponentTemplateComponent,
        children: [
            {
                path: ':componentName',
                component: ComponentViewComponent
            }
        ]
    }
];

@NgModule({
    declarations: [
        DocComponent,
        ComponentViewComponent,
        ComponentTemplateComponent,
        ComponentSidebarComponent,
    ],
    imports:      [
        BrowserModule,
        RouterModule.forRoot(routes),
        LocalizationModule.forRoot({}),
        TerraComponentsModule,
        TerraComponentsExamplesModule,
        MarkdownModule.forRoot({loader: HttpClient})
    ],
    bootstrap:    [DocComponent]
})
export class DocModule
{
}
