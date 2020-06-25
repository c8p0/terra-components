import {
    Rule,
    SchematicContext,
    Tree,
    UpdateRecorder
} from '@angular-devkit/schematics';
import { from } from 'rxjs';
import { LoggerApi } from '@angular-devkit/core/src/logger';

const componentPath:string = './src/app/app.component.html';
// const componentPathTest:string = 'test.component.ts';

const queryStrings:Array<{queryString:string, replaceString:string}> = [
    {queryString: '[inputIsDisabled]', replaceString: '[disabled]'}
];

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function checkboxMigration(_options:any):Rule
{
    return (tree:Tree, context:SchematicContext) =>
    {
        return from(runMigration(tree, context).then(() => tree)) as any;
    };
}

async function runMigration(tree:Tree, context:SchematicContext)
{
    const logger:LoggerApi = context.logger;
    // tree.create(componentPathTest, 'console.log("Foobar!")');

    logger.info(`Content before update:\n${tree.read(componentPath)} `);

    if(tree.exists(componentPath))
    {
        let update:UpdateRecorder = tree.beginUpdate(componentPath!);
        let buffer:Buffer | number = tree.read(componentPath) || 0;

        queryStrings.forEach((query:{queryString:string, replaceString:string}) =>
        {
            update = replaceTemplateProperties(update, buffer, query.replaceString, query.queryString);
        });
        tree.commitUpdate(update);
    }

    logger.info(`Content after update:\n${tree.read(componentPath)}`);
}

function replaceTemplateProperties(update:UpdateRecorder, buffer:Buffer | number, replaceString:string, queryString:string):UpdateRecorder
{
    const startIndex:number = buffer.toString().indexOf(queryString);
    update.insertRight(startIndex, replaceString);
    update.remove(startIndex, queryString.length);
    return update;
}
