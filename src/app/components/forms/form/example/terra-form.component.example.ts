import {
    Component,
    OnInit
} from '@angular/core';
import { FormTypeMap } from '../model/form-type-map';
import { TerraKeyValueInterface } from '../../../../models/terra-key-value.interface';
import { TerraFormFieldInterface } from '../model/terra-form-field.interface';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
    CategoryDataInterface,
    TerraFileBrowserService,
    TerraFrontendStorageService,
    TerraPagerInterface
} from '../../../../..';
import {
    map,
    tap
} from 'rxjs/operators';
import { TerraFormFieldHelper } from '../helper/terra-form-field.helper';
import { of } from 'rxjs/observable/of';

interface WidgetInterface
{
    identifier:string;
    settings:TerraKeyValueInterface<TerraFormFieldInterface>;
}

@Component({
    selector: 'terra-form-example',
    template: require('./terra-form.component.example.html'),
    providers: [
        TerraFileBrowserService,
        TerraFrontendStorageService
    ]
})
export class TerraFormComponentExample implements OnInit
{
    protected widgets$:Observable<Array<WidgetInterface>>;
    protected formTypeMap:FormTypeMap = new FormTypeMap();
    protected formValues:Array<any> = [];

    private readonly ceresContentWidgetsJsonUrl:string = 'https://raw.githubusercontent.com/plentymarkets/plugin-ceres/stable/contentWidgets.json';

    constructor(private http:HttpClient)
    {}

    public ngOnInit():void
    {
        let exampleCategory:CategoryDataInterface = {
            "id":               16,
            "parentCategoryId": null,
            "level":            1,
            "type":             "item",
            "linklist":         "Y",
            "right":            "all",
            "sitemap":          "Y",
            "hasChildren":      true,
            "details":          [{
                "categoryId":       16,
                "lang":             "de",
                "name":             "Wohnzimmer",
                "description":      "",
                "description2":     "",
                "shortDescription": "gro\u00df, hell, wundersch\u00f6n",
                "metaKeywords":     "moebel, wohnen, wohnzimmer",
                "metaDescription":  "",
                "nameUrl":          "wohnzimmer",
                "metaTitle":        "M\u00f6bel f\u00fcr Wohnzimmer",
                "position":         "1",
                "itemListView":     "ItemViewCategoriesList",
                "singleItemView":   "ItemViewSingleItem",
                "pageView":         "PageDesignContent",
                "fulltext":         "N",
                "metaRobots":       "ALL",
                "canonicalLink":    "",
                "previewUrl":       "http:\/\/master.plentymarkets.com\/wohnzimmer\/",
                "image":            null,
                "image2":           null,
                "plentyId":         160
            }],
            "clients":          [{"plentyId": 160}]
        };
        let categoryPickerService:any = {
            requestCategoryData: (categoryId:string | number, level:number):Observable<TerraPagerInterface<CategoryDataInterface>> =>
                                 {
                                     return of({
                                         "page":        1,
                                         "totalsCount": 9,
                                         "isLastPage":  true,
                                         "lastPageNumber": 1,
                                         "firstOnPage": 1,
                                         "lastOnPage": 9,
                                         "itemsPerPage": 50,
                                         "entries":     [exampleCategory]
                                     });
                                 },
            requestCategoryDataById: (id:number):Observable<CategoryDataInterface> => of(exampleCategory)
        };
        this.widgets$ = this.http.get<Array<WidgetInterface>>(this.ceresContentWidgetsJsonUrl).pipe(
            map((widgets:Array<WidgetInterface>) => widgets.map((widget:WidgetInterface) =>
            {
                widget.settings = TerraFormFieldHelper.injectOption(
                    widget.settings,
                    'category',
                    'categoryService',
                    categoryPickerService
                );
                return widget;
            })),
            tap((widgets:Array<WidgetInterface>) => this.formValues = Array(widgets.length))
        );
    }
}
