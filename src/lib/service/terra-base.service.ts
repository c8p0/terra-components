/* tslint:disable:restrict-leading-underscore max-file-line-count */
import {
    Headers,
    Http,
    Response,
    URLSearchParams
} from '@angular/http';
import {
    Observable,
    of,
    throwError
} from 'rxjs';
import { Exception } from './data/exception.interface';
import {
    isArray,
    isNull,
    isNullOrUndefined,
    isObject
} from 'util';
import { TerraAlertComponent } from '../components/alert/terra-alert.component';
import { TerraLoadingSpinnerService } from '../components/loading-spinner/service/terra-loading-spinner.service';
import { TerraBaseParameterInterface } from '../components/data/terra-base-parameter.interface';
import {
    catchError,
    finalize,
    map,
    tap
} from 'rxjs/operators';
import { TerraQueryEncoder } from './data/terra-query-encoder';
import { DispatchHelper } from '../helpers/dispatch.helper';

/**
 * @author mfrank
 * @deprecated since v3.14.0. Use angular's [HttpClient](https://angular.io/guide/http) instead.
 */
// Please keep the todo comments until TerraBaseService refactoring
// TODO TerraBaseService<D> or maybe TerraBaseService<D extends BaseData>
export class TerraBaseService
{
    public headers:Headers;
    public url:string;

    // TODO use D instead of any
    protected dataModel:{ [dataId:number]:any } = {};

    private _alert:TerraAlertComponent = TerraAlertComponent.getInstance();

    constructor(private terraLoadingSpinnerService:TerraLoadingSpinnerService,
                private _baseHttp:Http,
                private baseUrl:string,
                private isPlugin?:boolean)
    {
        this.headers = new Headers({'Content-Type': 'application/json'});
        this.setAuthorization();
        this.url = baseUrl;

        if(isNullOrUndefined(this.isPlugin))
        {
            this.isPlugin = false;
        }
    }

    public get http():Http
    {
        return this._baseHttp;
    }

    public get isLoading():boolean
    {
        return this.terraLoadingSpinnerService.isLoading;
    }

    protected setToHeader(key:string, value:string):void
    {
        this.headers.set(key, value);
    }

    protected deleteFromHeader(key:string):void
    {
        this.headers.delete(key);
    }

    protected setAuthorization():void
    {
        if(localStorage.getItem('accessToken'))
        {
            this.setToHeader('Authorization', 'Bearer ' + localStorage.getItem('accessToken'));
        }
    }

    // TODO use D instead of any, use a meaningful error type
    protected mapRequest(request:Observable<any>, err?:(error:any) => void, isRaw?:boolean):Observable<any>
    {
        this.terraLoadingSpinnerService.start();

        return request.pipe(
            map((response:Response) =>
            {
                if(response.status === 204)
                {
                    return response.text();
                }
                else if(isRaw)
                {
                    return response;
                }
                else
                {
                    return response.text() === '' ? {} : response.json();
                }
            }),
            catchError((error:any) =>
            {
                if(err)
                {
                    err(error);
                }
                else
                {
                    this.handleException(error);
                }

                if(error.status === 403) // Forbidden
                {
                    let missingUserPermissionAlertMessage:string = this.getMissingUserPermissionAlertMessage(error);

                    if(this.isPlugin)
                    {
                        this._alert.addAlertForPlugin({
                            msg:              missingUserPermissionAlertMessage,
                            type:             'danger',
                            dismissOnTimeout: 0
                        });
                    }
                    else
                    {
                        this._alert.addAlert({
                            msg:              missingUserPermissionAlertMessage,
                            type:             'danger',
                            dismissOnTimeout: 0
                        });
                    }
                }
                // END Very unclean workaround!
                else if(error.status === 401) // Unauthorized
                {
                    DispatchHelper.dispatchEvent(new CustomEvent('routeToLogin'));
                }

                return throwError(error);
            }),
            finalize(() => this.terraLoadingSpinnerService.stop())
        );
    }

    /**
     * Workaround to prevent the injection of the TranslationService in every Service, that extends TerraBaseService
     * @returns {string}
     */
    protected getErrorString():string
    {
        // get language from localStorage
        let langInLocalStorage:string = localStorage.getItem('plentymarkets_lang_');

        // translate error string
        switch(langInLocalStorage)
        {
            case 'de':
                return 'Fehler';
            case 'en':
                return 'Error';
            default:
                return 'Error';
        }
    }

