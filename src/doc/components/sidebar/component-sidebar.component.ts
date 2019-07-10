import {
    Component,
    OnInit
} from '@angular/core';

@Component(
    {
        selector: 'component-sidebar',
        template: require('./component-sidebar.component.html'),
        styles:   [require('./component-sidebar.component.scss')]
    })
export class ComponentSidebarComponent implements OnInit
{
    private groupArray:Array<any> = [];
    private jsonMetaData:Array<any> = [];

    constructor()
    {
    }

    ngOnInit()
    {
        let componentGroup = [];

        for(let components of this.jsonMetaData)
        {
            let obGroup =
                {
                    groupName: components.componentGroup
                };
            componentGroup.push(obGroup);
        }

        this.groupArray = componentGroup.reduce(function(a, b)
        {
            if(a.indexOf(b.groupName) == -1)
            {
                a.push(b.groupName);
            }
            return a;
        }, []);

        componentGroup = [];
        let iterator = 0;

        for(let group of this.groupArray)
        {
            componentGroup.push([group]);
            componentGroup[iterator].push([]);
            iterator++;
        }

        for(let i in componentGroup)
        {
            for(let component of this.jsonMetaData)
            {
                if(component.componentGroup === componentGroup[i][0])
                {
                    componentGroup[i][1].push({component: component.name});
                }
            }
        }
        this.groupArray = componentGroup;
    }
}
