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


let logger:LoggerApi;

const stringsToReplace:Array<StringReplacementInterface> = [
    {
        query:       '[inputIsDisabled]',
        replacement: '[disabled]'
    }
];

// You don't have to export the function as default. You can also have more than one rule factory
// per file.
export function checkboxMigration(_options:any):Rule
{
    return (tree:Tree, context:SchematicContext):void =>
    {
        const { buildPaths, testPaths }:{[key:string]:Array<string>} = getProjectTsConfigPaths(tree);
        const basePath:string = process.cwd();
        const allPaths:Array<string> = [...buildPaths, ...testPaths];

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
                let startIndex:number = buffer.toString().indexOf('terra-checkbox');
                let endIndex:number = buffer.toString().indexOf('/terra-checkbox');

                while(startIndex >= 0)
                {
                    let update:UpdateRecorder = tree.beginUpdate(templateFileName!);
                    update.remove(startIndex, 'terra-checkbox'.length);
                    update.insertRight(startIndex, 'mat-checkbox');
                    tree.commitUpdate(update);
                    stringsToReplace.forEach((query:StringReplacementInterface) =>
                    {
                        replaceTemplateProperties(update, buffer, query.replacement, query.query);
                    });
                    tree.commitUpdate(update);
                    buffer = tree.read(templateFileName) || 0;
                    startIndex = buffer.toString().indexOf('terra-checkbox');
                }
            }
        }
    });
}

function isComponent(fileName:string):boolean
{
    return fileName.endsWith('component.ts');
}

function replaceTemplateProperties(update:UpdateRecorder, buffer:Buffer | number, replaceString:string, queryString:string):void
{
    const startIndex:number = buffer.toString().indexOf(queryString);
    update.insertRight(startIndex, replaceString);
    update.remove(startIndex, queryString.length);
}