    /**
     * @param {TerraBaseParameterInterface} params
     * @param {boolean} arrayAsArray - Defines if an array search param should interpret and parsed as an array or not. Default is false.
     * @returns {URLSearchParams}
     */
    protected createUrlSearchParams(params:TerraBaseParameterInterface, arrayAsArray:boolean = false):URLSearchParams
    {
        let searchParams:URLSearchParams = new URLSearchParams('', new TerraQueryEncoder());

        if(!isNullOrUndefined(params))
        {
            Object.keys(params).forEach((key:string) =>
            {
                if(!isNullOrUndefined(params[key]) && params[key] !== '')
                {
                    if(arrayAsArray && isArray(params[key]))
                    {
                        searchParams.appendAll(this.createArraySearchParams(key, params[key]));
                    }
                    else
                    {
                        searchParams.set(key, params[key]);
                    }
                }

            });
        }

        return searchParams;
    }

    /**
     * @deprecated use ModelCache instead
     */
    // TODO remove generic if the BaseService get a generic itself
    protected handleLocalDataModelGetList(getRequest$:Observable<Response>, params?:TerraBaseParameterInterface):Observable<Array<any>>
    {
        if(Object.keys(this.dataModel).length > 0 && this.hasAllParamsLoaded(params))
        {
            return of(Object.values(this.dataModel));
        }

        this.setAuthorization();

        return this.mapRequest(getRequest$).pipe(
            tap((dataList:Array<any>) =>
                dataList.forEach((data:any) =>
                {
                    this.dataModel[data.id] = Object.assign(data, this.dataModel[data.id]);
                })
            )
        );
    }

    /**
     * @deprecated use ModelCache instead
     */
    // TODO remove generic if the BaseService get a generic itself
    protected handleLocalDataModelGet(getRequest$:Observable<Response>, dataId:number|string):Observable<any>
    {
        if(!isNullOrUndefined(this.dataModel[dataId]))
        {
            return of(this.dataModel[dataId]);
        }

        this.setAuthorization();

        return this.mapRequest(getRequest$).pipe(
            tap((data:any) => this.dataModel[dataId] = data)
        );
    }

    /**
     * @deprecated use ModelCache instead
     */
    // TODO remove generic if the BaseService get a generic itself
    protected handleLocalDataModelPost(postRequest$:Observable<Response>, dataId:number|string):Observable<any>
    {
        this.setAuthorization();

        return this.mapRequest(postRequest$).pipe(
            tap((data:any) =>
            {
                if(isNullOrUndefined(this.dataModel[dataId]))
                {
                    this.dataModel[dataId] = [];
                }
                this.dataModel[dataId].push(data);
            })
        );
    }

    /**
     * @deprecated use ModelCache instead
     */
    // TODO remove generic if the BaseService get a generic itself
    protected handleLocalDataModelPut(putRequest$:Observable<Response>, dataId:number|string):Observable<any>
    {
        this.setAuthorization();

        return this.mapRequest(putRequest$).pipe(
            tap((data:any) =>
            {
                let dataToUpdate:any;

                if(!isNullOrUndefined(this.dataModel[dataId]))
                {
                    dataToUpdate = this.dataModel[dataId].find((dataItem:any) => dataItem.id === data.id);
                }

                if(!isNullOrUndefined(dataToUpdate))
                {
                    dataToUpdate = data;
                }
                else
                {
                    if(isNullOrUndefined(this.dataModel[dataId]))
                    {
                        this.dataModel[dataId] = [];
                    }
                    this.dataModel[dataId].push(data);
                }
            })
        );
    }

    /**
     * @deprecated use ModelCache instead
     */
    // TODO remove generic if the BaseService get a generic itself
    protected handleLocalDataModelDelete(deleteRequest$:Observable<Response>, dataId:number|string):Observable<void>
    {
        this.setAuthorization();

        return this.mapRequest(deleteRequest$).pipe(
            tap(() =>
            {
                Object.keys(this.dataModel).forEach((comparisonId:string) =>
                {
                    let dataIndex:number = this.dataModel[comparisonId].findIndex((data:any) => data.id === dataId);
                    if(dataIndex >= 0)
                    {
                        this.dataModel[comparisonId].splice(dataIndex, 1);
                    }
                });
            })
        );
    }

    private dispatchEvent(eventToDispatch:Event | CustomEvent):void
    {
        if(!isNullOrUndefined(window.parent))
        {
            // workaround for plugins in GWT (loaded via iFrame)
            if(!isNullOrUndefined(window.parent.window.parent))
            {
                window.parent.window.parent.window.dispatchEvent(eventToDispatch);
            }
            else
            {
                window.parent.window.dispatchEvent(eventToDispatch);
            }
        }
        else
        {
            window.dispatchEvent(eventToDispatch);
        }
    }

