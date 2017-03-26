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

    /**
     * Starts the conversion.
     * 
     * @param conversionType
     * The type to convert the document to.
     * 
     * @param path
     * The path to save the converted file to.
     */
    public Start(conversionType : ConversionType, path : string) : void
    {
        if (conversionType != ConversionType.HTML)
        {
            let type = this.getValueName(ConversionType, conversionType);
            let args = [
                Path.join(__dirname, 'Phantom', 'PDFGenerator.js'),
                type,
                this.document.toJSON(),
                Path.resolve(path)
            ];
            let result = childprocess.spawnSync(phantomjs.path, args);
            let error = result.stderr.toString();
            
            if (error)
            {
                throw new Error(error);
            }
        }
        else
        {
            FS.writeFileSync(path, this.document.HTML);
        }
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