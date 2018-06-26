import * as ChildProcess from 'child_process';
import * as Format from 'string-format';
import * as FS from 'fs';
import * as MKDirP from 'mkdirp';
import * as NLS from 'vscode-nls';
import * as Path from 'path';
import { env, TextDocument, window } from 'vscode';
import ConversionType from './ConversionType';
import Converter from "./Converter";
import Document from './System/Drawing/Document';
import PhantomJSTimeoutException from "./System/Web/PhantomJS/PhantomJSTimeoutException";
import UnauthorizedAccessException from "./System/UnauthorizedAccessException";

/**
 * Provides the main logic of the extension
 */
export default class Program
{
    /**
     * Converts a markdown-file to other file-types
     */
    public static Main(textDocument: TextDocument, types: ConversionType[], outDir: string, fileName: string, autoSave: boolean): void
    {
        let localize: any = NLS.config({ locale: env.language })(Path.join(__dirname, '..', '..', 'Resources', 'Localization', 'MarkdownConverter'));
        let doc: Document;

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

        types.forEach(type =>
        {
            if (!FS.existsSync(outDir))
            {
                MKDirP.sync(outDir);
            }

            try
            {
                let extension: string;

                switch (type)
                {
                    case ConversionType.BMP:
                        extension = "bmp";
                        break;
                    case ConversionType.HTML:
                        extension = "html";
                        break;
                    case ConversionType.JPEG:
                        extension = "jpg";
                        break;
                    case ConversionType.PPM:
                        extension = "ppm";
                        break;
                    case ConversionType.PNG:
                        extension = "png";
                        break;
                    case ConversionType.PDF:
                    default:
                        extension = "pdf";
                        break;
                }

                let destination = Path.join(outDir, fileName + "." + extension);
                converter.Start(type, destination);
                window.showInformationMessage(localize(0 /* SuccessMessage */, null, ConversionType[type], destination), localize(1 /* OpenFileLabel */, null)).then((label) =>
                {
                    if (label == localize(1 /* OpenFileLabel */, null))
                    {
                        switch (process.platform)
                        {
                            case 'win32':
                                ChildProcess.exec(Format('"{0}"', destination));
                                break;
                            case 'darwin':
                                ChildProcess.exec(Format('bash -c \'open "{0}"\'', destination));
                                break;
                            case 'linux':
                                ChildProcess.exec(Format('bash -c \'xdg-open "{0}"\'', destination));
                                break;
                            default:
                                window.showWarningMessage(localize(10 /* NotSupportedException */));
                                break;
                        }
                    }
                });
            }
            catch (e)
            {
                let message = e.toString();
                if (e instanceof UnauthorizedAccessException)
                {
                    message = localize(5 /* UnauthorizedAccessException */, null, e.Path);
                }
                else if (e instanceof PhantomJSTimeoutException)
                {
                    message = localize(6 /* PhantomJSTimeoutException */, null);
                }
                else if (e instanceof Error)
                {
                    throw e;
                }
                window.showErrorMessage(message);
            }
        });
    }
}