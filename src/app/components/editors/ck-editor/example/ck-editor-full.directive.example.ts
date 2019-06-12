import { Component } from '@angular/core';
import {
    ckEditorFullConfig,
    ckEditorMinimumConfig
} from '../presets/ck-editor-presets';
import {
    DomSanitizer,
    SafeHtml
} from '@angular/platform-browser';
import { Pipe, PipeTransform } from '@angular/core';

@Component({
    selector: 'tc-full-directive-example',
    template: require('./ck-editor-full.directive.example.html')
})
export class CkEditorFullDirectiveExample
{
    protected config:{} = ckEditorFullConfig;
    protected tiny:{} = ckEditorMinimumConfig;

    protected html:any;

}



@Pipe({ name: 'keepHtml', pure: false })
export class EscapeHtmlPipe implements PipeTransform
{
    constructor(private sanitizer:DomSanitizer)
    {
    }

    public transform(content:string):SafeHtml
    {
        return this.sanitizer.bypassSecurityTrustHtml(content);
    }
}
