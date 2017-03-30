import * as ChildProcess from 'child_process';
import * as Format from 'string-format';
import * as FS from 'fs';
import * as MKDirP from 'mkdirp';
import * as Path from 'path';
import { TextDocument, window } from 'vscode';
import { Converter } from "./Converter";
import { Document } from './Document';
import { ConversionType, GetExtensions } from './ConversionType';

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
        let Extensions = GetExtensions();

        types.forEach(type =>
        {
            if (!FS.existsSync(outDir))
            {
                MKDirP.sync(outDir);
            }

            try
            {
                let destination = Path.join(outDir, fileName + Extensions[type]);
                converter.Start(type, destination);
                window.showInformationMessage(Format('Successfully wrote the {0}-file to "{1}".', ConversionType[type], destination), 'Open File').then((label) =>
                {
                    if (label == 'Open File')
                    {
                        ChildProcess.exec(Format('"{0}"', destination));
                    }
                });
            }
            catch (error)
            {
                if (error instanceof Error)
                {
                    window.showErrorMessage(error.message);
                }
            }
        });
    }
}