import {
    AfterViewInit,
    Compiler,
    Component,
    ComponentRef,
    ModuleWithComponentFactories,
    ModuleWithProviders,
    OnDestroy,
    OnInit,
    ViewChild,
    ViewContainerRef
} from '@angular/core';
import {
    ActivatedRoute,
    Data
} from '@angular/router';
import { Http } from '@angular/http';
import { Clipboard } from 'ts-clipboard';
import { combineLatest } from 'rxjs';
import { AlertService } from '../../../lib';

@Component({
    selector:  'component-view',
    template:  require('./component-view.component.html'),
    styleUrls: ['./component-view.component.scss']
})
export class ComponentViewComponent implements AfterViewInit, OnDestroy, OnInit
{

    public htmlFilledState:boolean;
    public cssFilledState:boolean;
    public bgColorGray:boolean;

    private _moduleWithProviders:ModuleWithProviders;
    private _componentRef:ComponentRef<any>;

    private _htmlPath:string;
    private _cssPath:string;
    private _tsPath:string;
    private _apiPath:string;
    private _overviewMarkDownPath:string;
    private _componentName:string;

    private _htmlToCopy:string;
    private _cssToCopy:string;
    private _tsToCopy:string;

    private _highlightedHtmlCode:string;
    private _highlightedCssCode:string;
    private _highlightedTsCode:string;
    private _apiCode:string;

    private bgColorValidationList:Array<string> = [];

    @ViewChild('viewChildTarget', {read: ViewContainerRef})
    private viewChildTarget:ViewContainerRef;


    constructor(private _jitCompiler:Compiler,
                private _activatedRoute:ActivatedRoute,
                private alertService:AlertService,
                public http:Http)
    {
        this._htmlPath = '';
        this._cssPath = '';
        this._tsPath = '';
        this._highlightedHtmlCode = '';
        this._highlightedCssCode = '';
        this._highlightedTsCode = '';
        this._htmlToCopy = '';
        this._cssToCopy = '';
        this._tsToCopy = '';
        this.cssFilledState = true;
        this.htmlFilledState = true;
        this.bgColorGray = false;
        this.bgColorValidationList.push('terra-portlet', 'terra-info-box', 'terra-filter', 'terra-base-toolbar', 'terra-card');
    }

    public ngOnInit():void
    {

        this.alertService.close('info');
        this._htmlPath = this._activatedRoute.routeConfig.data.htmlPath;
        this._cssPath = this._activatedRoute.routeConfig.data.cssPath;
        this._tsPath = this._activatedRoute.routeConfig.data.tsPath;
        this._apiPath = this._activatedRoute.routeConfig.data.apiPath;
        this._componentName = this._activatedRoute.routeConfig.data.componentName;
        this._overviewMarkDownPath = this._activatedRoute.routeConfig.data.OverviewMdPath;

        combineLatest(
            this.http.get(this._apiPath),
            this.http.get(this._htmlPath),
            this.http.get(this._cssPath),
            this.http.get(this._tsPath),
            (api:any, html:any, css:any, ts:any) =>
            {
                return {
                    api:  api.text(),
                    html: html.text(),
                    css:  css.text(),
                    ts:   ts.text()
                };
            }
        ).subscribe((data:any) =>
        {

            this.setSidebarData(!!(data.html), !!(data.css));
            this._apiCode = data.api;
            this._htmlToCopy = data.html;
            this._cssToCopy = data.css;
            this._tsToCopy = data.ts;
            // this._highlightedHtmlCode = this._highlightTextHelper.highlightText(this._htmlToCopy, 'xml');
            // this._highlightedCssCode = this._highlightTextHelper.highlightText(this._cssToCopy, 'css');
            // this._highlightedTsCode = this._highlightTextHelper.highlightText(this._tsToCopy, 'typescript');
            this.validateBackgroundColor(this._htmlToCopy);
        });

    }

    public ngAfterViewInit():void
    {
        if(this._activatedRoute.component['name'] === 'ComponentViewComponent')
        {
            this.loadComponentData(this._activatedRoute.data);
        }
    }

    public ngOnDestroy():void
    {
        if(this._componentRef)
        {
            this._componentRef.destroy();
        }
    }

    private loadComponentData(data:Data):void
    {
        data.subscribe((resolveData) =>
        {
            this._moduleWithProviders = resolveData.module as ModuleWithProviders;
            this.updateComponent();
        });
    }

    private updateComponent():void
    {
        this._jitCompiler.compileModuleAndAllComponentsAsync(this._moduleWithProviders.ngModule)
            .then((moduleWithFactories:ModuleWithComponentFactories<any>) =>
            {
                moduleWithFactories.componentFactories.forEach((factory) =>
                {
                    if(factory.componentType.name === 'CustomDynamicComponent')
                    {
                        this._componentRef = this.viewChildTarget.createComponent(factory);
                    }
                });
            });
    }

    private setSidebarData(htmlState, cssState):void
    {
        this.htmlFilledState = htmlState;
        this.cssFilledState = cssState;
    }

    private validateBackgroundColor(text:string):void
    {
        for(let item of this.bgColorValidationList)
        {
            if(text.includes(item))
            {
                this.bgColorGray = true;
            }
        }
    }

    protected copyText(text:string):void
    {

        Clipboard.copy(text);
        this.alertService.info('Text successfully copied to Clipboard!', 'info');
    }

}