    // TODO use a meaningful error type
    private getErrorMessage(error:any):string
    {
        try
        {
            let errorMessage:string;

            if(!isNullOrUndefined(error.json().error))
            {
                errorMessage = error.json().error.message;
            }

            return errorMessage;
        }
        catch(e)
        {
            return null;
        }
    }

    // TODO use a meaningful error type
    private getErrorClass(error:any):string
    {
        try
        {
            let errorClass:string = error.json().class;
            return errorClass;
        }
        catch(e)
        {
            return null;
        }
    }

    /**
     * Handles exceptions that are returned from the server on a failed rest call
     * @param exception
     */
    // TODO rename exception to error and use a meaningful type
    private handleException(exception:any):void
    {
        if(!isObject(exception._body))
        {
            this._alert.addAlert({
                msg:              this.getErrorString() + ': ' + exception._body,
                type:             'danger',
                dismissOnTimeout: 0
            });
            return;
        }

        // parse response object
        let response:any = JSON.parse(exception._body);

        // check which exception type has been received
        if(!isNullOrUndefined(response.error) && !isNullOrUndefined(response.message))
        {
            if(this.isPlugin)
            {
                this._alert.addAlertForPlugin({
                    msg:              this.getErrorString() + ': ' + response.message,
                    type:             'danger',
                    dismissOnTimeout: 0
                });
            }
            else
            {
                this._alert.addAlert({
                    msg:              this.getErrorString() + ': ' + response.message,
                    type:             'danger',
                    dismissOnTimeout: 0
                });
            }
        }
        // return if error code is null
        else if(isNullOrUndefined(response.error) || isNull(response.error.code))
        {
            return;
        }
        // default exception type
        else
        {
            // parse exception string
            let error:Exception = response.error;

            // get error code
            let errorCode:string = error.code ? ' ' + error.code : '';

            if(this.isPlugin)
            {
                this._alert.addAlertForPlugin({
                    msg:              this.getErrorString() + errorCode + ': ' + error.message,
                    type:             'danger',
                    dismissOnTimeout: 0
                });
            }
            else
            {
                this._alert.addAlert({
                    msg:              this.getErrorString() + errorCode + ': ' + error.message,
                    type:             'danger',
                    dismissOnTimeout: 0
                });
            }
        }
    }

    private createArraySearchParams(key:string, params:Array<string>):URLSearchParams
    {
        let arraySearchParams:URLSearchParams = new URLSearchParams();

        params.forEach((param:string) =>
        {
            arraySearchParams.append(key + '[]', param);
        });

        return arraySearchParams;
    }

    private getMissingUserPermissionAlertMessage(error:any):string
    {
        let missingRights:string = '';
        let langInLocalStorage:string = localStorage.getItem('plentymarkets_lang_');
        let isGerman:boolean = langInLocalStorage === 'de';


        if(isGerman)
        {
            missingRights = 'Fehlende Berechtigungen für: <br/> • ';
        }
        else
        {
            missingRights = 'Missing permissions for: <br/> • ';
        }

        let body:{} = JSON.parse(error['_body']);

        if(!isNullOrUndefined(body))
        {
            let errorFromBody:{} = body['error'];

            if(!isNullOrUndefined(errorFromBody))
            {
                let missingPermissions:{ [key:string]:{ [key:string]:string } } = errorFromBody['missing_permissions'];

                let permissionTranslations:Array<{ [key:string]:string }> = [];

                Object.keys(missingPermissions).forEach((key:string) =>
                {
                    if(missingPermissions.hasOwnProperty(key))
                    {
                        permissionTranslations.push(missingPermissions[key]);
                    }
                });

                let english:Array<string> = [];
                let german:Array<string> = [];

                permissionTranslations.forEach((translations:{ [key:string]:string }) =>
                {
                    Object.keys(translations).forEach((key:string) =>
                    {
                        switch(key)
                        {
                            case 'de':
                                german.push(translations[key]);
                                break;
                            case 'en':
                                english.push(translations[key]);
                                break;
                        }
                    });
                });

                let concatedPermissions:string;

                if(isGerman)
                {
                    concatedPermissions = german.reverse().join('<br/> • ');
                }
                else
                {
                    concatedPermissions = english.reverse().join('<br/> • ');
                }

                missingRights += concatedPermissions;
            }
        }


        return missingRights;
    }

    private hasAllParamsLoaded(params:TerraBaseParameterInterface):boolean
    {
        if(!isNullOrUndefined(params) && !isNullOrUndefined(params['with']))
        {
            return Object.values(this.dataModel).every((value:any) =>
            {
                return params['with'].every((param:string) => value.hasOwnProperty(param));
            });
        }
        else
        {
            return true;
        }
    }
}