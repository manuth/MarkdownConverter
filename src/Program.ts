import * as ChildProcess from 'child_process';
import * as Format from 'string-format';
import * as FS from 'fs';
import * as MKDirP from 'mkdirp';
import * as NLS from 'vscode-nls';
import * as Path from 'path';
import { env, TextDocument, window } from 'vscode';
import { ConversionType, GetExtensions } from './Core/ConversionType';
import { Converter } from "./Converter";
import { Document } from './Document';
import { PhantomJSTimeoutException } from "./Core/PhantomJSTimeoutException";
import { UnauthorizedAccessException } from "./Core/UnauthorizedAccessException";

/**
 * Provides the main logic of the extension
 */
export class Program
{
    /**
     * Converts a markdown-file to other file-types
     */
    public static Main(textDocument : TextDocument, types : ConversionType[], outDir : string, fileName : string, autoSave : boolean) : void
    {
        let localize : any = NLS.config({ locale: env.language })(Path.join(__dirname, '..', '..', 'Resources', 'Localization', 'MarkdownConverter'));
        let doc : Document;

        if (textDocument.isUntitled || (textDocument.isDirty && autoSave))
        {
            doc = new Document();
            doc.Content = textDocument.getText();
        }
        else
        {
            if (textDocument.isDirty)
            {
                textDocument.save();
            }
            doc = new Document(textDocument.fileName);
        }

        let converter = new Converter(doc);
        let extensions = GetExtensions();

        types.forEach(type =>
        {
            if (!FS.existsSync(outDir))
            {
                MKDirP.sync(outDir);
            }

            try
            {
                let destination = Path.join(outDir, fileName + extensions[type]);
                converter.Start(type, destination);
                window.showInformationMessage(localize(0 /* "SuccessMesage" */, null, ConversionType[type], destination), localize(1 /* "OpenFileLabel" */, null)).then((label) =>
                {
                    if (label == localize(1 /* "OpenFileLabel" */, null))
                    {
                        ChildProcess.exec(Format('"{0}"', destination));
                    }
                });
            }
            catch (e)
            {
                let message = e.toString();
                if (e instanceof Error)
                {
                    if (e instanceof UnauthorizedAccessException)
                    {
                        message = localize(4 /* "UnauthorizedAccessException" */, null, e.Path);
                    }
                    else if (e instanceof PhantomJSTimeoutException)
                    {
                        message = localize(5 /* "PhantomJSTimeoutException" */, null);
                    }
                    else
                    {
                        message = localize(3 /* "UnknownException" */, null, e.name, e.message);
                    }
                }
                window.showErrorMessage(message);
            }
        });
    }
}