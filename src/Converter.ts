import * as ChildProcess from 'child_process';
import * as FS from 'fs';
import * as Path from 'path';
import * as PhantomJS from 'phantomjs-prebuilt';
import * as Temp from 'temp';
import { Base } from "./Core/Base";
import { Document } from "./Document";
import { ConversionType, GetExtensions } from "./ConversionType";

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
            let destinationPath = Path.resolve(path);
            let tempPath = Temp.path({ suffix: GetExtensions()[conversionType] });
            let type = ConversionType[conversionType];
            let args = [
                Path.join(__dirname, 'Phantom', 'PDFGenerator.js'),
                type,
                this.document.toJSON(),
                tempPath
            ];
            let result = ChildProcess.spawnSync(PhantomJS.path, args);
            let error = result.stderr.toString();
            console.log(result.stdout.toString());
            
            if (error)
            {
                throw new Error(error);
            }

            try
            {
                let buffer = FS.readFileSync(tempPath);
                FS.writeFileSync(destinationPath, buffer);
            }
            catch (error)
            {
                if (error instanceof Error)
                {
                    throw(error);
                }
            }
            finally
            {
                if (FS.existsSync(tempPath))
                {
                    FS.unlinkSync(tempPath);
                }
            }
        }
        else
        {
            FS.writeFileSync(path, this.document.HTML);
        }
    }
}