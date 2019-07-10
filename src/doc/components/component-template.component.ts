import { Component } from '@angular/core';

@Component(
    {
        selector: 'component-template',
        template: require('./component-template.component.html'),
        styles:   [require('./component-template.component.scss')]
    })
export class ComponentTemplateComponent
{
}
