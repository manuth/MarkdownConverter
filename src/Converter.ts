import * as FS from 'fs';
import * as Path from 'path';
import * as phantomjs from 'phantomjs-prebuilt';
import * as childprocess from 'child_process';
import { Base } from "./Core/Base";
import { Document } from "./Document";
import { ConversionType } from "./ConversionType";

/**
 * Provides a markdown-converter.
 */
export class Converter
{
    /**
     * The document which is to be converted.
     */
    private document : Document = null;

    /**
     * Initializes a new instance of the Constructor class with a filepath.
     * 
     * @param document
     * The document which is to be converted.
     */
    constructor(document : Document)
    {
        this.document = document;
    }

    public Start(conversionType : ConversionType, path : string) : void
    {
        let type = this.getValueName(ConversionType, conversionType);
        let args = [
            Path.join(__dirname, 'Phantom', 'PDFGenerator.js'),
            type,
            this.document.toJSON(),
            Path.resolve(path)
        ];
        var result = childprocess.spawnSync(phantomjs.path, args);
        console.log(result.stderr.toString());
        console.log(result.stdout.toString());
    }

    private getValueName(enumObject : any, value : any)
    {
        let enumArray = [ ];
        let enumValues = { };
        for (var key in enumObject)
        {
            enumArray.push(key);
        }
        for (var i = (enumArray.length / 2) - 1; i >= 0; i--)
        {
            let key = enumArray[i];
            enumValues[key] = enumArray[(enumArray.length / 2) + i];
        }
        return enumValues[value];
    }
}