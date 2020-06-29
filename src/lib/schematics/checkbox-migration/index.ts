import {
    Rule,
    SchematicContext,
    SchematicsException,
    Tree,
    UpdateRecorder
} from '@angular-devkit/schematics';
import { LoggerApi } from '@angular-devkit/core/src/logger';
import { getProjectTsConfigPaths } from '@angular/core/schematics/utils/project_tsconfig_paths';
import { createMigrationProgram } from '../utils/compiler-hosts';
import * as ts from 'typescript';
import { relative } from 'path';
import { StringReplacementInterface } from '../string-replacement.interface';
import { stringsToReplace } from './property-replacements';

let logger:LoggerApi;

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function checkboxMigration(_options:any):Rule
{
    return (tree:Tree, context:SchematicContext):void =>
    {
        const {buildPaths, testPaths}:{ [key:string]:Array<string> } = getProjectTsConfigPaths(tree);
        const basePath:string = process.cwd();
        const allPaths:Array<string> = [...buildPaths,
                                        ...testPaths];

        logger = context.logger;

        if(!allPaths.length)
        {
            throw new SchematicsException(
                'Could not find any tsconfig file. Cannot migrate dynamic queries.');
        }

        for(const tsconfigPath of allPaths)
        {
            logger.info(tsconfigPath);
            runCkeckboxMigration(tree, tsconfigPath, basePath);
        }
    };
}

function runCkeckboxMigration(tree:Tree, tsconfigPath:string, basePath:string):void
{
    const program:ts.Program = createMigrationProgram(tree, tsconfigPath, basePath).program;
    // const typeChecker:ts.TypeChecker = program.getTypeChecker();
    const sourceFiles:Array<ts.SourceFile> = program.getSourceFiles().filter(
        (f:ts.SourceFile) => !f.isDeclarationFile && !program.isSourceFileFromExternalLibrary(f));
    // const printer = ts.createPrinter();

    // program.getSourceFiles().forEach((sourceFile:ts.SourceFile) => {
    //     logger.info(sourceFile.fileName);
    // });
    // logger.info(` Content before update: ${tree.read(relative(basePath, sourceFiles[4].referencedFiles.toString()))} `);

    sourceFiles.forEach((sourceFile:ts.SourceFile) =>
    {
        const fileName:string = relative(basePath, sourceFile.fileName);
        if(isComponent(fileName))
        {
            const templateFileName:string = fileName.replace('component.ts', 'component.html');
            if(tree.exists(templateFileName))
            {
                let buffer:Buffer | number = tree.read(templateFileName) || 0;
                let index:number = buffer.toString().indexOf('terra-checkbox');
                while(index >= 0)
                {
                    let startIndex:number = index;
                    let endIndex:number = buffer.toString().indexOf('/terra-checkbox');
                    let update:UpdateRecorder = tree.beginUpdate(templateFileName!);

                    replaceTemplateProperties(update, buffer, startIndex, endIndex);

                    update.remove(startIndex, 'terra-checkbox'.length);
                    update.insertRight(startIndex, 'mat-checkbox');
                    update.remove(endIndex, '/terra-checkbox'.length);
                    update.insertRight(endIndex, '/mat-checkbox');

                    tree.commitUpdate(update);
                    buffer = tree.read(templateFileName) || 0;
                    index = buffer.toString().indexOf('terra-checkbox');
                }
            }
        }
    });
}

function isComponent(fileName:string):boolean
{
    return fileName.endsWith('component.ts');
}

function replaceTemplateProperties(update:UpdateRecorder, buffer:Buffer | number, startIndex:number, endIndex:number):void
{
    stringsToReplace.forEach((query:StringReplacementInterface) =>
    {
        let queryIndex:number = buffer.toString().indexOf(query.query, startIndex);
        if(queryIndex > startIndex && queryIndex < endIndex)
        {
            update.remove(queryIndex, query.query.length);
            if(query.replacement !== null)
            {
                update.insertRight(queryIndex, query.replacement);
            }
        }
    });
    // TODO: remove inputCaption and put caption between span elements
    const captionRegEx:RegExp = new RegExp(`\\[?inputCaption\]?="(.*)"`);
    let captionValue:string = '';
    let caption:RegExpMatchArray | null = buffer.toString().match(captionRegEx); // \[?inputCaption\]?="(?:('[a-zA-Z0-9 ]*')|\{\{([a-zA-Z0-9 ]*)\}\}|[a-zA-Z0-9 ]*)"
    if(caption !== null && caption !== undefined)
    {
        captionValue = caption[1].toString();
        if(captionValue !== '')
        {
            logger.info(captionValue);
        }
    }
    else
    {
        logger.info('string not found');
    }
}
