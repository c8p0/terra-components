import { NgModule } from '@angular/core';
import { DocComponent } from './doc.component';
import { ComponentViewComponent } from './views/component-view/component-view.component';
import { ComponentTemplateComponent } from './components/component-template.component';
import { ComponentSidebarComponent } from './components/sidebar/component-sidebar.component';
import { RouterModule } from '@angular/router';
import {
    TerraComponentsExamplesModule,
    TerraComponentsModule
} from '../lib';
import { MarkdownModule } from 'ngx-markdown';
import { HttpClient } from '@angular/common/http';
import { LocalizationModule } from 'angular-l10n';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
    declarations: [
        DocComponent,
        ComponentViewComponent,
        ComponentTemplateComponent,
        ComponentSidebarComponent,
    ],
    imports: [
        BrowserModule,
        RouterModule.forRoot([]),
        LocalizationModule.forRoot({}),
        TerraComponentsModule,
        TerraComponentsExamplesModule,
        MarkdownModule.forRoot({loader:HttpClient})
    ],
    bootstrap: [DocComponent]
})
export class DocModule
{}
