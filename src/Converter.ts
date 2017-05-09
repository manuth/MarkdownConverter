import * as ChildProcess from 'child_process';
import * as FS from 'fs';
import * as Path from 'path';
import * as PhantomJS from 'phantomjs-prebuilt';
import * as Temp from 'temp';
import { Base } from "./Core/Base";
import { Document } from "./Document";
import { ConversionType, GetExtensions } from "./ConversionType";
import { PhantomJSTimeoutException } from "./Core/PhantomJSTimeoutException";
import { UnauthorizedAccessException } from "./Core/UnauthorizedAccessException";

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
            // Saving the JSON that represents the document to a temporary JSON-file.
            let jsonPath = Temp.path({ suffix: '.json'});
            {
                FS.writeFileSync(jsonPath, this.document.toJSON());
            }

            let destinationPath = Path.resolve(path);
            let tempPath = Temp.path({ suffix: GetExtensions()[conversionType] });
            let type = ConversionType[conversionType];
            let args = [
                Path.join(__dirname, 'Phantom', 'PDFGenerator.js'),
                type,
                jsonPath,
                tempPath
            ];
            let result = ChildProcess.spawnSync(PhantomJS.path, args, { timeout: 2 * 60 * 1000 });
            if (result.error)
            {
                if ('code' in result.error)
                {
                    if (result.error['code'] == 'ETIMEDOUT')
                    {
                        throw new PhantomJSTimeoutException();
                    }
                }
                throw result.error;
            }
            
            let error = result.stderr.toString();
            
            if (error)
            {
                throw new Error(error);
            }

            try
            {
                let buffer = FS.readFileSync(tempPath);
                FS.writeFileSync(destinationPath, buffer);
            }
            catch (e)
            {
                if ('path' in e)
                {
                    throw new UnauthorizedAccessException(e['path']);
                }
                throw e;
            }
            finally
            {
                if (FS.existsSync(tempPath))
                {
                    FS.unlinkSync(tempPath);
                }
                
                if (FS.existsSync(jsonPath))
                {
                    FS.unlinkSync(jsonPath);
                }
            }
        }
        else
        {
            FS.writeFileSync(path, this.document.HTML);
        }
    }
}